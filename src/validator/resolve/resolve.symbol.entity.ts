/* eslint-disable @typescript-eslint/no-explicit-any */
import { isAlnum, isAlpha } from "../chars";
import { ValidationContext } from "../context";
import { EntityOperationsSchema } from "../entity.operations";
import { parseFieldType } from "../parse-type";
import { parseTypeFromSource } from "../source-types";
import { Symbol, SymbolKind, SymbolStatus } from "../symbols";
import { EntitySymbol, RawEntitySymbolSchema } from "../symbols/entity";
import { visibilities } from "../visibility";
import { resolveName } from "./resolve.name";
import { resolveSymbol } from "./resolve.symbol";
import { resolveSymbolFromSchema } from "./resolve.symbol.from-schema";

export function resolveEntitySymbol(
  _symbol: Symbol,
  context: ValidationContext,
) {
  const symbol = resolveSymbolFromSchema(
    _symbol,
    RawEntitySymbolSchema.omit({
      properties: true,
    }),
  );
  const entity = { ...symbol, properties: {} } as EntitySymbol;

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

    if (nameOfProperty === "id") {
      throw new Error(
        `On '${entity.name}', entities have 'id' fields autogenerated. You may not define them manually`,
      );
    }

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

    if (
      "visibility" in expandedProperty &&
      !visibilities.includes(expandedProperty.visibility)
    ) {
      throw new Error(
        `'${displayName}' has unknown visibility '${expandedProperty.visibility}'`,
      );
    }

    const propertyAsSymbol: Symbol = {
      name: displayName,
      referenceCount: 0,
      raw: expandedProperty,
      status: SymbolStatus.Unresolved,
      type,
      visibility: expandedProperty.visibility || "inherit",
    };

    const resolved = resolveSymbol(propertyAsSymbol, context);
    entity.properties[nameOfProperty] = resolved;

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

    // @todo: figure out how we're gonna deal with reflexive relations and necessary cyclic dependencies
  });

  entity.properties.id = resolveSymbol(
    {
      name: `${entity.name}.id`,
      referenceCount: 0,
      raw: {
        type: context.target === "mongodb" ? "string" : "number",
        objectId: context.target === "mongodb",
        id: true,
        autoincrement: context.target !== "mongodb",
        default: context.target === "mongodb" ? "auto()" : "@autoincrement()",
      },
      visibility: "public",
      status: SymbolStatus.Unresolved,
      type: context.target === "mongodb" ? SymbolKind.Text : SymbolKind.Number,
    },
    context,
  );

  console.log(raw);

  if ("+operations" in raw) {
    const { data: operations, success } = EntityOperationsSchema.safeParse(
      raw["+operations"],
    );
    if (!success) {
      throw new Error(`Invalid operations spec '${symbol.name}.operations'`);
    }
    entity.operations = [
      ...new Set([...(symbol.operations || []), ...operations]),
    ];
  }

  if ("-operations" in raw) {
    const { data: operations, success } = EntityOperationsSchema.safeParse(
      raw["-operations"],
    );
    if (!success) {
      throw new Error(`Invalid operations spec '${symbol.name}.operations'`);
    }
    entity.operations = (symbol.operations || []).filter(
      (one) => !operations.includes(one as any),
    );
  }

  if (symbol.permissions) {
    const permissions = symbol.permissions;
    for (const [userKind, validOperations] of Object.entries(permissions)) {
      for (const operation of validOperations) {
        if (!(symbol.operations || []).includes(operation as any)) {
          throw new Error(
            `Unknown operation '${operation}' specified in '${symbol.name}.permissions' for role '${userKind}'`,
          );
        }
      }
    }
  }

  if (symbol.extends) {
    const parents =
      typeof symbol.extends === "string" ? [symbol.extends] : symbol.extends;
    for (const proposedParent of parents) {
      const parent = resolveName(proposedParent, context);

      if (parent.final) {
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

      entity.properties = {
        ...(parent.properties as object), // we spread them first so that they dont overwrite preexisting ones
        ...entity.properties,
      };
    }
  }

  if (entity.compositeKey) {
    for (const id of entity.compositeKey) {
      if (!(id in entity.properties)) {
        throw new Error(
          `'${entity.name}.compositeKey' has field name '${id}' which doesn't exist in the entity`,
        );
      }
    }
  }

  if (entity.uniqueKey) {
    const uniqueKey = Array.isArray(entity.uniqueKey)
      ? {
          fields: entity.uniqueKey,
        }
      : entity.uniqueKey;

    for (const field of uniqueKey.fields) {
      if (!(field in entity.properties)) {
        throw new Error(
          `'${entity.name}.uniqueKey' has field name '${field}' which doesn't exist in the entity`,
        );
      }
    }
  }

  if (entity.index) {
    const index = Array.isArray(entity.index)
      ? {
          fields: entity.index,
        }
      : entity.index;

    for (const field of index.fields) {
      if (!(field in entity.properties)) {
        throw new Error(
          `'${entity.name}.uniqueKey' has field name '${field}' which doesn't exist in the entity`,
        );
      }
    }
  }
  return entity;
}
