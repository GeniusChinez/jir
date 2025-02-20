import { z } from "zod";
import { SymbolKindSchema, SymbolSchema, SymbolStatusSchema } from ".";
import { BooleanSchema } from "../boolean.schema";
import { EntityOperationsSchema } from "../entity.operations";
import { ReferenceSchema } from "../reference.schema";
import { SortOrderSchema } from "../../schemas/sort";

export const RawEntityUniqueKeySchema = z.object({
  fields: z.string().array(),
  name: z.string().optional(),
  map: z.string().optional(),
  length: z.number().nonnegative().optional(),
  sort: SortOrderSchema.optional(),
  clustered: BooleanSchema.optional(),
});

export const EntityUniqueKeySchema = RawEntityUniqueKeySchema.or(
  z.string().array(),
);
export const EntityIndexSchema = RawEntityUniqueKeySchema.extend({
  ops: z.string().optional(),
}).or(z.string().array());

export const EntityPropertySchema = z.object({
  name: z.string(),
  type: SymbolKindSchema,
  status: SymbolStatusSchema,
  optional: BooleanSchema.optional(),
  reference: ReferenceSchema.optional(),
});

export const RawEntitySymbolSchema = z.object({
  properties: z.record(z.string(), EntityPropertySchema),
  permissions: z.record(z.string(), z.string().array()).optional(),
  abstract: BooleanSchema.optional(),
  operations: EntityOperationsSchema.default("*"),
  final: BooleanSchema.optional(),
  ignore: BooleanSchema.optional(),
  compositeKey: z.string().array().optional(),
  schema: z.string().optional(),
  uniqueKey: EntityUniqueKeySchema.optional(),
  index: EntityIndexSchema.optional(),
  extends: z.string().or(z.string().array()).optional(),
});

export const EntitySymbolSchema = SymbolSchema.merge(RawEntitySymbolSchema);
export type EntitySymbol = z.infer<typeof EntitySymbolSchema>;
