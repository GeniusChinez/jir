import { DateOptions } from "./dates.options";
import { NumberOptions } from "./numbers.options";
import { TextOptions } from "./text.options";

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
  DateTime = "DateTime",
  List = "List",
}

export interface Symbol {
  name: string;
  status: SymbolStatus;
  referenceCount: number;
  type: SymbolKind;
  raw: object;
  map?: string;
  db?: string[];
  visibility?: "public" | "private" | "admin" | "system" | "inherit"; // being optional means inherit
}

export type FKOnChange = "NoAction" | "Cascade" | "Restrict" | "SetNull";

export interface NumberSymbol extends Symbol, NumberOptions {
  references?: {
    name: string;
    field: string;
    onDelete: FKOnChange;
    onUpdate: FKOnChange;
  };
  variant?: "decimal" | "bigint" | "int" | "float";
  unique?: boolean;
  autoincrement?: boolean;
  defaultValue?: bigint | number;
}

export interface DateTimeSymbol extends Symbol, DateOptions {
  defaultValue?: Date;
}

export interface EnumSymbol extends Symbol {
  values: string[];
  final?: boolean;
  abstract?: boolean;
}

export interface ObjectSymbol extends Symbol {
  properties: {
    [key: string]: {
      name: string;
      type: SymbolKind;
      status: SymbolStatus;
      optional?: boolean;
    };
  };
  abstract?: boolean; // is purely inherited from...never instantiated concretely
  final?: boolean; // cannot be inherited from
}

export interface TextSymbol extends Symbol, TextOptions {
  defaultValue?: string;
  references?: {
    name: string;
    field: string;
    onDelete: FKOnChange;
    onUpdate: FKOnChange;
  };
  unique?: boolean;
  long?: boolean;
  medium?: boolean;
  short?: boolean;
}

export interface ListSymbol extends Symbol {
  of: Symbol;
  nonempty?: boolean;
  some?:
    | NumberOptions<{ kind: SymbolKind.Number }>
    | TextOptions<{ kind: SymbolKind.Text }>
    | DateOptions<{ kind: SymbolKind.DateTime }>;
}

export interface EntitySymbol extends Symbol {
  properties: {
    [key: string]: {
      name: string;
      type: SymbolKind;
      status: SymbolStatus;
      optional?: boolean;
      // relations
    };
  };
  abstract?: boolean; // is purely inherited from...never instantiated concretely
  final?: boolean; // cannot be inherited from
  operations: string[];
  permissions: Record<string, string[]>;

  uniqueKey?:
    | {
        fields: (
          | string
          | { name: string; length?: number; sort?: "Asc" | "Desc" }
        )[];
        name?: string;
        map?: string;
        length?: number;
        sort?: "Asc" | "Desc";
        clustered?: boolean;
      }
    | string[];
  index?:
    | {
        fields: (
          | string
          | { name: string; length?: number; sort?: "Asc" | "Desc" }
        )[];
        name?: string;
        map?: string;
        length?: number;
        sort?: "Asc" | "Desc";
        clustered?: boolean;
        ops?: string;
      }
    | string[];
  ignore?: boolean;
  compositeKey?: string[];
  schema?: string;
}

export type SymbolTable = { [key: string]: Symbol };
