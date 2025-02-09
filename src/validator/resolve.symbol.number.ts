import { ValidationContext } from "./context";
import { resolveName } from "./resolve.name";
import { FKOnChange, NumberSymbol, Symbol, SymbolKind } from "./symbols";

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
