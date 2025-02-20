import { EncryptionAlgorithmSchema } from "../../schemas/encryption.algorithms";
import { HashingAlgorithmSchema } from "../../schemas/hashing.algorithms";
import { z } from "zod";
import { BooleanSchema } from "../boolean.schema";
import { ContinentSchema } from "../../schemas/continents";
import { CountryCodeSchema } from "../../schemas/countries";
import { CurrencyCodeSchema } from "../../schemas/currency";
import { eanVersions } from "../../schemas/ean";

export const TextTranformationOptionsSchema = z.object({
  lowercase: BooleanSchema.optional(),
  uppercase: BooleanSchema.optional(),
  kebabcase: BooleanSchema.optional(),
  screamingcase: BooleanSchema.optional(),
  camelcase: BooleanSchema.optional(),
  pascalcase: BooleanSchema.optional(),
  nospaces: BooleanSchema.optional(),
  secret: BooleanSchema.optional(),
  slugify: BooleanSchema.optional(),
  trim: BooleanSchema.optional(),
  encrypt: BooleanSchema.or(EncryptionAlgorithmSchema).optional(),
  hash: BooleanSchema.or(HashingAlgorithmSchema).optional(),
  password: BooleanSchema.optional(),
  reverse: BooleanSchema.optional(),
  capitalize: BooleanSchema.optional(),
  truncate: z.number().int().nonnegative().optional(),
  mask: z.string().length(1).optional(),
  titlecase: BooleanSchema.optional(),
  leftJoin: z.string().optional(),
  rightJoin: z.string().optional(),
  padRight: z
    .tuple([z.number().nonnegative(), z.string().length(1)])
    .optional(),
  padLeft: z.tuple([z.number().nonnegative(), z.string().length(1)]).optional(),
  substring: z
    .number()
    .nonnegative()
    .or(z.tuple([z.number().int().nonnegative(), z.number().int()]))
    .optional(),
  maskOccurances: z.tuple([z.string().min(1), z.string().min(1)]).optional(),
});

export type TextTranformationOptions = z.infer<
  typeof TextTranformationOptionsSchema
>;

export const TextValidationOptionsSchema = z.object({
  max: z.number().nonnegative().optional(),
  min: z.number().nonnegative().optional(),
  slug: BooleanSchema.optional(),
  length: z.number().nonnegative().optional(),
  nonempty: BooleanSchema.optional(),
  nospecial: BooleanSchema.optional(),
  alphanumeric: BooleanSchema.optional(),
  alphabetic: BooleanSchema.optional(),
  numeric: BooleanSchema.optional(),
  url: BooleanSchema.optional(),
  email: BooleanSchema.optional(),
  ip: BooleanSchema.or(z.literal("v4").or(z.literal("v6"))).optional(),
  mac: BooleanSchema.optional(),
  uuid: BooleanSchema.optional(),
  cuid: BooleanSchema.optional(),
  ulid: BooleanSchema.optional(),
  cidr: BooleanSchema.optional(),
  objectId: BooleanSchema.optional(),
  base64: BooleanSchema.optional(),
  time: BooleanSchema.optional(),
  datetime: BooleanSchema.optional(),
  date: BooleanSchema.optional(),
  id: BooleanSchema.optional(),
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
  ean: BooleanSchema.or(
    z.object({
      exclude: z.string().array().optional(),
      include: z.string().array().optional(),
      version: z.enum(eanVersions).optional(),
    }),
  ).optional(),
  isbn: BooleanSchema.or(
    z.object({
      exclude: z.string().array().optional(),
      include: z.string().array().optional(),
      version: z.literal("10").or(z.literal("13")).optional(),
    }),
  ).optional(),
  gtin: BooleanSchema.optional(),
  upc: BooleanSchema.or(
    z.object({
      exclude: z.string().array().optional(),
      include: z.string().array().optional(),
    }),
  ).optional(),
  vin: BooleanSchema.or(
    z.object({
      matches: z.string().optional(),
      exclude: z.string().array().optional(),
      include: z.string().array().optional(),
      wmi: z
        .string()
        .length(3)
        .or(
          z.object({
            exclude: z.string().length(3).array().optional(),
            include: z.string().length(3).array().optional(),
            matches: z.string().optional(),
          }),
        )
        .optional(), // 1-3
      vds: z
        .string()
        .length(4)
        .or(
          z.object({
            exclude: z.string().length(4).array().optional(),
            include: z.string().length(4).array().optional(),
            matches: z.string().optional(),
          }),
        )
        .optional(), // 4-8
      checkDigit: z.number().int().nonnegative().optional(), // 9
      modelYear: z
        .string()
        .length(1)
        .or(
          z.object({
            min: z.number().int().nonnegative(),
            max: z.number().int().nonnegative(),
            exclude: z.string().length(1).array().optional(),
            include: z.string().length(1).array().optional(),
            matches: z.string().optional(),
          }),
        )
        .optional(), // 10
      plantCode: z
        .string()
        .or(
          z.object({
            exclude: z.string().length(1).array().optional(),
            include: z.string().length(1).array().optional(),
            matches: z.string().optional(),
          }),
        )
        .optional(), // 11
      vis: z
        .string()
        .length(6)
        .or(
          z.object({
            exclude: z.string().length(6).array().optional(),
            include: z.string().length(6).array().optional(),
            matches: z.string().optional(),
          }),
        )
        .optional(), // 12-17
    }),
  ).optional(),
  mimeType: BooleanSchema.or(
    z.object({
      exclude: z.string().array().optional(),
      include: z.string().array().optional(),
      type: z
        .enum([
          "audio",
          "video",
          "image",
          "application",
          "text",
          "font",
          "multipart",
          "document",
          "web",
        ])
        .optional(),
      includeTypes: z.string().array().optional(),
      excludeTypes: z.string().array().optional(),
      subtype: z.string().optional(),
    }),
  ).optional(),
  html: BooleanSchema.optional(),
  json: BooleanSchema.optional(),
  csv: BooleanSchema.optional(),
  chessMove: BooleanSchema.optional(),
  pgn: BooleanSchema.optional(),
  fen: BooleanSchema.optional(),
  creditCardNumber: BooleanSchema.or(
    z.object({
      exclude: z.string().array().optional(),
      include: z.string().array().optional(),
      type: z.enum(["visa", "mastercard", "amex", "discover"]).optional(),
    }),
  ).optional(),
  phoneNumber: BooleanSchema.or(
    z.object({
      country: CountryCodeSchema.optional(),
      exclude: z.string().array().optional(),
      include: z.string().array().optional(),
    }),
  ).optional(),
  iban: BooleanSchema.or(
    z.object({
      exclude: z.string().array().optional(),
      include: z.string().array().optional(),
    }),
  ).optional(),
  ssn: BooleanSchema.or(
    z.object({
      exclude: z.string().array().optional(),
      include: z.string().array().optional(),
    }),
  ).optional(),
  currency: BooleanSchema.or(
    z.object({
      country: CountryCodeSchema.optional(),
      exclude: CurrencyCodeSchema.array().optional(),
      include: CurrencyCodeSchema.array().optional(),
      excludeCountries: CountryCodeSchema.array().optional(),
      includeCountries: CountryCodeSchema.array().optional(),
    }),
  ).optional(),
  country: BooleanSchema.or(
    z.object({
      continent: ContinentSchema.optional(),
      exclude: CountryCodeSchema.array().optional(),
      include: CountryCodeSchema.array().optional(),
      excludeContinents: ContinentSchema.array().optional(),
      includeContinents: ContinentSchema.array().optional(),
    }),
  ).optional(),
  region: z
    .object({
      country: CountryCodeSchema,
      exclude: z.string().array().optional(),
      include: z.string().array().optional(),
    })
    .optional(),
  passportNumber: z
    .object({
      country: CountryCodeSchema,
      exclude: z.string().array().optional(),
      include: z.string().array().optional(),
    })
    .optional(),
  nationalIdNumber: z
    .object({
      country: CountryCodeSchema,
      exclude: z.string().array().optional(),
      include: z.string().array().optional(),
    })
    .optional(),

  twitterHandle: BooleanSchema.optional(),
  color: z
    .enum(["hex", "rgb", "rgba", "hsl", "hsla"])
    .or(
      z.object({
        type: z.enum(["hex", "rgb", "rgba", "hsl", "hsla"]),
        exclude: z.string().array().optional(),
        include: z.string().array().optional(),
      }),
    )
    .optional(),
});

export type TextValidationOptions = z.infer<typeof TextValidationOptionsSchema>;

export const TextOptionsSchema = TextValidationOptionsSchema.merge(
  TextTranformationOptionsSchema,
);
export type TextOptions<T = []> = T extends []
  ? z.infer<typeof TextOptionsSchema>
  : z.infer<typeof TextOptionsSchema> & T;
