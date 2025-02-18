import { ValidationContext } from "../context";
import { resolveName } from "./resolve.name";
import { Symbol, SymbolKind } from "../symbols";
import { checkConflicts } from "../utils";
import { RawTextSymbolSchema } from "../symbols/text";
import { resolveSymbolFromSchema } from "./resolve.symbol.from-schema";

export function resolveTextSymbol(_symbol: Symbol, context: ValidationContext) {
  const symbol = resolveSymbolFromSchema(_symbol, RawTextSymbolSchema);

  checkConflicts(symbol, [
    // Casing styles (only one should be true)
    [
      "lowercase",
      "uppercase",
      "camelcase",
      "pascalcase",
      "kebabcase",
      "screamingcase",
    ],

    // Length constraints (only one should be true)
    ["long", "medium", "short"],

    // Space-related rules (nospaces may conflict with slug or other formats)
    ["nospaces", "slug"],

    // Character type constraints (only one should be true)
    ["alphabetic", "numeric", "alphanumeric"],

    // Special formats (only one should be true)
    [
      "url",
      "email",
      "ipaddress",
      "uuid",
      "cuid",
      "ulid",
      "cidr",
      "objectId",
      "date",
      "datetime",
      "time",
      "base64",
    ],
  ]);

  if (context.target !== "mongodb" && symbol.id) {
    throw new Error(
      `${context.target} cannot have string record IDs ('${symbol.name}')`,
    );
  }

  if (symbol.reference) {
    if (context.target !== "mongodb") {
      throw new Error(
        `For '${symbol.name}', text fields that reference other tables/collections are not allowed in '${context.target}'`,
      );
    }

    const { name } = symbol.reference;
    if (!(name in context.table)) {
      throw new Error(
        `'${symbol.name}' is referencing a non-existant entity '${name}'`,
      );
    }

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
