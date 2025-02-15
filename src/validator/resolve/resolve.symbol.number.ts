/* eslint-disable @typescript-eslint/no-explicit-any */
import { isValidColumnName } from "../chars";
import { ValidationContext } from "../context";
import { resolveName } from "./resolve.name";
import { FKOnChange, NumberSymbol, Symbol, SymbolKind } from "./symbols";
import { checkConflicts, extractBooleanFields } from "../utils";

export function resolveNumberSymbol(
  _symbol: Symbol,
  context: ValidationContext,
) {
  const symbol: NumberSymbol = {
    ..._symbol,
    visibility:
      "private" in _symbol.raw && !!_symbol.raw.private ? "private" : "public",
  };

  extractBooleanFields(symbol, _symbol.raw, [
    "autoincrement",
    "unique",
    "even",
    "odd",
    "positive",
    "negative",
    "nonnegative",
    "nonpositive",
    "nonzero",
    "abs",
    "id",
  ]);

  checkConflicts(symbol, [
    ["even", "odd"],
    ["negative", "positive"],
    ["negative", "nonnegative"],
    ["positive", "nonpositive"],
    ["nonnegative", "nonpositive"],
    ["negative", "abs"],
  ]);

  if (context.target === "mongodb" && symbol.id) {
    throw new Error(
      `${context.target} cannot have numeric record IDs ('${symbol.name}')`,
    );
  }

  const { raw } = _symbol;

  if ("variant" in raw) {
    if (typeof raw.variant !== "string") {
      throw new Error(`Unknown variant '${raw.variant}' for '${symbol.name}'`);
    }

    if (!["int", "float", "decimal", "bigint"].includes(raw.variant)) {
      throw new Error(`Unknown variant '${raw.variant}' for '${symbol.name}'`);
    }

    symbol.variant = raw.variant as typeof symbol.variant;
  }

  if ("map" in raw) {
    if (typeof raw.map !== "string" || !isValidColumnName(raw.map)) {
      throw new Error(
        `Invalid database column/field name '${raw.map}' while mapping for '${symbol.name}'`,
      );
    }
    symbol.map = raw.map;
  }

  const reapNumberValue = (name: string, rename?: string) => {
    if (name in raw) {
      const value = (raw as any)[name];
      if (symbol.variant === "bigint") {
        if (!["bigint", "number"].includes(typeof value)) {
          throw new Error(
            `Expected a numeric ${name} value for '${symbol.name}'`,
          );
        }
        (symbol as any)[rename || name] = BigInt(value as any);
      } else {
        if (typeof value !== "number") {
          throw new Error(
            `Expected a numeric ${name} value for '${symbol.name}'`,
          );
        }
        (symbol as any)[rename || name] = value;
      }
    }
  };

  reapNumberValue("max");
  reapNumberValue("min");
  reapNumberValue("default", "defaultValue");
  reapNumberValue("gt");
  reapNumberValue("gte");
  reapNumberValue("lt");
  reapNumberValue("lte");
  reapNumberValue("eq");
  reapNumberValue("neq");
  reapNumberValue("mod");
  reapNumberValue("plus");
  reapNumberValue("minus");
  reapNumberValue("divides");
  reapNumberValue("divisor");

  if (symbol.even || symbol.odd) {
    // @note: are we sure about this?
    symbol.variant = "int";
  }

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
