-- Seed categories
INSERT INTO categories (id, name, slug) VALUES
  (1, 'Graphic Tees', 'graphic-tees'),
  (2, 'Hoodies & Sweatshirts', 'hoodies-sweatshirts'),
  (4, 'Cargo & Utility Bottoms', 'bottoms-pants')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Seed demo customer account (password: password123)
INSERT INTO users (id, name, email, password_hash, role, phone, is_active) VALUES
  (1, 'Neo Vance', 'customer@glitchattire.test', '$2b$12$cK9NgEMCqaOh06u7FCbgU.Nene6TUFGSIlKI2dj.2N0I/trJMgvom', 'customer', '+639171234567', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), is_active = 1;

-- Seed realistic apparel products
INSERT INTO products (id, category_id, name, slug, description, price, image_path, is_published, created_by) VALUES
  (
    1,
    2,
    'Cyber Glitch Oversized Hoodie',
    'cyber-glitch-oversized-hoodie',
    'Heavyweight 450 GSM French Terry cotton hoodie with custom distorted glitch embroidery across the chest, double-layered hood, and ribbed side panelling.',
    2899.00,
    '/images/products/glitch-hoodie.jpg',
    1,
    NULL
  ),
  (
    2,
    1,
    'Neon Protocol Heavyweight Tee',
    'neon-protocol-heavyweight-tee',
    'Boxy-fit 280 GSM combed cotton tee featuring high-density neon screenprint graphics and raw-cut shoulder details.',
    1299.00,
    '/images/products/protocol-tee.jpg',
    1,
    NULL
  ),
  (
    4,
    4,
    'Void Tech Cargo Joggers',
    'void-tech-cargo-joggers',
    'Relaxed tapered cargo trousers constructed from stretch cotton twill with articulated knees, utility strap pockets, and bungee hem toggles.',
    2499.00,
    '/images/products/tech-cargo.jpg',
    1,
    NULL
  ),
  (
    6,
    1,
    'Binary Decay Acid-Wash Tee',
    'binary-decay-acid-wash-tee',
    'Vintage charcoal mineral-wash vintage tee with distressed typographic prints and reinforced crewneck collar.',
    1399.00,
    '/images/products/decay-tee.jpg',
    1,
    NULL
  ),
  -- 13 Uploaded Streetwear Products
  -- Category 2: Hoodies & Fleece
  (
    7,
    2,
    'Fallen Seraph Thorn-Sleeve Heavyweight Hoodie',
    'fallen-seraph-thorn-sleeve-heavyweight-hoodie',
    'Heavyweight 500 GSM washed charcoal French Terry cotton hoodie with dropped shoulders and double-layer hood. Features an intricate gothic anime winged seraph with crown of thorns and crucifix chains, accented with white thorn bramble graphics running down both sleeves.',
    3199.00,
    '/uploads/products/hoodies/15a0f88c-6245-4c37-8481-13fd10852607.48a226c1291117eed83bb9d2e0f68edb.webp',
    1,
    NULL
  ),
  (
    8,
    2,
    'Gothic Archangel Cream Heavyweight Hoodie',
    'gothic-archangel-cream-heavyweight-hoodie',
    'Dense 480 GSM off-white luxury fleece hoodie with relaxed boxy silhouette. Distressed center front gothic winged archangel with filigree cross emblems, flanked by black barbed thorn screenprints stretching along the sleeves.',
    2999.00,
    '/uploads/products/hoodies/718WhVyyqQL._AC_UY1000_.jpg',
    1,
    NULL
  ),
  (
    9,
    2,
    'Amazing Scream Cyber Acid-Wash Hoodie',
    'amazing-scream-cyber-acid-wash-hoodie',
    'Vintage mineral acid-wash charcoal black heavyweight fleece. Features an intense distressed horror scream portrait with crackle-effect AMAZING stencil lettering, retro stars, How Are You Honey? typography, and cracked sleeve graphics.',
    2899.00,
    '/uploads/products/hoodies/71n-874NriL._AC_UY1000_.jpg',
    1,
    NULL
  ),
  -- Category 1: Graphic Tees
  (
    10,
    1,
    'Neon Angel Barbed Wire Boxy Tee',
    'neon-angel-barbed-wire-boxy-tee',
    'Boxy-fit 280 GSM heavyweight jet black combed cotton. Front screenprint features a neon magenta classical winged statue, geometric GOD DONT LIKE UGLY outline typography, yellow quote lettering, and a barbed wire divider.',
    1499.00,
    '/uploads/products/graphic_tees/19447_l_a-black-t-shirt-with-a-pink-statue-and-white-text.webp',
    1,
    NULL
  ),
  (
    11,
    1,
    'Glory Chromatic Aura Angel Tee',
    'glory-chromatic-aura-angel-tee',
    'Relaxed 260 GSM boxy black cotton tee with an oversized statement back print displaying distressed white serif GLORY typography above a purple classical statue with vivid RGB chromatic aberration aura and poetic verse.',
    1399.00,
    '/uploads/products/graphic_tees/B1rRsg99CQL._CLa_2140,2000_A1vJDmkpaGL.png_0,0,2140,2000+0.0,0.0,2140.0,2000.0_AC_UY1000_.jpg',
    1,
    NULL
  ),
  (
    12,
    1,
    'Worldwide Cyber Grid Tech Tee',
    'worldwide-cyber-grid-tech-tee',
    'Heavyweight 270 GSM streetwear tee in jet black. High-visibility cyber lime green graphic featuring technical wireframe globe geometry, world map coordinate grid, and urban division typographic data blocks.',
    1299.00,
    '/uploads/products/graphic_tees/il_570xN.4617875256_513r.webp',
    1,
    NULL
  ),
  (
    13,
    1,
    'Illusion Optical Warp Heavyweight Tee',
    'illusion-optical-warp-heavyweight-tee',
    'Heavyweight 275 GSM relaxed-fit black cotton tee with muted dusty rose ILLUSION branding over dual optical distortion warp wave boxes, wireframe globe glyphs, and directional techwear chevrons.',
    1349.00,
    '/uploads/products/graphic_tees/il_570xN.4618041348_5zn2.webp',
    1,
    NULL
  ),
  -- Category 4: Cargo & Utility Bottoms
  (
    14,
    4,
    'Jet Black Crinkle Trucker Cargo Pants',
    'jet-black-crinkle-trucker-cargo-pants',
    'Relaxed straight-leg technical cargo trousers cut from durable crinkled nylon-cotton blend. Features dual angular bellows utility thigh pockets, reinforced waistband, and clean tailored cuff drop over sneakers.',
    2899.00,
    '/uploads/products/cargo/0002__0148_022125_SS25DROP2_TECHCARGOPANT_CRINKLETRUCKETJACKET_JETBLACK_1_fcf01958-8d02-449d-bdfc-32f0425869f9.avif',
    1,
    NULL
  ),
  (
    15,
    4,
    'Riot Camo Distressed Bellows Cargo Trousers',
    'riot-camo-distressed-bellows-cargo-trousers',
    'Heavyweight custom stone and earth riot camouflage print twill trousers. Wide relaxed silhouette with dual stacked cargo pockets, articulated knee pleating, and adjustable ankle cinch cords.',
    3299.00,
    '/uploads/products/cargo/0054_JawbreakerPuffer-RiotCamoPrint-15.avif',
    1,
    NULL
  ),
  (
    16,
    4,
    'Tactical Khaki Multi-Pocket Cargo Shorts',
    'tactical-khaki-multi-pocket-cargo-shorts',
    'Rugged khaki cotton canvas utility shorts. Above-knee cut engineered with oversized dual-entry flap cargo pockets, double-stitched belt loops with silver hardware chain hook, and reinforced seat.',
    2199.00,
    '/uploads/products/cargo/EHkLg4Vp6JWkCaltbBGUH2u1ujsiHccD0tpl-Wwi9iI.avif',
    1,
    NULL
  ),
  (
    17,
    4,
    'Architectural Cream 3D Bellows Cargo Shorts',
    'architectural-cream-3d-bellows-cargo-shorts',
    'Structured raw-tone ecru cream heavyweight twill shorts. Clean architectural tailoring with protruding 3D bellows flap compartments and deep slash hip pockets.',
    2299.00,
    '/uploads/products/cargo/LJDWprQnryikLizi4eXQt7b81r4rDw2PYfVONW51caM.avif',
    1,
    NULL
  ),
  (
    18,
    4,
    'Woodland Camo Baggy Utility Cargo Shorts',
    'woodland-camo-baggy-utility-cargo-shorts',
    'Oversized knee-length vintage woodland camo ripstop cargo shorts. Double pleated utility side pockets, reinforced zip fly, and baggy skater streetwear drape.',
    2199.00,
    '/uploads/products/cargo/nMaBkioWq--syMpmsaPulL-tK4ihnKD0U32ddUgs8-w.avif',
    1,
    NULL
  ),
  (
    19,
    4,
    'Stacked Multi-Pocket Sand Cargo Trousers',
    'stacked-multi-pocket-sand-cargo-trousers',
    'Relaxed-leg sand khaki technical cargo pants with tiered double cargo pockets extending along the thighs and lower calves, finished with ankle bungee drawcords for adjustable stacking.',
    2999.00,
    '/uploads/products/cargo/webresmodelsss24_0091_SS24DROP1modelecom_0003_SS24DROP1ECOM9431copy2.avif',
    1,
    NULL
  )
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), price = VALUES(price), image_path = VALUES(image_path);

-- Seed product size variants and stock
INSERT INTO product_variants (product_id, size, stock) VALUES
  -- Cyber Glitch Oversized Hoodie
  (1, 'S', 15),
  (1, 'M', 25),
  (1, 'L', 30),
  (1, 'XL', 20),
  (1, 'XXL', 8),

  -- Neon Protocol Heavyweight Tee
  (2, 'XS', 10),
  (2, 'S', 30),
  (2, 'M', 45),
  (2, 'L', 40),
  (2, 'XL', 25),

  -- Void Tech Cargo Joggers
  (4, 'S', 12),
  (4, 'M', 28),
  (4, 'L', 32),
  (4, 'XL', 16),

  -- Binary Decay Acid-Wash Tee
  (6, 'S', 20),
  (6, 'M', 35),
  (6, 'L', 30),
  (6, 'XL', 15),

  -- 7. Fallen Seraph Thorn-Sleeve Heavyweight Hoodie
  (7, 'S', 18),
  (7, 'M', 30),
  (7, 'L', 35),
  (7, 'XL', 22),
  (7, 'XXL', 10),

  -- 8. Gothic Archangel Cream Heavyweight Hoodie
  (8, 'S', 15),
  (8, 'M', 28),
  (8, 'L', 32),
  (8, 'XL', 18),
  (8, 'XXL', 8),

  -- 9. Amazing Scream Cyber Acid-Wash Hoodie
  (9, 'S', 20),
  (9, 'M', 35),
  (9, 'L', 40),
  (9, 'XL', 25),
  (9, 'XXL', 12),

  -- 10. Neon Angel Barbed Wire Boxy Tee
  (10, 'S', 25),
  (10, 'M', 40),
  (10, 'L', 45),
  (10, 'XL', 30),

  -- 11. Glory Chromatic Aura Angel Tee
  (11, 'S', 20),
  (11, 'M', 35),
  (11, 'L', 38),
  (11, 'XL', 24),

  -- 12. Worldwide Cyber Grid Tech Tee
  (12, 'S', 30),
  (12, 'M', 50),
  (12, 'L', 45),
  (12, 'XL', 28),

  -- 13. Illusion Optical Warp Heavyweight Tee
  (13, 'S', 22),
  (13, 'M', 40),
  (13, 'L', 42),
  (13, 'XL', 26),

  -- 14. Jet Black Crinkle Trucker Cargo Pants
  (14, 'S', 14),
  (14, 'M', 28),
  (14, 'L', 30),
  (14, 'XL', 18),

  -- 15. Riot Camo Distressed Bellows Cargo Trousers
  (15, 'S', 12),
  (15, 'M', 22),
  (15, 'L', 26),
  (15, 'XL', 14),

  -- 16. Tactical Khaki Multi-Pocket Cargo Shorts
  (16, '30', 20),
  (16, '32', 35),
  (16, '34', 30),
  (16, '36', 15),

  -- 17. Architectural Cream 3D Bellows Cargo Shorts
  (17, '30', 18),
  (17, '32', 30),
  (17, '34', 28),
  (17, '36', 14),

  -- 18. Woodland Camo Baggy Utility Cargo Shorts
  (18, '30', 22),
  (18, '32', 40),
  (18, '34', 35),
  (18, '36', 18),

  -- 19. Stacked Multi-Pocket Sand Cargo Trousers
  (19, 'S', 16),
  (19, 'M', 30),
  (19, 'L', 32),
  (19, 'XL', 20)
ON DUPLICATE KEY UPDATE stock = VALUES(stock);
