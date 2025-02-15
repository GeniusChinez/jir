import { z } from "zod";
import { SymbolSchema } from ".";
import { TextOptionsSchema } from "../options/text";
import { BooleanSchema } from "../boolean.schema";
import { ReferenceSchema } from "../reference.schema";

export const TextSymbolSchema = SymbolSchema.extend({
  defaultValue: z.string().optional(),
  references: ReferenceSchema.optional(),
  unique: BooleanSchema.optional(),
  long: BooleanSchema.optional(),
  medium: BooleanSchema.optional(),
  short: BooleanSchema.optional(),
}).merge(TextOptionsSchema);

export type TextSymbol = z.infer<typeof TextSymbolSchema>;
