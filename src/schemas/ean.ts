import { z } from "zod";

export const eanVersions = [
  "8", // EAN-8
  "13", // EAN-13
  "14", // EAN-14
  "128", // EAN-128
  "8P2", // EAN-8 P2
  "13P2", // EAN-13 P2
  "8P5", // EAN-8 P5
  "13P5", // EAN-13 P5
] as const;

// Function to calculate check digit for EAN-13 and EAN-8
const calculateEANCheckDigit = (ean: string): number => {
  const digits = ean.split("").map(Number);
  const sumOdd = digits
    .filter((_, index) => index % 2 === 0)
    .reduce((acc, curr) => acc + curr, 0);
  const sumEven = digits
    .filter((_, index) => index % 2 !== 0)
    .reduce((acc, curr) => acc + curr * 3, 0);

  const total = sumOdd + sumEven;
  const mod = total % 10;
  return mod === 0 ? 0 : 10 - mod;
};

// EAN-8: 8 digits, check digit included
export const ean8Schema = z
  .string()
  .regex(/^\d{8}$/, { message: "EAN-8 must be exactly 8 digits" })
  .refine(
    (ean) => {
      return ean[7] === String(calculateEANCheckDigit(ean.slice(0, 7)));
    },
    { message: "Invalid check digit for EAN-8" },
  );

// EAN-13: 13 digits, check digit included
export const ean13Schema = z
  .string()
  .regex(/^\d{13}$/, { message: "EAN-13 must be exactly 13 digits" })
  .refine(
    (ean) => {
      return ean[12] === String(calculateEANCheckDigit(ean.slice(0, 12)));
    },
    { message: "Invalid check digit for EAN-13" },
  );

// EAN-14: 14 digits, first digit is packaging indicator
export const ean14Schema = z
  .string()
  .regex(/^\d{14}$/, { message: "EAN-14 must be exactly 14 digits" });

// EAN-128: Alphanumeric, used for logistics, food, and custom data (beyond GTIN)
export const ean128Schema = z
  .string()
  .regex(/^[A-Za-z0-9]+$/, { message: "EAN-128 must be alphanumeric" })
  .min(8, { message: "EAN-128 must be at least 8 characters long" });

// Validations for extended EAN8 and EAN13 variants (with extra digits)
export const ean8P2Schema = z
  .string()
  .regex(/^\d{8}\d{2}$/, {
    message: "EAN-8 P2 must be 8 digits followed by 2 extra digits",
  });
export const ean8P5Schema = z
  .string()
  .regex(/^\d{8}\d{5}$/, {
    message: "EAN-8 P5 must be 8 digits followed by 5 extra digits",
  });

export const ean13P2Schema = z
  .string()
  .regex(/^\d{13}\d{2}$/, {
    message: "EAN-13 P2 must be 13 digits followed by 2 extra digits",
  });
export const ean13P5Schema = z
  .string()
  .regex(/^\d{13}\d{5}$/, {
    message: "EAN-13 P5 must be 13 digits followed by 5 extra digits",
  });

// Main EAN Schema that combines all variants
export const eanSchema = z.union([
  ean8Schema,
  ean13Schema,
  ean14Schema,
  ean128Schema,
  ean8P2Schema,
  ean8P5Schema,
  ean13P2Schema,
  ean13P5Schema,
]);

// Function to validate EAN codes and return the type of EAN
export function validateEAN(ean: string) {
  const result = eanSchema.safeParse(ean);

  if (result.success) {
    return result.data; // Return the valid EAN code
  } else {
    return null;
  }
}
