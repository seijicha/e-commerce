const request = require('supertest');
const app = require('../../app');

describe('Application Bootstrap & Access Control Baselines', () => {
  it('serves secure security headers via helmet on home page', async () => {
    const res = await request(app).get('/');
    expect(res.headers).toHaveProperty('x-dns-prefetch-control');
    expect(res.headers).toHaveProperty('x-frame-options');
  });

  it('redirects unauthenticated guests hitting /cart to /login with returnTo', async () => {
    const res = await request(app).get('/cart');
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('/login?next=');
  });

  it('redirects unauthenticated guests hitting /checkout to /login with returnTo', async () => {
    const res = await request(app).get('/checkout');
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('/login?next=');
  });

  it('redirects unauthenticated visitors hitting /admin to /admin/login', async () => {
    const res = await request(app).get('/admin');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/admin/login');
  });

  it('serves 404 error page for non-existent routes and renders header cleanly', async () => {
    const res = await request(app).get('/non-existent-sector-123');
    expect(res.status).toBe(404);
    expect(res.text).toContain('404');
    expect(res.text).toContain('GLITCH');
    expect(res.text).toContain('ATTIRE');
  });

  it('filters catalog products by search query successfully', async () => {
    const res = await request(app).get('/shop?q=cyber');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Catalog');
  });

  it('filters catalog products by category and sort successfully and hides category dropdown on individual pages', async () => {
    const res = await request(app).get('/shop?category=hoodies-sweatshirts&sort=price_asc');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Hoodies &amp; Sweatshirts');
    expect(res.text).not.toContain('<select name="category"');
    expect(res.text).toContain('name="category" value="hoodies-sweatshirts"');
    expect(res.text).toContain('<select name="sort"');
    expect(res.text).toContain('value="price_asc" selected');
    expect(res.text).not.toContain('Accessories');
    expect(res.text).not.toContain('Outerwear &amp; Jackets');
  });

  it('filters catalog products by cargo & utility bottoms category and leaves only sort filter', async () => {
    const res = await request(app).get('/shop?category=bottoms-pants');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Cargo &amp; Utility Bottoms');
    expect(res.text).not.toContain('<select name="category"');
    expect(res.text).toContain('name="category" value="bottoms-pants"');
    expect(res.text).toContain('<select name="sort"');
    expect(res.text).toContain('Jet Black Crinkle Trucker Cargo Pants');
    expect(res.text).not.toContain('Accessories');
    expect(res.text).not.toContain('Outerwear &amp; Jackets');
  });

  it('renders sort filter dropdown on general All Drops page and omits category dropdown', async () => {
    const res = await request(app).get('/shop');
    expect(res.status).toBe(200);
    expect(res.text).not.toContain('<select name="category"');
    expect(res.text).toContain('<select name="sort"');
    expect(res.text).toContain('value="newest" selected');
    expect(res.text).toContain('value="oldest"');
    expect(res.text).not.toContain('Accessories');
    expect(res.text).not.toContain('Outerwear &amp; Jackets');
  });

  it('supports oldest first sort filter correctly', async () => {
    const res = await request(app).get('/shop?sort=oldest');
    expect(res.status).toBe(200);
    expect(res.text).toContain('value="oldest" selected');
  });

  it('removes badges from all product cards across home and catalog pages', async () => {
    const homeRes = await request(app).get('/');
    expect(homeRes.status).toBe(200);
    expect(homeRes.text).not.toContain('product-card__badge');
    expect(homeRes.text).not.toContain('ARCHIVE // DROP 01');

    const shopRes = await request(app).get('/shop');
    expect(shopRes.status).toBe(200);
    expect(shopRes.text).not.toContain('product-card__badge');
    expect(shopRes.text).not.toContain('ARCHIVE // DROP 01');
  });

  it('redirects customer login to home page (/) by default', async () => {
    const agent = request.agent(app);
    const loginPage = await agent.get('/login');
    const csrfMatch = loginPage.text.match(/name="_csrf"\s+value="([^"]+)"/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';

    const res = await agent.post('/login').type('form').send({
      _csrf: csrfToken,
      email: 'customer@glitchattire.test',
      password: 'password123'
    });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/');
  });

  it('redirects admin login to admin dashboard (/admin)', async () => {
    const agent = request.agent(app);
    const loginPage = await agent.get('/admin/login');
    const csrfMatch = loginPage.text.match(/name="_csrf"\s+value="([^"]+)"/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';

    const res = await agent.post('/admin/login').type('form').send({
      _csrf: csrfToken,
      email: 'admin@glitchattire.test',
      password: 'change_me_now'
    });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/admin');
  });

  it('renders visible error alert on failed customer login', async () => {
    const agent = request.agent(app);
    const loginPage = await agent.get('/login');
    const csrfMatch = loginPage.text.match(/name="_csrf"\s+value="([^"]+)"/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';

    const res = await agent.post('/login').type('form').send({
      _csrf: csrfToken,
      email: 'nonexistent@glitchattire.test',
      password: 'wrongpassword'
    });

    expect(res.status).toBe(401);
    expect(res.text).toContain('Invalid email or password');
  });

  it('renders auth prompt modal container for unauthenticated navigation on public pages', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('id="auth-prompt-dialog"');
    expect(res.text).toContain('id="auth-prompt-cancel"');
    expect(res.text).toContain('id="auth-prompt-confirm"');
  });

  it('renders footer community social icons and removes Discord and logistics hubs', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('aria-label="Instagram"');
    expect(res.text).toContain('aria-label="TikTok"');
    expect(res.text).toContain('aria-label="Twitter / X"');
    expect(res.text).toContain('aria-label="YouTube"');
    expect(res.text).not.toContain('aria-label="Discord"');
    expect(res.text).not.toContain('>DC<');
    expect(res.text).not.toContain('Logistics Hubs');
    expect(res.text).not.toContain('Berlin Terminal');
  });

  it('renders home street slideshow strip including Manila and Beijing street looks', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('class="street-strip"');
    expect(res.text).toContain('class="street-strip__track"');
    expect(res.text).toContain('/images/street_ph.jpg');
    expect(res.text).toContain('BGC, MANILA');
    expect(res.text).toContain('/images/street_china.webp');
    expect(res.text).toContain('SANLITUN, BEIJING');
  });

  it('renders home capsule grid with sequential scroll stagger attributes', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('data-scroll-stagger');
    expect(res.text).toContain('data-capsule-item');
    expect(res.text).toContain('--item-index: 0');
  });

  it('renders brand logo image in header and footer instead of plain text', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('/logo/logo.png');
    expect(res.text).toContain('class="brand-logo__img"');
    expect(res.text).not.toContain('GLITCH<span>ATTIRE</span>');
  });

  it('renders hero video with fullscreen intro and docking container instead of static image', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('/hero_vid.mp4');
    expect(res.text).toContain('data-hero-video-container');
    expect(res.text).toContain('data-hero-video');
    expect(res.text).toContain('data-hero-skip');
    expect(res.text).not.toContain('hero_streetwear.jpg');
  });

  it('renders checkout view with dynamic shipping fee calculation markup', async () => {
    const agent = request.agent(app);
    const loginPage = await agent.get('/login');
    const csrfMatch = loginPage.text.match(/name="_csrf"\s+value="([^"]+)"/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';

    await agent.post('/login').send({
      _csrf: csrfToken,
      email: 'customer@glitchattire.test',
      password: 'password123'
    });

    // Add product 1 (size M, variant 2) to cart
    await agent.post('/cart/items').send({
      _csrf: csrfToken,
      variant_id: 2,
      quantity: 1
    });

    const checkoutRes = await agent.get('/checkout');
    expect(checkoutRes.status).toBe(200);
    expect(checkoutRes.text).toContain('data-checkout-form');
    expect(checkoutRes.text).toContain('id="checkout-subtotal"');
    expect(checkoutRes.text).toContain('id="checkout-shipping-display"');
    expect(checkoutRes.text).toContain('id="checkout-total-display"');
  });

  afterAll(async () => {
    const defaultPool = require('../../config/db');
    await defaultPool.end();
  });
});
