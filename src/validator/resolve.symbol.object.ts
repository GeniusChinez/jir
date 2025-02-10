/* eslint-disable @typescript-eslint/no-explicit-any */
import { isAlnum, isAlpha } from "./chars";
import { ValidationContext } from "./context";
import { parseFieldTypeFromString } from "./parse.field-type.from-string";
import { resolveName } from "./resolve.name";
import { resolveSymbol } from "./resolve.symbol";
import { parseTypeFromSource } from "./source-types";
import { ObjectSymbol, Symbol, SymbolKind, SymbolStatus } from "./symbols";

export function resolveObjectSymbol(
  _symbol: Symbol,
  context: ValidationContext,
) {
  const symbol: ObjectSymbol = {
    ..._symbol,
    properties: {},
    final: "final" in _symbol.raw && !!_symbol.raw.final,
    abstract: "abstract" in _symbol.raw && !!_symbol.raw.abstract,
  };

  const { raw } = _symbol;

  if (!("properties" in raw)) {
    throw new Error(`Object '${symbol.name}' is missing 'properties'`);
  }

  if (!(raw.properties && typeof raw.properties === "object")) {
    throw new Error(
      `Object '${symbol.name}' must have a valid 'properties' object`,
    );
  }

  Object.keys(raw.properties).forEach((propertyName) => {
    if (
      !propertyName ||
      !propertyName.split(" ").every((ch) => isAlnum(ch) || ch === "_")
    ) {
      throw new Error(
        `Object '${symbol.name}' property '${propertyName}' must be made of alphabets and or digits`,
      );
    }

    if (!isAlpha(propertyName[0])) {
      throw new Error(
        `Object '${symbol.name}' property '${propertyName}' must start with an alphabet`,
      );
    }

    const properties = raw.properties as any;
    const property = properties[propertyName];

    const displayName = `${symbol.name}.${propertyName}`;

    const expandedPropoerty =
      typeof property !== "string"
        ? property
        : parseFieldTypeFromString(displayName, property);

    const propertyAsSymbol: Symbol = {
      name: displayName,
      referenceCount: 0,
      raw: expandedPropoerty,
      status: SymbolStatus.Unresolved,
      type: (() => {
        const type = parseTypeFromSource(expandedPropoerty);

        if (type === SymbolKind.Entity) {
          throw new Error(
            `type '${property.type}' not allowed for '${displayName}'`,
          );
        }

        return type as SymbolKind;
      })(),
    };

    const resolved = resolveSymbol(propertyAsSymbol, context);
    symbol.properties[propertyName] = resolved;

    if ("abstract" in resolved && !!resolved.abstract) {
      throw new Error(
        `Abstract type '${property.type}' not allowed for '${displayName}'`,
      );
    }
  });

  if ("extends" in raw) {
    if (typeof raw.extends === "string") {
      const parent = resolveName(raw.extends, context);

      if ("final" in parent && parent.final) {
        throw new Error(
          `'${symbol.name}' cannot extend '${raw.extends}' as that guy is marked 'final'`,
        );
      }

      if (![SymbolKind.Entity, SymbolKind.Object].includes(parent.type)) {
        throw new Error(
          `'${symbol.name}' cannot extend a non-entity/object type '${raw.extends}'`,
        );
      }

      if (!("properties" in parent)) {
        throw new Error(
          `'${symbol.name}' is extending a type with missing properties '${raw.extends}'`,
        );
      }

      symbol.properties = {
        ...symbol.properties,
        ...(parent.properties as object),
      };
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

            if (![SymbolKind.Entity, SymbolKind.Object].includes(parent.type)) {
              throw new Error(
                `'${symbol.name}' cannot extend a non-entity/object type '${proposedParent}'`,
              );
            }

            if (!("properties" in parent)) {
              throw new Error(
                `'${symbol.name}' is extending a type with missing properties '${proposedParent}'`,
              );
            }

            symbol.properties = {
              ...symbol.properties,
              ...(parent.properties as object),
            };
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
