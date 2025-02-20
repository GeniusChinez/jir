import { z, ZodSchema } from "zod";
import { Symbol } from "../symbols";

export function resolveSymbolFromSchema<Schema extends ZodSchema>(
  symbol: Symbol,
  schema: Schema,
): z.infer<Schema> & Symbol {
  const {
    data: rawSymbol,
    success,
    error: symbolError,
  } = schema.safeParse(symbol.raw);

  if (!success) {
    throw new Error(
      `Failed to parse '${symbol.name}'. Reason: ${symbolError.message}`,
    );
  }

  return {
    ...symbol,
    ...rawSymbol,
  };
}
