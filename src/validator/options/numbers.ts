import { z } from "zod";
import { NumberValueSchema, NumberVariantSchema } from "../number-value";
import { BooleanSchema } from "../boolean.schema";

export const NumberTransformationOptionsSchema = z.object({
  plus: z.optional(z.number().or(z.bigint())),
  minus: z.optional(z.number().or(z.bigint())),
  abs: z.boolean().optional(),
});

export type NumberTransformationOptions = z.infer<
  typeof NumberTransformationOptionsSchema
>;

// ----------------
export const NumberValidationOptionsSchema = z.object({
  positive: z.boolean().optional(),
  negative: z.boolean().optional(),
  nonzero: z.boolean().optional(),
  nonnegative: z.boolean().optional(),
  nonpositive: z.boolean().optional(),
  gt: NumberValueSchema.optional(),
  gte: NumberValueSchema.optional(),
  lt: NumberValueSchema.optional(),
  lte: NumberValueSchema.optional(),
  eq: NumberValueSchema.optional(),
  neq: NumberValueSchema.optional(),
  in: NumberValueSchema.array().optional(),
  notIn: NumberValueSchema.array().optional(),
  divides: NumberValueSchema.array().optional(),
  divisors: NumberValueSchema.array().optional(),
  id: BooleanSchema.optional(),
  even: BooleanSchema.optional(),
  odd: BooleanSchema.optional(),
  max: NumberValueSchema.optional(),
  min: NumberValueSchema.optional(),
  variant: NumberVariantSchema.optional().default("int"),
});

export type NumberValidationOptions = z.infer<
  typeof NumberValidationOptionsSchema
>;

export const NumberOptionsSchema = NumberValidationOptionsSchema.merge(
  NumberTransformationOptionsSchema,
);
export type NumberOptions<T = []> = T extends []
  ? z.infer<typeof NumberOptionsSchema>
  : z.infer<typeof NumberOptionsSchema> & T;
