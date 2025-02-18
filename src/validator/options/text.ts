import { EncryptionAlgorithmSchema } from "../../helpers/encryption.algorithms";
import { HashingAlgorithmSchema } from "../../helpers/hashing.algorithms";
import { z } from "zod";
import { BooleanSchema } from "../boolean.schema";

export const TextTranformationOptionsSchema = z.object({
  lowercase: z.boolean().optional(),
  uppercase: z.boolean().optional(),
  kebabcase: z.boolean().optional(),
  screamingcase: z.boolean().optional(),
  camelcase: z.boolean().optional(),
  pascalcase: z.boolean().optional(),
  nospaces: z.boolean().optional(),
  secret: z.boolean().optional(),
  slug: z.boolean().optional(),
  trim: z.boolean().optional(),
  encrypt: EncryptionAlgorithmSchema.optional(),
  hash: HashingAlgorithmSchema.optional(),
  password: z.boolean().optional(),
});

export type TextTranformationOptions = z.infer<
  typeof TextTranformationOptionsSchema
>;

export const TextValidationOptionsSchema = z.object({
  max: z.number().nonnegative().optional(),
  min: z.number().nonnegative().optional(),
  nonempty: z.boolean().optional(),
  nospecial: z.boolean().optional(),
  alphanumeric: z.boolean().optional(),
  alphabetic: z.boolean().optional(),
  numeric: z.boolean().optional(),
  url: z.boolean().optional(),
  email: z.boolean().optional(),
  ipaddress: z.boolean().optional(),
  uuid: z.boolean().optional(),
  cuid: z.boolean().optional(),
  ulid: z.boolean().optional(),
  cidr: z.boolean().optional(),
  objectId: z.boolean().optional(),
  base64: z.boolean().optional(),
  time: z.boolean().optional(),
  datetime: z.boolean().optional(),
  date: z.boolean().optional(),
  id: z.boolean().optional(),
  in: z.string().array().optional(),
  includes: z.string().or(z.string().array()).optional(),
  excludes: z.string().or(z.string().array()).optional(),
  notIn: z.string().array().optional(),
  regex: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  long: BooleanSchema.optional(),
  medium: BooleanSchema.optional(),
  short: BooleanSchema.optional(),
});

export type TextValidationOptions = z.infer<typeof TextValidationOptionsSchema>;

export const TextOptionsSchema = TextValidationOptionsSchema.merge(
  TextTranformationOptionsSchema,
);
export type TextOptions<T = []> = T extends []
  ? z.infer<typeof TextOptionsSchema>
  : z.infer<typeof TextOptionsSchema> & T;
