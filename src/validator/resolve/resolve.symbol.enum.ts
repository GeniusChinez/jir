import { ValidationContext } from "../context";
import { resolveName } from "./resolve.name";
import { Symbol, SymbolKind } from "../symbols";
import { EnumSymbol, RawEnumSymbolSchema } from "../symbols/enum";
import { resolveSymbolFromSchema } from "./resolve.symbol.from-schema";

export function resolveEnumSymbol(
  _symbol: Symbol,
  context: ValidationContext,
): EnumSymbol {
  const symbol = resolveSymbolFromSchema(_symbol, RawEnumSymbolSchema);

  if (symbol.extends) {
    const shouldExtend = Array.isArray(symbol.extends)
      ? symbol.extends
      : [symbol.extends];
    for (const proposedParent of shouldExtend) {
      const parent = resolveName(proposedParent, context);

      if (parent.final) {
        throw new Error(
          `'${symbol.name}' cannot extend '${proposedParent}' as that guy is marked 'final'`,
        );
      }

      if (![SymbolKind.Enum].includes(parent.type)) {
        throw new Error(
          `'${symbol.name}' cannot extend a non-enum type '${proposedParent}'`,
        );
      }

      if (!("values" in parent) || !Array.isArray(parent.values)) {
        throw new Error(
          `'${symbol.name}' is extending a type with missing values '${proposedParent}'`,
        );
      }

      symbol.values = [
        ...new Set([...symbol.values, ...(parent.values as [])]),
      ];
    }
  }
  return symbol;
}
