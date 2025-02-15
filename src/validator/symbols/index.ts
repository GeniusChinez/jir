import { z } from "zod";
import { VisibilitySchema } from "../visibility";

export type { ListSymbol } from "./list";
export type { NumberSymbol } from "./number";
export type { TextOptions } from "../options/text";
export type { DateTimeSymbol } from "./datetime";
export type { EnumSymbol } from "./enum";
export type { EntitySymbol } from "./entity";
export type { ObjectSymbol } from "./object";
export type { TextSymbol } from "./text";
export type { SymbolTable } from "./_table";

export enum SymbolStatus {
  Unresolved = "Unresolved",
  Resolving = "Resolving",
  Resolved = "Resolved",
}

export const SymbolStatusSchema = z.nativeEnum(SymbolStatus);

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

export const SymbolKindSchema = z.nativeEnum(SymbolKind);

export const SymbolSchema = z.object({
  name: z.string(),
  status: SymbolStatusSchema,
  referenceCount: z.number().int().nonnegative(),
  type: SymbolKindSchema,
  raw: z.unknown(),
  map: z.string().optional(),
  db: z.string().optional(),
  visibility: VisibilitySchema,
});

export type Symbol = z.infer<typeof SymbolSchema>;
