import { z } from "zod";
import { SymbolSchema } from ".";
import { TextOptionsSchema } from "../options/text";
import { BooleanSchema } from "../boolean.schema";
import { ReferenceSchema } from "../reference.schema";

export const RawTextSymbolSchema = z
  .object({
    defaultValue: z.string().optional(),
    reference: ReferenceSchema.optional(),
    unique: BooleanSchema.optional(),
  })
  .merge(TextOptionsSchema);

export const TextSymbolSchema = SymbolSchema.merge(RawTextSymbolSchema);
export type TextSymbol = z.infer<typeof TextSymbolSchema>;
