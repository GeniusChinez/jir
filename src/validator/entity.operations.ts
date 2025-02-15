import { z } from "zod";

export const globalEntityOperations = [
  "add-one",
  "add-many",
  "get-one",
  "get-many",
  "edit-one",
  "edit-many",
] as const;

export const EntityOperationsSchema = z
  .string()
  .array()
  .or(z.literal("*"))
  .transform((item) => {
    if (item === "*") {
      // Return a list of all operations when "*" is encountered
      return globalEntityOperations;
    }
    return item;
  });
