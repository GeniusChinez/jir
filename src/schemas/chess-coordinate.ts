import { z } from "zod";

// A valid chess coordinate consists of a letter (a-h) and a number (1-8)
const chessCoordinateSchema = z
  .string()
  .toLowerCase()
  .regex(/^[a-h][1-8]$/, { message: "Invalid chess coordinate format" });

// Example of how to validate a chess coordinate
export function validateChessCoordinate(coord: string) {
  const result = chessCoordinateSchema.safeParse(coord);

  if (result.success) {
    console.log("Valid chess coordinate!");
    return result.data; // Returns the valid coordinate
  } else {
    console.log("Invalid chess coordinate:", result.error.errors);
    return null;
  }
}
