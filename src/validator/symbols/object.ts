import { z } from "zod";
import { SymbolKindSchema, SymbolSchema, SymbolStatusSchema } from ".";
import { BooleanSchema } from "../boolean.schema";

export const ObjectSymbolPropertySchema = z.object({
  name: z.string(),
  type: SymbolKindSchema,
  status: SymbolStatusSchema,
  optional: BooleanSchema.optional(),
});

export const RawObjectSymbolSchema = z.object({
  properties: z.record(z.string(), ObjectSymbolPropertySchema),
  abstract: BooleanSchema.optional(),
  final: BooleanSchema.optional(),
  extends: z.string().or(z.string().array()).optional(),
});

export const ObjectSymbolSchema = SymbolSchema.merge(RawObjectSymbolSchema);
export type ObjectSymbol = z.infer<typeof ObjectSymbolSchema>;
