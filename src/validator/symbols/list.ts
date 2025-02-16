import { DateOptionsSchema } from "../options/dates";
import { NumberOptionsSchema } from "../options/numbers";
import { SymbolKind, SymbolSchema } from ".";
import { TextOptionsSchema } from "../options/text";
import { BooleanSchema } from "../boolean.schema";
import { z } from "zod";

export const ListSymbolSchema = SymbolSchema.extend({
  of: SymbolSchema,
  nonempty: BooleanSchema.optional(),
  some: NumberOptionsSchema.extend({ kind: z.literal(SymbolKind.Number) })
    .or(TextOptionsSchema.extend({ kind: z.literal(SymbolKind.Text) }))
    .or(DateOptionsSchema.extend({ kind: z.literal(SymbolKind.DateTime) }))
    .or(z.object({ kind: z.literal(SymbolKind.Boolean) })),
});

export type ListSymbol = z.infer<typeof ListSymbolSchema>;
