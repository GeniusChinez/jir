import { ValidationContext } from "./context";
import { resolveSymbol } from "./resolve.symbol";

export function resolveName(name: string, context: ValidationContext) {
  if (!(name in context.table)) {
    throw new Error(`Referencing undefined name '${name}'`);
  }
  context.table[name] = resolveSymbol(context.table[name], context);
  context.table[name].referenceCount += 1;
  return context.table[name];
}
