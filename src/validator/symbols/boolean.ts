import { NumberOptionsSchema } from "../options/numbers";
import { SymbolSchema } from ".";
import { BooleanSchema } from "../boolean.schema";
import { z } from "zod";

export const RawBooleanSymbolSchema = z
  .object({
    true: BooleanSchema.optional(),
    false: BooleanSchema.optional(),
    defaultValue: BooleanSchema.optional(),
  })
  .merge(NumberOptionsSchema);

export const BooleanSymbolSchema = SymbolSchema.merge(RawBooleanSymbolSchema);
export type BooleanSymbol = z.infer<typeof BooleanSymbolSchema>;
