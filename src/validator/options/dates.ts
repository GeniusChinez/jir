import { z } from "zod";
import { DateTimeSchema } from "../date.schema";
import { BooleanSchema } from "../boolean.schema";

export const DateValidationOptionsSchema = z.object({
  in: DateTimeSchema.array().optional(),
  notIn: DateTimeSchema.array().optional(),
  gt: DateTimeSchema.optional(),
  gte: DateTimeSchema.optional(),
  lt: DateTimeSchema.optional(),
  lte: DateTimeSchema.optional(),
  eq: DateTimeSchema.optional(),
  neq: DateTimeSchema.optional(),
  past: BooleanSchema.optional(),
  future: BooleanSchema.optional(),
  updatedAt: BooleanSchema.optional(),
  createdAt: BooleanSchema.optional(),
});

export type DateValidationOptions = z.infer<typeof DateValidationOptionsSchema>;
export const DateOptionsSchema = DateValidationOptionsSchema;

export type DateOptions<T = []> = T extends []
  ? z.infer<typeof DateOptionsSchema>
  : z.infer<typeof DateOptionsSchema> & T;
