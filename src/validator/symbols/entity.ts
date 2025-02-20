import { z } from "zod";
import { SymbolKindSchema, SymbolSchema, SymbolStatusSchema } from ".";
import { BooleanSchema } from "../boolean.schema";
import { EntityOperationsSchema } from "../entity.operations";
import { ReferenceSchema } from "../reference.schema";
import { SortOrderSchema } from "src/schemas/sort";

export const RawEntityUniqueKeySchema = z.object({
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
  required: BooleanSchema,
  relations: ReferenceSchema.optional(),
});

export const RawEntitySymbolSchema = z.object({
  properties: z.record(z.string(), EntityPropertySchema),
  permissions: z.record(z.string(), z.string().array()),
  abstract: BooleanSchema.optional(),
  operations: EntityOperationsSchema,
  final: BooleanSchema.optional(),
  ignore: BooleanSchema.optional(),
  compositeKey: z.string().array().optional(),
  schema: z.string().optional(),
  uniqueKey: EntityUniqueKeySchema.optional(),
  index: EntityIndexSchema.optional(),
});

export const EntitySymbolSchema = SymbolSchema.merge(RawEntitySymbolSchema);
export type EntitySymbol = z.infer<typeof EntitySymbolSchema>;
