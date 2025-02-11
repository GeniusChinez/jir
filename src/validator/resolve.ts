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
// @todo: permit descriptions in fields
// @todo: permit descriptions in inline field types. Eg { "name": "string - The name of the user" }
// @todo: permit strict mode, which throws errors if it meets unknown fields
// @todo: add underlying db-type specification in field types
// @todo: permit @decimal to optionally be like: @decimal(10,2)
