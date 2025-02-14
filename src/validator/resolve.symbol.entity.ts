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

  if ("map" in raw && typeof raw.map === "string") {
    symbol.map = raw.map;
  }

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

  if ("ignore" in raw && raw.ignore) {
    symbol.ignore = true;
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

    if (propertyName === "id") {
      throw new Error(
        `On '${symbol.name}', entities have 'id' fields autogenerated. You may not define them manually`,
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

  symbol.properties.id = resolveSymbol(
    {
      name: `${symbol.name}.id`,
      referenceCount: 0,
      raw: {
        type: context.target === "mongodb" ? "string" : "number",
        objectId: context.target === "mongodb",
        id: true,
        autoincrement: context.target !== "mongodb",
        default: context.target === "mongodb" ? "auto()" : "@autoincrement()",
      },
      status: SymbolStatus.Unresolved,
      type: context.target === "mongodb" ? SymbolKind.Text : SymbolKind.Number,
    },
    context,
  );

  if ("compositeKey" in raw) {
    if (
      !Array.isArray(raw.compositeKey) ||
      !raw.compositeKey.every((item) => typeof item === "string")
    ) {
      throw new Error(`'${symbol.name}.compositeKey' must be a list of names`);
    }

    for (const id of raw.compositeKey) {
      if (!(id in symbol.properties)) {
        throw new Error(
          `'${symbol.name}.compositeKey' has field name '${id}' which doesn't exist in the entity`,
        );
      }
    }
    symbol.compositeKey = raw.compositeKey;
  }

  if ("schema" in raw) {
    if (typeof raw.schema !== "string") {
      throw new Error(`'${symbol.name}.schema' must be a string`);
    }
    symbol.schema = raw.schema;
  }

  if ("uniqueKey" in raw && raw.uniqueKey) {
    if (typeof raw.uniqueKey === "string") {
      if (!(raw.uniqueKey in symbol.properties)) {
        throw new Error(
          `'${symbol.name}.uniqueKey' has field name '${raw.uniqueKey}' which doesn't exist in the entity`,
        );
      }
      symbol.uniqueKey = [raw.uniqueKey];
    } else if (Array.isArray(raw.uniqueKey)) {
      if (raw.uniqueKey.every((item) => typeof item === "string")) {
        symbol.uniqueKey = raw.uniqueKey.map((item) => {
          if (!(item in symbol.properties)) {
            throw new Error(
              `'${symbol.name}.uniqueKey.fields' has a field name '${item}' that isn't on the entity`,
            );
          }
          return item;
        });
      } else {
        symbol.uniqueKey = {
          fields: raw.uniqueKey.map((item) => {
            if (typeof item === "string") {
              if (!(item in symbol.properties)) {
                throw new Error(
                  `'${symbol.name}.uniqueKey.fields' has a field name '${item}' that isn't on the entity`,
                );
              }
              return {
                name: item,
              };
            }
            if (typeof item === "object") {
              if (!("name" in item) || typeof item.name !== "string") {
                throw new Error(
                  `'${symbol.name}.uniqueKey' has field missing name: ${JSON.stringify(item)}`,
                );
              }
              if (!(item.name in symbol.properties)) {
                throw new Error(
                  `'${symbol.name}.uniqueKey.fields' has a field name '${item.name}' that isn't on the entity`,
                );
              }
              return {
                name: item.name,
                length:
                  "length" in item && typeof item.length === "number"
                    ? item.length
                    : undefined,
                sort:
                  "sort" in item && typeof item.sort === "string"
                    ? item.sort === "Desc"
                      ? "Desc"
                      : "Asc"
                    : undefined,
              };
            }

            throw new Error(
              `'${symbol.name}.uniqueKey' has invalid specification: ${JSON.stringify(item)}`,
            );
          }),
        };
      }
    } else if (typeof raw.uniqueKey === "object") {
      if (!("fields" in raw.uniqueKey)) {
        throw new Error(`'${symbol.name}.uniqueKey' is missing 'fields'`);
      }

      if (!Array.isArray(raw.uniqueKey.fields)) {
        throw new Error(`'${symbol.name}.uniqueKey.fields' needs to be a list`);
      }

      if ("name" in raw.uniqueKey && typeof raw.uniqueKey.name !== "string") {
        throw new Error(`'${symbol.name}.uniqueKey.name' must be a string`);
      }

      symbol.uniqueKey = {
        name: (raw.uniqueKey as any).name,
        map:
          "map" in raw.uniqueKey && typeof raw.uniqueKey.map === "string"
            ? raw.uniqueKey.map
            : undefined,
        length:
          "length" in raw.uniqueKey && typeof raw.uniqueKey.length === "number"
            ? raw.uniqueKey.length
            : undefined,
        clustered:
          "clustered" in raw.uniqueKey &&
          typeof raw.uniqueKey.clustered === "boolean"
            ? raw.uniqueKey.clustered
            : undefined,
        sort:
          "sort" in raw.uniqueKey &&
          typeof raw.uniqueKey.sort === "string" &&
          ["Asc", "Desc"].includes(raw.uniqueKey.sort)
            ? (raw.uniqueKey.sort as "Asc" | "Desc")
            : undefined,
        fields: raw.uniqueKey.fields.map((item) => {
          if (typeof item === "string") {
            if (!(item in symbol.properties)) {
              throw new Error(
                `'${symbol.name}.uniqueKey.fields' has a field name '${item}' that isn't on the entity`,
              );
            }
            return {
              name: item,
            };
          }
          if (typeof item === "object") {
            if (!("name" in item) || typeof item.name !== "string") {
              throw new Error(
                `'${symbol.name}.uniqueKey.fields' has field missing name: ${JSON.stringify(item)}`,
              );
            }
            if (!(item.name in symbol.properties)) {
              throw new Error(
                `'${symbol.name}.uniqueKey.fields' has a field name '${item.name}' that isn't on the entity`,
              );
            }
            return {
              name: item.name,
              length:
                "length" in item && typeof item.length === "number"
                  ? item.length
                  : undefined,
              sort:
                "sort" in item && typeof item.sort === "string"
                  ? item.sort === "Desc"
                    ? "Desc"
                    : "Asc"
                  : undefined,
            };
          }

          throw new Error(
            `'${symbol.name}.uniqueKey' has invalid specification: ${JSON.stringify(item)}`,
          );
        }),
      };
    } else {
      throw new Error(`'${symbol.name}.uniqueKey' incorrectly specified`);
    }
  }

  if ("index" in raw && raw.index) {
    if (typeof raw.index === "string") {
      if (!(raw.index in symbol.properties)) {
        throw new Error(
          `'${symbol.name}.index' has field name '${raw.index}' which doesn't exist in the entity`,
        );
      }
      symbol.index = [raw.index];
    } else if (Array.isArray(raw.index)) {
      if (raw.index.every((item) => typeof item === "string")) {
        symbol.index = raw.index.map((item) => {
          if (!(item in symbol.properties)) {
            throw new Error(
              `'${symbol.name}.index.fields' has a field name '${item}' that isn't on the entity`,
            );
          }
          return item;
        });
      } else {
        symbol.index = {
          fields: raw.index.map((item) => {
            if (typeof item === "string") {
              if (!(item in symbol.properties)) {
                throw new Error(
                  `'${symbol.name}.index.fields' has a field name '${item}' that isn't on the entity`,
                );
              }
              return {
                name: item,
              };
            }
            if (typeof item === "object") {
              if (!("name" in item) || typeof item.name !== "string") {
                throw new Error(
                  `'${symbol.name}.index' has field missing name: ${JSON.stringify(item)}`,
                );
              }
              if (!(item.name in symbol.properties)) {
                throw new Error(
                  `'${symbol.name}.index.fields' has a field name '${item.name}' that isn't on the entity`,
                );
              }
              return {
                name: item.name,
                length:
                  "length" in item && typeof item.length === "number"
                    ? item.length
                    : undefined,
                sort:
                  "sort" in item && typeof item.sort === "string"
                    ? item.sort === "Desc"
                      ? "Desc"
                      : "Asc"
                    : undefined,
              };
            }

            throw new Error(
              `'${symbol.name}.index' has invalid specification: ${JSON.stringify(item)}`,
            );
          }),
        };
      }
    } else if (typeof raw.index === "object") {
      if (!("fields" in raw.index)) {
        throw new Error(`'${symbol.name}.index' is missing 'fields'`);
      }

      if (!Array.isArray(raw.index.fields)) {
        throw new Error(`'${symbol.name}.index.fields' needs to be a list`);
      }

      if ("name" in raw.index && typeof raw.index.name !== "string") {
        throw new Error(`'${symbol.name}.index.name' must be a string`);
      }

      symbol.index = {
        name: (raw.index as any).name,
        map:
          "map" in raw.index && typeof raw.index.map === "string"
            ? raw.index.map
            : undefined,
        length:
          "length" in raw.index && typeof raw.index.length === "number"
            ? raw.index.length
            : undefined,
        clustered:
          "clustered" in raw.index && typeof raw.index.clustered === "boolean"
            ? raw.index.clustered
            : undefined,
        sort:
          "sort" in raw.index &&
          typeof raw.index.sort === "string" &&
          ["Asc", "Desc"].includes(raw.index.sort)
            ? (raw.index.sort as "Asc" | "Desc")
            : undefined,
        fields: raw.index.fields.map((item) => {
          if (typeof item === "string") {
            if (!(item in symbol.properties)) {
              throw new Error(
                `'${symbol.name}.index.fields' has a field name '${item}' that isn't on the entity`,
              );
            }
            return {
              name: item,
            };
          }
          if (typeof item === "object") {
            if (!("name" in item) || typeof item.name !== "string") {
              throw new Error(
                `'${symbol.name}.index.fields' has field missing name: ${JSON.stringify(item)}`,
              );
            }
            if (!(item.name in symbol.properties)) {
              throw new Error(
                `'${symbol.name}.index.fields' has a field name '${item.name}' that isn't on the entity`,
              );
            }
            return {
              name: item.name,
              length:
                "length" in item && typeof item.length === "number"
                  ? item.length
                  : undefined,
              sort:
                "sort" in item && typeof item.sort === "string"
                  ? item.sort === "Desc"
                    ? "Desc"
                    : "Asc"
                  : undefined,
            };
          }

          throw new Error(
            `'${symbol.name}.index' has invalid specification: ${JSON.stringify(item)}`,
          );
        }),
      };
    } else {
      throw new Error(`'${symbol.name}.index' incorrectly specified`);
    }
  }

  return symbol;
}
