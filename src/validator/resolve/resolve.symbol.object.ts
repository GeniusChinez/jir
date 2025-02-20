/* eslint-disable @typescript-eslint/no-explicit-any */

import { ValidationContext } from "../context";
import { resolveName } from "./resolve.name";
import { Symbol, SymbolKind, SymbolStatus } from "../symbols";
import { ObjectSymbol, RawObjectSymbolSchema } from "../symbols/object";
import { isAlnum, isAlpha } from "../chars";
import { parseFieldType } from "../parse-type";
import { parseTypeFromSource } from "../source-types";
import { resolveSymbol } from "./resolve.symbol";
import { resolveSymbolFromSchema } from "./resolve.symbol.from-schema";

export function resolveObjectSymbol(
  _symbol: Symbol,
  context: ValidationContext,
) {
  const symbol = resolveSymbolFromSchema(
    _symbol,
    RawObjectSymbolSchema.omit({
      properties: true,
    }),
  );
  const object = { ...symbol, properties: {} } as ObjectSymbol;

  const { raw } = _symbol;

  if (!raw || typeof raw !== "object" || !("properties" in raw)) {
    throw new Error(`Object '${symbol.name}' is missing 'properties'`);
  }

  const properties = raw.properties;

  if (!(properties && typeof properties === "object")) {
    throw new Error(
      `Object '${symbol.name}' must have a valid 'properties' object`,
    );
  }

  Object.keys(properties).forEach((nameOfProperty) => {
    if (
      !nameOfProperty ||
      !nameOfProperty.split(" ").every((ch) => isAlnum(ch) || ch === "_")
    ) {
      throw new Error(
        `Object '${symbol.name}' property '${nameOfProperty}' must be made of alphabets and or digits`,
      );
    }

    if (nameOfProperty[0] !== "_" && !isAlpha(nameOfProperty[0])) {
      throw new Error(
        `Object '${symbol.name}' property '${nameOfProperty}' must start with an alphabet or '_'`,
      );
    }

    const property = (properties as any)[nameOfProperty];
    const displayName = `${symbol.name}.${nameOfProperty}`;

    const expandedProperty =
      typeof property !== "string"
        ? (() => {
            if (!("type" in property)) {
              throw new Error(
                `Object '${symbol.name}' property '${nameOfProperty}' has an unknown type`,
              );
            }
            return {
              ...property,
              ...parseFieldType(`${displayName}$type`, property.type),
            };
          })()
        : parseFieldType(displayName, property);

    const type = parseTypeFromSource(expandedProperty) as SymbolKind;
    if (type === SymbolKind.Entity) {
      throw new Error(
        `type '${property.type}' not allowed for '${displayName}'`,
      );
    }

    const propertyAsSymbol: Symbol = {
      name: displayName,
      referenceCount: 0,
      raw: expandedProperty,
      status: SymbolStatus.Unresolved,
      type,
      visibility: "inherit", // actually, each can have it's own visibility
    };

    const resolved = resolveSymbol(propertyAsSymbol, context);
    object.properties[nameOfProperty] = resolved;

    if (resolved.abstract) {
      throw new Error(
        `Abstract type '${type}' not allowed for '${displayName}'`,
      );
    }

    if ("reference" in resolved && resolved.reference) {
      throw new Error(
        `Object property '${displayName}' must not reference other entities/objects`,
      );
    }
  });

  if (symbol.extends) {
    const shouldExtend = Array.isArray(symbol.extends)
      ? symbol.extends
      : [symbol.extends];
    if (shouldExtend.length) {
      for (const proposedParent of shouldExtend) {
        if (typeof proposedParent === "string") {
          const parent = resolveName(proposedParent, context);

          if ("final" in parent && parent.final) {
            throw new Error(
              `'${symbol.name}' cannot extend '${proposedParent}' as that guy is marked 'final'`,
            );
          }

          if (
            ![SymbolKind.Entity, SymbolKind.Object].includes(
              parent.type as SymbolKind,
            )
          ) {
            throw new Error(
              `'${symbol.name}' cannot extend a non-entity/object type '${proposedParent}'`,
            );
          }

          if (!("properties" in parent)) {
            throw new Error(
              `'${symbol.name}' is extending a type with missing properties '${proposedParent}'`,
            );
          }

          object.properties = {
            ...object.properties,
            ...(parent.properties as object),
          };
        } else {
          throw new Error(
            `Expected a list of aliases in the 'extends' of '${object.name}'`,
          );
        }
      }
    }
  }

  return object;
}
