/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValidationContext } from "../context";
import { resolveSymbol } from "./resolve.symbol";
import { Symbol, SymbolKind, SymbolStatus } from "../symbols";
import { ListSymbol, RawListSymbolSchema } from "../symbols/list";
import { resolveSymbolFromSchema } from "./resolve.symbol.from-schema";

export function resolveListSymbol(
  _symbol: Symbol,
  context: ValidationContext,
): ListSymbol {
  const symbol = resolveSymbolFromSchema(
    _symbol,
    RawListSymbolSchema.omit({
      of: true,
    }),
  );

  const raw = _symbol.raw as object;

  if (!("of" in raw)) {
    throw new Error(`Found no base type while parsing '${symbol.name}'`);
  }

  const displayName = `${symbol.name}.0`;
  const base = raw.of;

  if (!base) {
    throw new Error(
      `Found no base type while parsing '${displayName}'. Base type: ${JSON.stringify(base)}`,
    );
  }

  if (typeof base !== "string") {
    if (typeof base !== "object") {
      throw new Error(
        `Found invalid base type while parsing '${displayName}'. Base type: ${JSON.stringify(base)}`,
      );
    }

    if (!("type" in base)) {
      throw new Error(
        `Found invalid base type (missing 'type') while parsing '${displayName}'`,
      );
    }
  }

  const baseTypeSymbol: Symbol = {
    name: displayName,
    referenceCount: 0,
    raw: base as any,
    status: SymbolStatus.Unresolved,
    visibility: "inherit",
    type: (() => {
      if (typeof base === "string") {
        return base as any;
      }

      switch (base.type) {
        case "entity": {
          throw new Error(
            `type '${base.type}' not allowed for '${displayName}'`,
          );
        }
        case "enum":
          return SymbolKind.Enum;
        case "object":
          return SymbolKind.Object;
        case "string":
          return SymbolKind.Text;
        case "number":
          return SymbolKind.Number;
        case "boolean":
          return SymbolKind.Boolean;
        case "list":
          return SymbolKind.List;
        default:
          return base.type as any;
      }
    })(),
  };

  const list = symbol as ListSymbol;
  list.of = resolveSymbol(baseTypeSymbol, context);

  if (list.of.type === SymbolKind.Entity) {
    throw new Error(
      `List '${symbol.name}' cannot have an underlying of type '${list.of.type}'`,
    );
  }

  return list;
}
