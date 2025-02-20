import { z } from "zod";

// Function to calculate ISBN-10 check digit
const calculateISBN10CheckDigit = (isbn: string): string => {
  const digits = isbn
    .split("")
    .map((char) => (char === "X" ? 10 : Number(char)));
  const sum = digits.reduce((acc, curr, index) => acc + curr * (10 - index), 0);
  const mod = sum % 11;
  return mod === 0 ? "0" : mod === 10 ? "X" : String(mod);
};

// Function to calculate ISBN-13 check digit
const calculateISBN13CheckDigit = (isbn: string): string => {
  const digits = isbn.split("").map(Number);
  const sum = digits.reduce(
    (acc, curr, index) => acc + curr * (index % 2 === 0 ? 1 : 3),
    0,
  );
  const mod = sum % 10;
  return mod === 0 ? "0" : String(10 - mod);
};

// Zod schema for validating ISBN-10 and ISBN-13
export const isbnSchema = z.string().refine(
  (isbn) => {
    const length = isbn.length;

    // ISBN-10 validation
    if (length === 10) {
      if (/^\d{9}[\dX]$/.test(isbn)) {
        const checkDigit = calculateISBN10CheckDigit(isbn.slice(0, 9)); // Validate check digit
        return checkDigit === isbn[9];
      }
    }

    // ISBN-13 validation
    if (length === 13) {
      if (/^\d{13}$/.test(isbn)) {
        const checkDigit = calculateISBN13CheckDigit(isbn.slice(0, 12)); // Validate check digit
        return checkDigit === isbn[12];
      }
    }

    return false; // Invalid length or format
  },
  {
    message: "Invalid ISBN code or check digit",
  },
);
