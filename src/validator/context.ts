import { SymbolTable } from "./symbols/_table";
import { TargetDatabase } from "./target";

export interface ValidationContext {
  table: SymbolTable;
  target: TargetDatabase;
}
