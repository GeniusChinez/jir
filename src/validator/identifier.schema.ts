import { z } from "zod";
import { isAlpha, isValidColumnName } from "./chars";

export const IdentifierSchema = z
  .string()
  .trim()
  .refine(
    (str) => isAlpha(str[0]) || str[0] === "_",
    "Must start with a letter or underscore",
  )
  .refine(
    (str) => isValidColumnName(str),
    "Must contain only letters or digits or underscores",
  );
