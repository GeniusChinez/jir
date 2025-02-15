/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValidationContext } from "../context";
import { resolveSymbol } from "./resolve.symbol";
import { ListSymbol, Symbol, SymbolKind, SymbolStatus } from "./symbols";
import { extractBooleanFields } from "../utils";

export function resolveListSymbol(_symbol: Symbol, context: ValidationContext) {
  const symbol: ListSymbol = {
    ..._symbol,
    of: {} as any,
  };

  const { raw } = _symbol;

  extractBooleanFields(symbol, _symbol.raw, ["nonempty"]);

  if (!("of" in raw)) {
    throw new Error(
      `List '${symbol.name}' is missing 'of' for the underlying type`,
    );
  }

  if (!raw.of) {
    throw new Error(`List '${symbol.name}' must have a valid underlying type`);
  }

  const underlying = raw.of;

  if (typeof underlying !== "string") {
    if (typeof underlying !== "object") {
      throw new Error(
        `List '${symbol.name}' must have a valid underlying type`,
      );
    }

    if (!("type" in underlying)) {
      throw new Error(
        `List '${symbol.name}' has an invalid underlying type (missing 'type')`,
      );
    }
  }

  const displayName = `${symbol.name}[]`;

  const asSymbol: Symbol = {
    name: displayName,
    referenceCount: 0,
    raw: raw.of as any,
    status: SymbolStatus.Unresolved,
    type: (() => {
      if (typeof underlying === "string") {
        return underlying as any;
      }
      switch (underlying.type) {
        case "entity": {
          throw new Error(
            `type '${underlying.type}' not allowed for '${displayName}'`,
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
          return underlying.type as any;
      }
    })(),
  };

  symbol.of = resolveSymbol(asSymbol, context);

  if (context.table[symbol.of.type]?.type === SymbolKind.Entity) {
    throw new Error(
      `List '${symbol.name}' cannot have an underlying of type '${symbol.of.type}'`,
    );
  }

  const reapStuff = (name: string) => {
    if (name in raw) {
      if (
        typeof (raw as any)[name] !== "object" ||
        !Object.entries((raw as any)[name] || {}).length ||
        !(raw as any)[name]
      ) {
        throw new Error(
          `Expected an object of flags for the '@${name}' of '${symbol.name}'`,
        );
      }
      const stuff = (raw as any)[name];

      (symbol as any)[name] = {
        kind: symbol.of.type as any,
      };

      Object.keys(stuff || {}).map((key) => {
        ((symbol as any)[name] as any)[key] = (stuff as any)[key];
      });
    }
  };

  reapStuff("some");
  reapStuff("every");
  reapStuff("none");

  return symbol;
}
