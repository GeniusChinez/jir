/* eslint-disable @typescript-eslint/no-explicit-any */

import { isAlnum, isAlpha } from "./chars";
import { ValidationContext } from "./context";
import {
  EntitySymbol,
  EnumSymbol,
  FKOnChange,
  ListSymbol,
  NumberSymbol,
  ObjectSymbol,
  Symbol,
  SymbolKind,
  SymbolStatus,
  TextSymbol,
} from "./symbols";
import {
  EntityOperationsSchema,
  EntityPermissionsSchema,
  globalEntityOperations,
} from "./entity";

export function resolve(context: ValidationContext) {
  Object.keys(context.table).forEach((name) => {
    context.table[name] = resolveSymbol(context.table[name], context);
  });
}

export function resolveName(name: string, context: ValidationContext) {
  if (!(name in context.table)) {
    throw new Error(`Referencing undefined name '${name}'`);
  }
  context.table[name] = resolveSymbol(context.table[name], context);
  context.table[name].referenceCount += 1;
  return context.table[name];
}

export function resolveSymbol(symbol: Symbol, context: ValidationContext) {
  if (symbol.status === SymbolStatus.Resolved) {
    return symbol;
  }

  if (symbol.status === SymbolStatus.Resolving) {
    throw new Error(`Cyclic dependency on '${symbol.name}'`);
  }

  symbol.status = SymbolStatus.Resolving;
  const resolvedSymbol = actuallyResolveSymbol(symbol, context);
  resolvedSymbol["raw"] = {};
  resolvedSymbol.status = SymbolStatus.Resolved;

  return resolvedSymbol;
}

export function actuallyResolveSymbol(
  symbol: Symbol,
  context: ValidationContext,
) {
  switch (symbol.type) {
    case SymbolKind.Text:
      return resolveTextSymbol(symbol, context);
    case SymbolKind.Boolean:
      break;
    case SymbolKind.Number:
      return resolveNumberSymbol(symbol, context);
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

export function resolveNumberSymbol(
  _symbol: Symbol,
  context: ValidationContext,
) {
  const symbol: NumberSymbol = {
    ..._symbol,
  };

  const { raw } = _symbol;

  if ("references" in raw) {
    if (context.target !== "mysql") {
      throw new Error(
        `For '${symbol.name}', number fields that reference other tables/collections are not allowed in '${context.target}'`,
      );
    }

    if (typeof raw.references === "string") {
      const reference = resolveName(raw.references, context);
      if (reference.type !== SymbolKind.Entity) {
        throw new Error(
          `'${symbol.name}' is referencing a non-entity type '${raw.references}'`,
        );
      }

      symbol.references = {
        field: "id",
        name: raw.references,
        onDelete: "NoAction",
        onUpdate: "NoAction",
      };
    } else if (raw.references && typeof raw.references === "object") {
      if (
        !("entity" in raw.references) ||
        typeof raw.references.entity !== "string"
      ) {
        throw new Error(
          `'${symbol.name}' has a reference definition missing 'entity' entry`,
        );
      }

      if (
        !("field" in raw.references) ||
        typeof raw.references.field !== "string"
      ) {
        throw new Error(
          `'${symbol.name}' has a reference definition missing 'field' entry`,
        );
      }

      const reference = resolveName(raw.references.entity, context);

      if (reference.type !== SymbolKind.Entity) {
        throw new Error(
          `'${symbol.name}' is referencing a non-entity type '${raw.references.entity}'`,
        );
      }

      symbol.references = {
        name: raw.references.entity,
        field: raw.references.field,
        onDelete: "NoAction",
        onUpdate: "NoAction",
      };

      if ("onDelete" in raw.references) {
        if (
          typeof raw.references.onDelete !== "string" ||
          !["NoAction", "Cascade", "SetNull", "Restrict"].includes(
            raw.references.onDelete,
          )
        ) {
          throw new Error(
            `'${symbol.name}' has an unknown onDelete option '${raw.references.onDelete}'`,
          );
        }

        symbol.references.onDelete = raw.references.onDelete as FKOnChange;
      }

      if ("onUpdate" in raw.references) {
        if (
          typeof raw.references.onUpdate !== "string" ||
          !["NoAction", "Cascade", "SetNull", "Restrict"].includes(
            raw.references.onUpdate,
          )
        ) {
          throw new Error(
            `'${symbol.name}' has an unknown onUpdate option '${raw.references.onUpdate}'`,
          );
        }
        symbol.references.onUpdate = raw.references.onUpdate as FKOnChange;
      }
    } else {
      throw new Error(
        `${symbol.name} is referencing the unknown '${raw.references}'`,
      );
    }
  }

  return symbol;
}

export function resolveTextSymbol(_symbol: Symbol, context: ValidationContext) {
  const symbol: TextSymbol = {
    ..._symbol,
  };

  const { raw } = _symbol;

  if ("references" in raw) {
    if (context.target !== "mongodb") {
      throw new Error(
        `For '${symbol.name}', text fields that reference other tables/collections are not allowed in '${context.target}'`,
      );
    }

    if (typeof raw.references === "string") {
      const reference = resolveName(raw.references, context);
      if (reference.type !== SymbolKind.Entity) {
        throw new Error(
          `'${symbol.name}' is referencing a non-entity type '${raw.references}'`,
        );
      }

      symbol.references = {
        field: "id",
        name: raw.references,
        onDelete: "NoAction",
        onUpdate: "NoAction",
      };
    } else if (raw.references && typeof raw.references === "object") {
      if (
        !("entity" in raw.references) ||
        typeof raw.references.entity !== "string"
      ) {
        throw new Error(
          `'${symbol.name}' has a reference definition missing 'entity' entry`,
        );
      }

      if (
        !("field" in raw.references) ||
        typeof raw.references.field !== "string"
      ) {
        throw new Error(
          `'${symbol.name}' has a reference definition missing 'field' entry`,
        );
      }

      const reference = resolveName(raw.references.entity, context);

      if (reference.type !== SymbolKind.Entity) {
        throw new Error(
          `'${symbol.name}' is referencing a non-entity type '${raw.references.entity}'`,
        );
      }

      symbol.references = {
        name: raw.references.entity,
        field: raw.references.field,
        onDelete: "NoAction",
        onUpdate: "NoAction",
      };

      if ("onDelete" in raw.references) {
        if (
          typeof raw.references.onDelete !== "string" ||
          !["NoAction", "Cascade", "SetNull", "Restrict"].includes(
            raw.references.onDelete,
          )
        ) {
          throw new Error(
            `'${symbol.name}' has an unknown onDelete option '${raw.references.onDelete}'`,
          );
        }

        symbol.references.onDelete = raw.references.onDelete as FKOnChange;
      }

      if ("onUpdate" in raw.references) {
        if (
          typeof raw.references.onUpdate !== "string" ||
          !["NoAction", "Cascade", "SetNull", "Restrict"].includes(
            raw.references.onUpdate,
          )
        ) {
          throw new Error(
            `'${symbol.name}' has an unknown onUpdate option '${raw.references.onUpdate}'`,
          );
        }
        symbol.references.onUpdate = raw.references.onUpdate as FKOnChange;
      }
    } else {
      throw new Error(
        `${symbol.name} is referencing the unknown '${raw.references}'`,
      );
    }
  }

  return symbol;
}

export function resolveEnumSymbol(_symbol: Symbol, context: ValidationContext) {
  const symbol: EnumSymbol = {
    ..._symbol,
    values: [],
    final: "final" in _symbol.raw && !!_symbol.raw.final,
  };

  const { raw } = _symbol;

  if (!("values" in raw)) {
    throw new Error(`Enum '${symbol.name}' is missing 'values'`);
  }

  if (
    !Array.isArray(raw.values) ||
    !raw.values.every((member) => typeof member === "string")
  ) {
    throw new Error(`Enum '${symbol.name}' must have strings in 'values'`);
  }

  if (!raw.values.length) {
    throw new Error(`Enum '${symbol.name}' must have strings in 'values'`);
  }

  symbol.values = raw.values;

  if ("extends" in raw) {
    if (typeof raw.extends === "string") {
      const parent = resolveName(raw.extends, context);

      if ("final" in parent && parent.final) {
        throw new Error(
          `'${symbol.name}' cannot extend '${raw.extends}' as that guy is marked 'final'`,
        );
      }

      if (![SymbolKind.Enum].includes(parent.type)) {
        throw new Error(
          `'${symbol.name}' cannot extend a non-enum type '${raw.extends}'`,
        );
      }

      if (!("values" in parent) || !Array.isArray(parent.values)) {
        throw new Error(
          `'${symbol.name}' is extending a type with missing values '${raw.extends}'`,
        );
      }

      symbol.values = [
        ...new Set([...symbol.values, ...(parent.values as [])]),
      ];
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

            if (![SymbolKind.Enum].includes(parent.type)) {
              throw new Error(
                `'${symbol.name}' cannot extend a non-enum type '${raw.extends}'`,
              );
            }

            if (!("values" in parent) || !Array.isArray(parent.values)) {
              throw new Error(
                `'${symbol.name}' is extending a type with missing values '${raw.extends}'`,
              );
            }

            symbol.values = [
              ...new Set([...symbol.values, ...(parent.values as [])]),
            ];
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

    const propertyAsSymbol: Symbol = {
      name: displayName,
      referenceCount: 0,
      raw: property,
      status: SymbolStatus.Unresolved,
      type: (() => {
        switch (property.type) {
          case "entity": {
            throw new Error(
              `type '${property.type}' not allowed for '${displayName}'`,
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
            return property.type;
        }
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

export function resolveListSymbol(_symbol: Symbol, context: ValidationContext) {
  const symbol: ListSymbol = {
    ..._symbol,
    of: {} as any,
  };

  const { raw } = _symbol;

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

  return symbol;
}

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

    const propertyAsSymbol: Symbol = {
      name: displayName,
      referenceCount: 0,
      raw: property,
      status: SymbolStatus.Unresolved,
      type: (() => {
        switch (property.type) {
          case "entity": {
            throw new Error(
              `type '${property.type}' not allowed for '${displayName}'`,
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
            return property.type;
        }
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

  return symbol;
}

// @todo: Find a way to deal with cyclic dependencies for foreign and primary keys
// @todo: Do not permit object property types that "reference" other models
// @todo: Do not permit object list property types that have base types that "reference" other models
// @todo: Deal with list base types that reference other models
