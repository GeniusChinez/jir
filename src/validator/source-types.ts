import { SymbolKind } from "./symbols";

function reap(guy: string) {
  switch (guy) {
    case "entity":
      return SymbolKind.Entity;
    case "enum":
      return SymbolKind.Enum;
    case "object":
      return SymbolKind.Object;
    case "string":
      return SymbolKind.Text;
    case "number":
      return SymbolKind.Number;
    case "date":
      return SymbolKind.DateTime;
    case "boolean":
      return SymbolKind.Boolean;
    case "list":
      return SymbolKind.List;
    default:
      return guy;
  }
}
export function parseTypeFromSource(datum: string | { type: string }) {
  if (typeof datum === "string") {
    return reap(datum);
  }
  return reap(datum.type);
}
