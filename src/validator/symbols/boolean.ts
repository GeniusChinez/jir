import { NumberOptionsSchema } from "../options/numbers";
import { SymbolSchema } from ".";
import { BooleanSchema } from "../boolean.schema";
import { z } from "zod";

export const BooleanSymbolSchema = SymbolSchema.extend({
  true: BooleanSchema.optional(),
  false: BooleanSchema.optional(),
  defaultValue: BooleanSchema.optional(),
}).merge(NumberOptionsSchema);

export type BooleanSymbol = z.infer<typeof BooleanSymbolSchema>;
