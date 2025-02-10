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
  variant?: "decimal" | "bigint" | "int" | "float";
  unique?: boolean;
  autoincrement?: boolean;
  defaultValue?: bigint | number;
  max?: bigint | number;
  min?: bigint | number;
  map?: string;
  even?: boolean;
  odd?: boolean;
  visibility: "private" | "public";
  positive?: boolean;
  negative?: boolean;
  nonzero?: boolean;
  nonnegative?: boolean;
  nonpositive?: boolean;
  abs?: boolean;
  gt?: bigint | number;
  gte?: bigint | number;
  lt?: bigint | number;
  lte?: bigint | number;
  eq?: bigint | number;
  neq?: bigint | number;
  plus?: bigint | number;
  minus?: bigint | number;
  divides?: bigint | number;
  divisors?: bigint | number;
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
  references?: {
    name: string;
    field: string;
    onDelete: FKOnChange;
    onUpdate: FKOnChange;
  };
  map?: string;
  visibility: "private" | "public";
  unique?: boolean;
  long?: boolean;
  medium?: boolean;
  short?: boolean;
  lowercase?: boolean;
  uppercase?: boolean;
  kebabcase?: boolean;
  screamingcase?: boolean;
  camelcase?: boolean;
  pascalcase?: boolean;
  nospaces?: boolean;
  nonempty?: boolean;
  nospecial?: boolean;
  alphanumeric?: boolean;
  alphabetic?: boolean;
  numeric?: boolean;
  url?: boolean;
  email?: boolean;
  ipaddress?: boolean;
  uuid?: boolean;
  cuid?: boolean;
  ulid?: boolean;
  cidr?: boolean;
  objectId?: boolean;
  secret?: boolean; // means it will be encrypted
  slug?: boolean;
  base64?: boolean;
  trim?: boolean;
  time?: boolean;
  datetime?: boolean;
  date?: boolean;
  encrypt?: string;
  hash?: string;
  password?: boolean;
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
