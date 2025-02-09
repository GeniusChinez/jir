export enum SymbolStatus {
  Unresolved = "Unresolved",
  Resolving = "Resolving",
  Resolved = "Resolved",
}

export enum SymbolKind {
  Enum = "Enum",
  Entity = "Entity",
  Object = "Object",

  Text = "Text",
  Number = "Number",
  Boolean = "Boolean",
  List = "List",
}

export interface Symbol {
  name: string;
  status: SymbolStatus;
  referenceCount: number;
  type: SymbolKind;
  raw: object;
}

export type FKOnChange = "NoAction" | "Cascade" | "Restrict" | "SetNull";

export interface NumberSymbol extends Symbol {
  references?: {
    name: string;
    field: string;
    onDelete: FKOnChange;
    onUpdate: FKOnChange;
  };
  variant?: "decimal" | "bigint" | "int";
}

export interface EnumSymbol extends Symbol {
  values: string[];
  final?: boolean;
}

export interface ObjectSymbol extends Symbol {
  properties: {
    [key: string]: {
      name: string;
      type: SymbolKind;
      status: SymbolStatus;
    };
  };
  abstract?: boolean; // is purely inherited from...never instantiated concretely
  final?: boolean; // cannot be inherited from
}

export interface TextSymbol extends Symbol {
  maxLength?: number;
  isLongText?: boolean;
  references?: {
    name: string;
    field: string;
    onDelete: FKOnChange;
    onUpdate: FKOnChange;
  };
}

export interface ListSymbol extends Symbol {
  of: Symbol;
}

export interface EntitySymbol extends Symbol {
  properties: {
    [key: string]: {
      name: string;
      type: SymbolKind;
      status: SymbolStatus;
    };
  };
  visibility: "public" | "private" | "admin" | "system"; // public -> anyone, private -> logged-in, admin -> only admins, system -> only the system
  abstract?: boolean; // is purely inherited from...never instantiated concretely
  final?: boolean; // cannot be inherited from
  operations: string[];
  permissions: Record<string, string[]>;
}

export type SymbolTable = { [key: string]: Symbol };
