import { SymbolSchema } from ".";
import { BooleanSchema } from "../boolean.schema";
import { z } from "zod";

export const RawListSymbolSchema = z.object({
  of: SymbolSchema,
  nonempty: BooleanSchema.optional(),
  empty: BooleanSchema.optional(),
  length: z.number().nonnegative().optional(),
  min: z.number().nonnegative().optional(),
  max: z.number().nonnegative().optional(),
  some: z.record(z.string(), z.any()).optional(),
  every: z.record(z.string(), z.any()).optional(),
  none: z.record(z.string(), z.any()).optional(),
});

export const ListSymbolSchema = SymbolSchema.merge(RawListSymbolSchema);
export type ListSymbol = z.infer<typeof ListSymbolSchema>;
