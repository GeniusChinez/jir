import { ValidationContext } from "./context";
import { resolveName } from "./resolve.name";
import { resolveDateTimeSymbol } from "./resolve.symbol.date";
import { resolveEntitySymbol } from "./resolve.symbol.entity";
import { resolveEnumSymbol } from "./resolve.symbol.enum";
import { resolveListSymbol } from "./resolve.symbol.list";
import { resolveNumberSymbol } from "./resolve.symbol.number";
import { resolveObjectSymbol } from "./resolve.symbol.object";
import { resolveTextSymbol } from "./resolve.symbol.text";
import { Symbol, SymbolKind } from "./symbols";

export function actuallyResolveSymbol(
  symbol: Symbol,
  context: ValidationContext,
) {
  if (typeof symbol.raw === "object" && "db" in symbol.raw && symbol.raw.db) {
    if (Array.isArray(symbol.raw.db)) {
      symbol.db = symbol.raw.db;
    } else if (typeof symbol.raw.db === "string") {
      symbol.db = [symbol.raw.db];
    } else {
      throw new Error(
        `Found unknown 'db' type '${JSON.stringify(symbol.raw.db)}' for '${symbol.name}'`,
      );
    }
  }

  switch (symbol.type) {
    case SymbolKind.Text:
      return resolveTextSymbol(symbol, context);
    case SymbolKind.Boolean:
      break;
    case SymbolKind.Number:
      return resolveNumberSymbol(symbol, context);
    case SymbolKind.DateTime:
      return resolveDateTimeSymbol(symbol, context);
    case SymbolKind.List: {
      if (context.target !== "mongodb") {
        throw new Error(
          `Invalid type for '${symbol.name}'. List type not supported in '${context.target}'`,
        );
      }
      return resolveListSymbol(symbol, context);
    }
    case SymbolKind.Entity: {
      return resolveEntitySymbol(symbol, context);
    }
    case SymbolKind.Enum: {
      return resolveEnumSymbol(symbol, context);
    }
    case SymbolKind.Object: {
      if (context.target !== "mongodb") {
        throw new Error(
          `Invalid type for '${symbol.name}'. Object type not supported in '${context.target}'`,
        );
      }
      return resolveObjectSymbol(symbol, context);
    }
    default: {
      return resolveName(symbol.type, context);
    }
  }
  return symbol;
}
