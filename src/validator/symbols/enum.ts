import { z } from "zod";
import { SymbolSchema } from ".";
import { BooleanSchema } from "../boolean.schema";

export const RawEnumSymbolSchema = z.object({
  values: z.string().array(),
  final: BooleanSchema.optional(),
  abstract: BooleanSchema.optional(),
  extends: z.string().or(z.string().array()).optional(),
});

export const EnumSymbolSchema = SymbolSchema.merge(RawEnumSymbolSchema);
export type EnumSymbol = z.infer<typeof EnumSymbolSchema>;
