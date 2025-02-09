/* eslint-disable @typescript-eslint/no-explicit-any */
import { SymbolKind, SymbolStatus } from "./symbols";
import { ValidationContext } from "./context";

export const context: ValidationContext = {
  target: "mongodb",
  table: {},
};

export function define(details: any) {
  if (!("name" in details)) {
    throw new Error(`Found unnamed top-level definition`);
  }

  const { name } = details;

  if (name in context.table) {
    throw new Error(`Redefinition of '${name}'`);
  }

  if (!("type" in details)) {
    throw new Error(`${details.name} needs a 'type'`);
  }

  context.table[name] = {
    name,
    referenceCount: 0,
    raw: details,
    status: SymbolStatus.Unresolved,
    type: (() => {
      switch (details.type) {
        case "entity":
          return SymbolKind.Entity;
        case "enum":
          return SymbolKind.Enum;
        case "object":
          return SymbolKind.Object;
        default: {
          throw new Error(
            `Unkown type '${details.type}' for '${details.name}'`,
          );
        }
      }
    })(),
  };
}
