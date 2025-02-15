import { z } from "zod";
import { DigitsSchema } from "./chars";

export const NumberValueSchema = z
  .number()
  .or(z.bigint())
  .or(DigitsSchema.transform((v) => Number(v)));

export const NumberVariantSchema = z.enum([
  "decimal",
  "bigint",
  "int",
  "float",
]);
export type NumberVariant = z.infer<typeof NumberVariantSchema>;
