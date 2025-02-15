import { DateOptionsSchema } from "../options/dates";
import { SymbolSchema } from ".";
import { z } from "zod";

export const DateTimeSymbolSchema = SymbolSchema.extend({
  defaultValue: z.date().optional(),
}).merge(DateOptionsSchema);

export type DateTimeSymbol = z.infer<typeof DateTimeSymbolSchema>;
