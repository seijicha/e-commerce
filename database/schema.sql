CREATE DATABASE IF NOT EXISTS glitchattire
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE glitchattire;

-- Users table (Customers and Admins)
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  phone         VARCHAR(30)   NULL,
  is_active     TINYINT(1)    NOT NULL DEFAULT 1,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(80)  NOT NULL UNIQUE,
  slug       VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id  INT UNSIGNED NOT NULL,
  name         VARCHAR(150) NOT NULL,
  slug         VARCHAR(180) NOT NULL UNIQUE,
  description  TEXT NULL,
  price        DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  image_path   VARCHAR(255) NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_by   INT UNSIGNED NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by)  REFERENCES users(id)      ON DELETE SET NULL,
  INDEX idx_products_listing (is_published, category_id, created_at),
  FULLTEXT INDEX ft_products_search (name, description)
) ENGINE=InnoDB;

-- Product variants (sizes and stock)
CREATE TABLE IF NOT EXISTS product_variants (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  size       VARCHAR(10)  NOT NULL,                  -- XS, S, M, L, XL, XXL, ONE SIZE
  stock      INT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uq_product_size (product_id, size),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Customer shopping cart items
CREATE TABLE IF NOT EXISTS cart_items (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  variant_id INT UNSIGNED NOT NULL,
  quantity   SMALLINT UNSIGNED NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cart_user_variant (user_id, variant_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)            ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number         VARCHAR(20) NOT NULL UNIQUE,          -- e.g. GA-20261029-0001
  user_id              INT UNSIGNED NULL,
  status               ENUM('pending','paid','shipped','delivered','cancelled')
                       NOT NULL DEFAULT 'pending',
  payment_method       VARCHAR(20) NOT NULL DEFAULT 'cod',
  subtotal             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  shipping_fee         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total                DECIMAL(10,2) NOT NULL,
  shipping_name        VARCHAR(100) NOT NULL,
  shipping_phone       VARCHAR(30)  NOT NULL,
  shipping_address     VARCHAR(255) NOT NULL,
  shipping_city        VARCHAR(100) NOT NULL,
  shipping_postal_code VARCHAR(20)  NOT NULL,
  shipping_country     VARCHAR(100) NOT NULL DEFAULT 'Philippines',
  created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_orders_user (user_id, created_at),
  INDEX idx_orders_status (status, created_at)
) ENGINE=InnoDB;

-- Order items (immutable snapshot of product, variant, and price)
CREATE TABLE IF NOT EXISTS order_items (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id     INT UNSIGNED NOT NULL,
  product_id   INT UNSIGNED NULL,
  variant_id   INT UNSIGNED NULL,
  product_name VARCHAR(150) NOT NULL,                 -- snapshot
  size         VARCHAR(10)  NOT NULL,                 -- snapshot
  unit_price   DECIMAL(10,2) NOT NULL,                -- snapshot
  quantity     SMALLINT UNSIGNED NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)           ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)         ON DELETE SET NULL,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Admin mutations and authentication audit trail
CREATE TABLE IF NOT EXISTS audit_logs (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NULL,
  action     VARCHAR(50)  NOT NULL,                   -- created, updated, deleted, login, logout
  entity     VARCHAR(50)  NOT NULL,                   -- product, category, order, user
  entity_id  INT UNSIGNED NULL,
  old_values JSON NULL,
  new_values JSON NULL,
  ip_address VARCHAR(45)  NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_entity (entity, entity_id),
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB;

-- Express MySQL Session Store
CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL PRIMARY KEY,
  expires    INT(11) UNSIGNED NOT NULL,
  data       MEDIUMTEXT COLLATE utf8mb4_bin NULL,
  INDEX idx_sessions_expires (expires)
) ENGINE=InnoDB;
