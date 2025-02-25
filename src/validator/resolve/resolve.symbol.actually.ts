import { ValidationContext } from "../context";
import { resolveName } from "./resolve.name";
import { resolveDateTimeSymbol } from "./resolve.symbol.date";
import { resolveEnumSymbol } from "./resolve.symbol.enum";
import { resolveListSymbol } from "./resolve.symbol.list";
import { resolveNumberSymbol } from "./resolve.symbol.number";
import { resolveObjectSymbol } from "./resolve.symbol.object";
import { resolveTextSymbol } from "./resolve.symbol.text";
import { Symbol, SymbolKind, SymbolSchema } from "../symbols";
import { resolveEntitySymbol } from "./resolve.symbol.entity";

export function actuallyResolveSymbol(
  _symbol: Symbol,
  context: ValidationContext,
): Symbol {
  const {
    data: symbol,
    success,
    error: symbolError,
  } = SymbolSchema.safeParse(_symbol);
  if (!success) {
    throw new Error(
      `Failed to parsee '${_symbol.name}'. Reason: ${symbolError.message}`,
    );
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
