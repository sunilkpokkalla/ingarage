/**
 * Tekmetric-style Markup Matrix
 * Calculates the selling price for the customer based on the wholesale cost of the part.
 */
export function calculateSellingPrice(cost: number): number {
  if (!cost || cost <= 0) return 0;
  
  if (cost < 50) {
    // 100% markup for cheap parts
    return cost * 2.0;
  } else if (cost <= 200) {
    // 75% markup for mid-range parts
    return cost * 1.75;
  } else {
    // 50% markup for expensive parts
    return cost * 1.5;
  }
}

export function calculateProfitMargin(cost: number, sellingPrice: number): string {
  if (!cost || cost <= 0) return '0%';
  const profit = sellingPrice - cost;
  const margin = (profit / sellingPrice) * 100;
  return `${margin.toFixed(0)}%`;
}
