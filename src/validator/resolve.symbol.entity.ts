/* eslint-disable @typescript-eslint/no-explicit-any */
import { isAlnum, isAlpha } from "./chars";
import { ValidationContext } from "./context";
import {
  EntityOperationsSchema,
  EntityPermissionsSchema,
  globalEntityOperations,
} from "./entity";
import { parseFieldTypeFromString } from "./parse.field-type.from-string";
import { resolveName } from "./resolve.name";
import { resolveSymbol } from "./resolve.symbol";
import { parseTypeFromSource } from "./source-types";
import { EntitySymbol, Symbol, SymbolKind, SymbolStatus } from "./symbols";

export function resolveEntitySymbol(
  _symbol: Symbol,
  context: ValidationContext,
) {
  const symbol: EntitySymbol = {
    ..._symbol,
    properties: {},
    visibility: "public",
    abstract: "abstract" in _symbol.raw && !!_symbol.raw.abstract,
    final: "final" in _symbol.raw && !!_symbol.raw.final,
    permissions: {},
    operations: globalEntityOperations,
  };

  const { raw } = _symbol;

  if ("visibility" in raw) {
    if (typeof raw.visibility !== "string") {
      throw new Error(
        `Unknown visibility '${raw.visibility}' for '${_symbol.name}'`,
      );
    }

    if (raw.visibility) {
      if (!["public", "private", "admin", "system"].includes(raw.visibility)) {
        throw new Error(
          `Unknown visibility '${raw.visibility}' for '${_symbol.name}'`,
        );
      }
      symbol.visibility = raw.visibility as typeof symbol.visibility;
    }
  }

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

  if ("operations" in raw) {
    const { data: operations, success } = EntityOperationsSchema.safeParse(
      raw.operations,
    );
    if (!success) {
      throw new Error(`Invalid operations spec '${symbol.name}.operations'`);
    }
    symbol.operations = operations;
  }

  if ("+operations" in raw) {
    const { data: operations, success } = EntityOperationsSchema.safeParse(
      raw["+operations"],
    );
    if (!success) {
      throw new Error(`Invalid operations spec '${symbol.name}.operations'`);
    }
    symbol.operations = [...new Set([...symbol.operations, ...operations])];
  }

  if ("-operations" in raw) {
    const { data: operations, success } = EntityOperationsSchema.safeParse(
      raw["-operations"],
    );
    if (!success) {
      throw new Error(`Invalid operations spec '${symbol.name}.operations'`);
    }
    symbol.operations = symbol.operations.filter(
      (one) => !operations.includes(one),
    );
  }

  if ("permissions" in raw) {
    const {
      data: permissions,
      success,
      error,
    } = EntityPermissionsSchema(symbol.operations).safeParse(raw.permissions);
    if (!success) {
      throw new Error(
        `Invalid permissions spec '${symbol.name}.permissions' (${JSON.parse(error.message)[0]?.message})`,
      );
    }

    for (const [userKind, validOperations] of Object.entries(permissions)) {
      for (const operation of validOperations) {
        if (!symbol.operations.includes(operation)) {
          throw new Error(
            `Unknown operation '${operation}' specified in '${symbol.name}.permissions' for role '${userKind}'`,
          );
        }
      }
    }

    symbol.permissions = permissions;
  }

  // now let's get to the actual entity's properties
  if (!("properties" in raw)) {
    throw new Error(`Entity '${symbol.name}' is missing 'properties'`);
  }

  if (!(raw.properties && typeof raw.properties === "object")) {
    throw new Error(
      `Entity '${symbol.name}' must have a valid 'properties' object`,
    );
  }

  Object.keys(raw.properties).forEach((propertyName) => {
    if (
      !propertyName ||
      !propertyName.split(" ").every((ch) => isAlnum(ch) || ch === "_")
    ) {
      throw new Error(
        `Entity '${symbol.name}' property '${propertyName}' must be made of alphabets and or digits`,
      );
    }

    if (!isAlpha(propertyName[0])) {
      throw new Error(
        `Entity '${symbol.name}' property '${propertyName}' must start with an alphabet`,
      );
    }

    const properties = raw.properties as any;
    const property = properties[propertyName];

    const displayName = `${symbol.name}.${propertyName}`;

    const expandedProperty =
      typeof property !== "string"
        ? property
        : parseFieldTypeFromString(displayName, property);

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
    };

    const resolved = resolveSymbol(propertyAsSymbol, context);
    symbol.properties[propertyName] = {
      ...resolved,
      optional: "optional" in expandedProperty && !!expandedProperty.optional,
    };

    if ("abstract" in resolved && !!resolved.abstract) {
      throw new Error(
        `Abstract type '${type}' not allowed for '${displayName}'`,
      );
    }
  });

  return symbol;
}
