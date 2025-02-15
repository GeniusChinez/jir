import { z } from "zod";
import { SymbolKindSchema, SymbolSchema, SymbolStatusSchema } from ".";
import { BooleanSchema } from "../boolean.schema";

export const ObjectSymbolPropertySchema = z.object({
  name: z.string(),
  type: SymbolKindSchema,
  status: SymbolStatusSchema,
  required: BooleanSchema,
});

export const ObjectSymbolSchema = SymbolSchema.extend({
  properties: z.record(z.string(), ObjectSymbolPropertySchema),
  abstract: BooleanSchema.optional(),
  final: BooleanSchema.optional(),
});

export type ObjectSymbol = z.infer<typeof ObjectSymbolSchema>;
