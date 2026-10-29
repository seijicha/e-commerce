const { calculateShippingFee, SHIPPING_RATES } = require('../../../utils/shipping');

describe('Shipping Fee Calculation Engine', () => {
  it('calculates free shipping for Metro Manila destinations', () => {
    const manila = calculateShippingFee('Philippines', 'Manila');
    expect(manila.fee).toBe(SHIPPING_RATES.METRO_MANILA);
    expect(manila.zone).toBe('manila');

    const makati = calculateShippingFee('Philippines', 'Makati City');
    expect(makati.fee).toBe(0);
    expect(makati.zone).toBe('manila');

    const bgc = calculateShippingFee('Philippines', 'Taguig / BGC');
    expect(bgc.fee).toBe(0);
    expect(bgc.zone).toBe('manila');
  });

  it('calculates provincial delivery fee for locations outside Manila within the Philippines', () => {
    const cebu = calculateShippingFee('Philippines', 'Cebu City');
    expect(cebu.fee).toBe(SHIPPING_RATES.PROVINCIAL);
    expect(cebu.fee).toBe(150.0);
    expect(cebu.zone).toBe('provincial');

    const davao = calculateShippingFee('Philippines', 'Davao City');
    expect(davao.fee).toBe(150.0);
    expect(davao.zone).toBe('provincial');

    const baguio = calculateShippingFee('Philippines', 'Baguio City');
    expect(baguio.fee).toBe(150.0);
    expect(baguio.zone).toBe('provincial');
  });

  it('calculates international express shipping fee for orders outside the country', () => {
    const tokyo = calculateShippingFee('Japan', 'Tokyo');
    expect(tokyo.fee).toBe(SHIPPING_RATES.INTERNATIONAL);
    expect(tokyo.fee).toBe(1200.0);
    expect(tokyo.zone).toBe('international');

    const usa = calculateShippingFee('United States', 'New York');
    expect(usa.fee).toBe(1200.0);
    expect(usa.zone).toBe('international');

    const germany = calculateShippingFee('Germany', 'Berlin');
    expect(germany.fee).toBe(1200.0);
    expect(germany.zone).toBe('international');
  });
});
