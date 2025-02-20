import { z } from "zod";

// ISBN validation schema
export const isbn10Schema = z.string().regex(/^\d{9}[\dX]$/, "Invalid ISBN-10");
export const isbn13Schema = z.string().regex(/^\d{13}$/, "Invalid ISBN-13");

// EAN-13 validation schema
export const ean13Schema = z
  .string()
  .length(13, "Invalid EAN-13")
  .regex(/^\d{13}$/, "Invalid EAN-13");

// UPC validation schema
export const upcSchema = z
  .string()
  .length(12, "Invalid UPC")
  .regex(/^\d{12}$/, "Invalid UPC");

// ITF-14 validation schema
export const itf14Schema = z
  .string()
  .length(14, "Invalid ITF-14")
  .regex(/^\d{14}$/, "Invalid ITF-14");

// GTIN validation schema (handles ISBN, EAN, UPC, ITF-14, and others)
export const gtinSchema = z
  .union([
    isbn10Schema.transform(() => ({ version: "ISBN-10" })),
    isbn13Schema.transform(() => ({ version: "ISBN-13" })),
    ean13Schema.transform(() => ({ version: "EAN-13" })),
    upcSchema.transform(() => ({ version: "UPC" })),
    itf14Schema.transform(() => ({ version: "ITF-14" })),
  ])
  .refine((result) => result.version, {
    message: "Invalid GTIN code",
  });

// Example usage:

// Test for valid GTIN-13 (EAN-13)
const result = gtinSchema.safeParse("1234567890123");
if (result.success) {
  console.log("Valid GTIN:", result.data); // { version: "EAN-13" }
} else {
  console.log("Invalid GTIN:", result.error.errors);
}
