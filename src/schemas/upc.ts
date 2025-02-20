import { z } from "zod";

// Function to calculate check digit for UPC
export const calculateCheckDigit = (upc: string): number => {
  const digits = upc.split("").map(Number);
  const sumOdd = digits
    .filter((_, index) => index % 2 === 0)
    .reduce((acc, curr) => acc + curr, 0);
  const sumEven = digits
    .filter((_, index) => index % 2 !== 0)
    .reduce((acc, curr) => acc + curr, 0);
  const total = sumOdd * 3 + sumEven;
  const mod = total % 10;
  return mod === 0 ? 0 : 10 - mod;
};

// Zod schema for validating UPC
export const upcSchema = z
  .string()
  .length(12)
  .regex(/^\d{12}$/, "UPC must be 12 digits")
  .refine(
    (upc) => {
      const checkDigit = calculateCheckDigit(upc.slice(0, 11)); // Only consider the first 11 digits
      return checkDigit === Number(upc[11]); // Compare check digit
    },
    {
      message: "Invalid UPC check digit",
    },
  );
