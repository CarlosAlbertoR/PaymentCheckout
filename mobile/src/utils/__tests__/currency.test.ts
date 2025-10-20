import {
  formatPriceCOP,
  formatPriceCOPDecimal,
  formatTotalCOP,
} from "../currency";

describe("Currency Utils (amounts in centavos)", () => {
  describe("formatPriceCOP", () => {
    it("should format price without decimals", () => {
      expect(formatPriceCOP(1000)).toBe("$10");
      expect(formatPriceCOP(5000)).toBe("$50");
      expect(formatPriceCOP(100000)).toBe("$1.000");
    });

    it("should handle zero amount", () => {
      expect(formatPriceCOP(0)).toBe("$0");
    });

    it("should handle small amounts", () => {
      // 50 centavos rounds to $1 when shown without decimals
      expect(formatPriceCOP(50)).toBe("$1");
      expect(formatPriceCOP(99)).toBe("$1");
    });
  });

  describe("formatPriceCOPDecimal", () => {
    it("should format price with decimals", () => {
      expect(formatPriceCOPDecimal(1000)).toBe("$10,00");
      expect(formatPriceCOPDecimal(5000)).toBe("$50,00");
      expect(formatPriceCOPDecimal(100000)).toBe("$1.000,00");
    });

    it("should handle zero amount with decimals", () => {
      expect(formatPriceCOPDecimal(0)).toBe("$0,00");
    });

    it("should handle small amounts with decimals", () => {
      expect(formatPriceCOPDecimal(50)).toBe("$0,50");
      expect(formatPriceCOPDecimal(99)).toBe("$0,99");
    });
  });

  describe("formatTotalCOP", () => {
    it("should format total with COP suffix", () => {
      expect(formatTotalCOP(1000)).toBe("$10 COP");
      expect(formatTotalCOP(5000)).toBe("$50 COP");
      expect(formatTotalCOP(100000)).toBe("$1.000 COP");
    });

    it("should handle zero total", () => {
      expect(formatTotalCOP(0)).toBe("$0 COP");
    });

    it("should handle small totals", () => {
      expect(formatTotalCOP(50)).toBe("$1 COP");
      expect(formatTotalCOP(99)).toBe("$1 COP");
    });
  });
});
