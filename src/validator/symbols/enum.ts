import { z } from "zod";
import { SymbolSchema } from ".";
import { BooleanSchema } from "../boolean.schema";

export const EnumSymbolSchema = SymbolSchema.extend({
  values: z.string().array(),
  final: BooleanSchema.optional(),
  abstract: BooleanSchema.optional(),
});

export type EnumSymbol = z.infer<typeof EnumSymbolSchema>;
