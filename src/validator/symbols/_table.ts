import { z } from "zod";
import { SymbolSchema } from ".";

export const SymbolTableSchema = z.record(z.string(), SymbolSchema);
export type SymbolTable = z.infer<typeof SymbolTableSchema>;
