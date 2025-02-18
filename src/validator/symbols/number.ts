import { NumberOptionsSchema } from "../options/numbers";
import { SymbolSchema } from ".";
import { ReferenceSchema } from "../reference.schema";
import { NumberValueSchema, NumberVariantSchema } from "../number-value";
import { BooleanSchema } from "../boolean.schema";
import { z } from "zod";

export const RawNumberSymbolSchema = z
  .object({
    reference: ReferenceSchema.optional(),
    variant: NumberVariantSchema,
    unique: BooleanSchema.optional(),
    autoincrement: BooleanSchema.optional(),
    defaultValue: NumberValueSchema.optional(),
  })
  .merge(NumberOptionsSchema);

export const NumberSymbolSchema = SymbolSchema.merge(RawNumberSymbolSchema);
export type NumberSymbol = z.infer<typeof NumberSymbolSchema>;
