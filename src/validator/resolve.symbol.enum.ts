import { ValidationContext } from "./context";
import { resolveName } from "./resolve.name";
import { EnumSymbol, Symbol, SymbolKind } from "./symbols";

export function resolveEnumSymbol(_symbol: Symbol, context: ValidationContext) {
  const symbol: EnumSymbol = {
    ..._symbol,
    values: [],
    final: "final" in _symbol.raw && !!_symbol.raw.final,
  };

  const { raw } = _symbol;

  if (!("values" in raw)) {
    throw new Error(`Enum '${symbol.name}' is missing 'values'`);
  }

  if (
    !Array.isArray(raw.values) ||
    !raw.values.every((member) => typeof member === "string")
  ) {
    throw new Error(`Enum '${symbol.name}' must have strings in 'values'`);
  }

  if (!raw.values.length) {
    throw new Error(`Enum '${symbol.name}' must have strings in 'values'`);
  }

  symbol.values = raw.values;

  if ("extends" in raw) {
    if (typeof raw.extends === "string") {
      const parent = resolveName(raw.extends, context);

      if ("final" in parent && parent.final) {
        throw new Error(
          `'${symbol.name}' cannot extend '${raw.extends}' as that guy is marked 'final'`,
        );
      }

      if (![SymbolKind.Enum].includes(parent.type)) {
        throw new Error(
          `'${symbol.name}' cannot extend a non-enum type '${raw.extends}'`,
        );
      }

      if (!("values" in parent) || !Array.isArray(parent.values)) {
        throw new Error(
          `'${symbol.name}' is extending a type with missing values '${raw.extends}'`,
        );
      }

      symbol.values = [
        ...new Set([...symbol.values, ...(parent.values as [])]),
      ];
    } else if (typeof raw.extends === "object" && Array.isArray(raw.extends)) {
      if (raw.extends.length) {
        for (const proposedParent of raw.extends) {
          if (typeof proposedParent === "string") {
            const parent = resolveName(proposedParent, context);

            if ("final" in parent && parent.final) {
              throw new Error(
                `'${symbol.name}' cannot extend '${proposedParent}' as that guy is marked 'final'`,
              );
            }

            if (![SymbolKind.Enum].includes(parent.type)) {
              throw new Error(
                `'${symbol.name}' cannot extend a non-enum type '${raw.extends}'`,
              );
            }

            if (!("values" in parent) || !Array.isArray(parent.values)) {
              throw new Error(
                `'${symbol.name}' is extending a type with missing values '${raw.extends}'`,
              );
            }

            symbol.values = [
              ...new Set([...symbol.values, ...(parent.values as [])]),
            ];
          } else {
            throw new Error(
              `Expected a list of aliases in the 'extends' of '${symbol.name}'`,
            );
          }
        }
      }
    } else {
      throw new Error(
        `'${symbol.name}' expected an alias or list of aliases in "extends"`,
      );
    }
  }
  return symbol;
}
