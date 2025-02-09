import { SymbolTable } from "./symbols";

export interface ValidationContext {
  table: SymbolTable;
  target: "mongodb" | "mysql" | "sqlite" | "postgresql";
}
