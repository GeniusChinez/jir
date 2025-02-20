import { z } from "zod";

export const vinSchema = z
  .string()
  .length(17, "VIN must be exactly 17 characters long")
  .regex(/^[A-HJ-NPR-Z0-9]+$/, "VIN cannot contain I, O, or Q")
  .refine((vin) => validateVinCheckDigit(vin), {
    message: "Invalid VIN check digit",
  });

// Function to validate the VIN check digit (position 9)
export function validateVinCheckDigit(vin: string): boolean {
  if (vin.length !== 17) return false;

  const transliterations: { [key: string]: number } = {
    A: 1,
    B: 2,
    C: 3,
    D: 4,
    E: 5,
    F: 6,
    G: 7,
    H: 8,
    J: 1,
    K: 2,
    L: 3,
    M: 4,
    N: 5,
    P: 7,
    R: 9,
    S: 2,
    T: 3,
    U: 4,
    V: 5,
    W: 6,
    X: 7,
    Y: 8,
    Z: 9,
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "0": 0,
  };

  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const char = vin[i];
    if (!transliterations[char]) return false;
    sum += transliterations[char] * weights[i];
  }

  const remainder = sum % 11;
  const checkDigit = remainder === 10 ? "X" : remainder.toString();
  return vin[8] === checkDigit;
}
