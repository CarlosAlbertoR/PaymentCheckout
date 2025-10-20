/**
 * Utility functions for currency formatting
 */

/**
 * Formats a price in centavos to COP currency display
 * @param priceInCentavos - Price in centavos (e.g., 1000 = $10.00 COP)
 * @returns Formatted price string (e.g., "$10.00")
 */
export const formatPriceCOP = (priceInCentavos: number): string => {
  const priceInPesos = priceInCentavos / 100;
  return `$${priceInPesos.toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

/**
 * Formats a price in centavos to COP currency display with decimals
 * @param priceInCentavos - Price in centavos (e.g., 1000 = $10.00 COP)
 * @returns Formatted price string with decimals (e.g., "$10.00")
 */
export const formatPriceCOPDecimal = (priceInCentavos: number): string => {
  const priceInPesos = priceInCentavos / 100;
  return `$${priceInPesos.toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Formats a price in centavos to COP currency display for totals
 * @param priceInCentavos - Price in centavos (e.g., 1000 = $10.00 COP)
 * @returns Formatted price string for totals (e.g., "$10.00 COP")
 */
export const formatTotalCOP = (priceInCentavos: number): string => {
  const priceInPesos = priceInCentavos / 100;
  return `$${priceInPesos.toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} COP`;
};
