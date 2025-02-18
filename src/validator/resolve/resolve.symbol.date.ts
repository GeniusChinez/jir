import { ValidationContext } from "../context";
import { Symbol } from "../symbols";
import { checkConflicts } from "../utils";
import { DateTimeSymbol, RawDateTimeSymbolSchema } from "../symbols/datetime";
import { resolveSymbolFromSchema } from "./resolve.symbol.from-schema";

export function resolveDateTimeSymbol(
  _symbol: Symbol,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: ValidationContext,
): DateTimeSymbol {
  const symbol = resolveSymbolFromSchema(_symbol, RawDateTimeSymbolSchema);

  checkConflicts(symbol, [
    ["future", "past"],
    ["createdAt", "updatedAt"],
  ]);

  return symbol;
}
