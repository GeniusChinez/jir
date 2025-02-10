/* eslint-disable @typescript-eslint/no-explicit-any */
import { isValidColumnName } from "./chars";
import { ValidationContext } from "./context";
import { resolveName } from "./resolve.name";
import { FKOnChange, Symbol, SymbolKind, TextSymbol } from "./symbols";
import { checkConflicts, extractBooleanFields } from "./utils";

export function resolveTextSymbol(_symbol: Symbol, context: ValidationContext) {
  const symbol: TextSymbol = {
    ..._symbol,
    visibility:
      "private" in _symbol.raw && !!_symbol.raw.private ? "private" : "public",
  };

  extractBooleanFields(symbol, _symbol.raw, [
    "unique",
    "long",
    "medium",
    "short",
    "lowercase",
    "uppercase",
    "kebabcase",
    "screamingcase",
    "camelcase",
    "pascalcase",
    "nospaces",
    "nonempty",
    "nospecial",
    "alphanumeric",
    "alphabetic",
    "numeric",
    "url",
    "email",
    "ipaddress",
    "uuid",
    "cuid",
    "ulid",
    "cidr",
    "objectId",
    "secret",
    "slug",
    "base64",
    "trim",
    "time",
    "datetime",
    "date",
    "password",
  ]);

  checkConflicts(symbol, [
    // Casing styles (only one should be true)
    [
      "lowercase",
      "uppercase",
      "camelcase",
      "pascalcase",
      "kebabcase",
      "screamingcase",
    ],

    // Length constraints (only one should be true)
    ["long", "medium", "short"],

    // Space-related rules (nospaces may conflict with slug or other formats)
    ["nospaces", "slug"],

    // Character type constraints (only one should be true)
    ["alphabetic", "numeric", "alphanumeric"],

    // Special formats (only one should be true)
    [
      "url",
      "email",
      "ipaddress",
      "uuid",
      "cuid",
      "ulid",
      "cidr",
      "objectId",
      "date",
      "datetime",
      "time",
      "base64",
    ],
  ]);

  const { raw } = _symbol;

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
      if (typeof value !== "number") {
        throw new Error(
          `Expected a numeric ${name} value for '${symbol.name}'`,
        );
      }
      (symbol as any)[rename || name] = value;
    }
  };

  reapNumberValue("max");
  reapNumberValue("min");
  reapNumberValue("default", "defaultValue");
  reapNumberValue("eq");
  reapNumberValue("neq");

  const reapStringValue = (name: string, rename?: string) => {
    if (name in raw) {
      const value = (raw as any)[name];
      if (typeof value !== "string") {
        throw new Error(`Expected a string ${name} value for '${symbol.name}'`);
      }
      (symbol as any)[rename || name] = value;
    }
  };

  reapStringValue("hash");
  reapStringValue("encrypt");

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
