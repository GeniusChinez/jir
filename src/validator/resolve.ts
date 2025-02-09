import { ValidationContext } from "./context";
import { resolveSymbol } from "./resolve.symbol";

export function resolve(context: ValidationContext) {
  Object.keys(context.table).forEach((name) => {
    context.table[name] = resolveSymbol(context.table[name], context);
  });
}

// @todo: Find a way to deal with cyclic dependencies for foreign and primary keys
// @todo: Do not permit object property types that "reference" other models
// @todo: Do not permit object list property types that have base types that "reference" other models
// @todo: Deal with list base types that reference other models
// @todo: handle more attributes for integer and text field types (eg, long? varchar?)
// @todo: ensure some enums can be "abstract" in the same way some entities and objects are
// @todo: add a way to append new operations to old ones during operations-spec (right now it replaces)
// @todo: permit simple string literal types for properties
// @todo: add support for datetime data types
