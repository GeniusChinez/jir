import { DateOptionsSchema } from "../options/dates";
import { SymbolSchema } from ".";
import { z } from "zod";

export const RawDateTimeSymbolSchema = z
  .object({
    defaultValue: z.date().optional(),
  })
  .merge(DateOptionsSchema);

export const DateTimeSymbolSchema = SymbolSchema.merge(RawDateTimeSymbolSchema);
export type DateTimeSymbol = z.infer<typeof DateTimeSymbolSchema>;
