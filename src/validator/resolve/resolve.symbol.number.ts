import { ValidationContext } from "../context";
import { resolveName } from "./resolve.name";
import { Symbol, SymbolKind } from "../symbols";
import { checkConflicts } from "../utils";
import { RawNumberSymbolSchema } from "../symbols/number";
import { resolveSymbolFromSchema } from "./resolve.symbol.from-schema";

export function resolveNumberSymbol(
  _symbol: Symbol,
  context: ValidationContext,
) {
  const symbol = resolveSymbolFromSchema(_symbol, RawNumberSymbolSchema);

  checkConflicts(symbol, [
    ["even", "odd"],
    ["negative", "positive"],
    ["negative", "nonnegative"],
    ["positive", "nonpositive"],
    ["nonnegative", "nonpositive"],
    ["negative", "abs"],
  ]);

  if (context.target === "mongodb" && symbol.id) {
    throw new Error(
      `${context.target} cannot have numeric record IDs ('${symbol.name}')`,
    );
  }

  if (symbol.reference) {
    if (context.target !== "mysql") {
      throw new Error(
        `For '${symbol.name}', number fields that reference other tables/collections are not allowed in '${context.target}'`,
      );
    }

    const { name } = symbol.reference;
    if (!(name in context.table)) {
      throw new Error(
        `'${symbol.name}' is referencing a non-existant entity '${name}'`,
      );
    }

    // Here we are saying resolve it if it not optional, but that's not really
    // solving the issue of cyclic dependencies, right? Wait, does it? We'll think
    // some more later.
    if (symbol.optional) {
      return symbol;
    }

    const reference = resolveName(symbol.reference.name, context);
    if (reference.type !== SymbolKind.Entity) {
      throw new Error(
        `'${symbol.name}' is referencing a non-entity type '${symbol.reference.name}'`,
      );
    }
  }

  return symbol;
}
