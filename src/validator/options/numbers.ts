import { z } from "zod";
import { NumberValueSchema } from "../number-value";

export const NumberTransformationOptionsSchema = z.object({
  plus: z.optional(z.number().or(z.bigint())),
  minus: z.optional(z.number().or(z.bigint())),
  abs: z.boolean(),
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
  id: z.boolean().optional(),
  even: z.boolean().optional(),
  odd: z.boolean().optional(),
  max: NumberValueSchema.optional(),
  min: NumberValueSchema.optional(),
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
