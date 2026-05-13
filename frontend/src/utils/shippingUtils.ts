/**
 * Utility to calculate dynamic shipping charges based on distance.
 * This is an estimation based on City/Country.
 */

const STORE_LOCATION = {
  city: 'Dubai',
  country: 'UAE'
};

// Simplified distance-based pricing (per item)
export const calculateShippingCharge = (
  userAddress: { city: string; country: string },
  product: { applyShippingCharges: boolean; shippingCharges: number }
) => {
  if (!product.applyShippingCharges) return 0;

  const userCity = userAddress.city?.toLowerCase() || '';
  const userCountry = userAddress.country?.toLowerCase() || '';
  const baseRate = Number(product.shippingCharges) || 0;

  // 1. Same City -> Very Cheap
  if (userCity === STORE_LOCATION.city.toLowerCase() && userCountry === STORE_LOCATION.country.toLowerCase()) {
    return baseRate + 2; 
  }

  // 2. Same Country -> Moderate
  if (userCountry === STORE_LOCATION.country.toLowerCase()) {
    return baseRate + 10;
  }

  // 3. International -> High
  // We can add specific regions here
  const middleEast = ['saudi arabia', 'oman', 'qatar', 'kuwait', 'bahrain'];
  if (middleEast.includes(userCountry)) {
    return baseRate + 25;
  }

  // 4. Rest of World
  return baseRate + 50; 
};
