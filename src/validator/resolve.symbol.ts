import { ValidationContext } from "./context";
import { actuallyResolveSymbol } from "./resolve.symbol.actually";
import { Symbol, SymbolStatus } from "./symbols";

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
