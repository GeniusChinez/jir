/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContinentSchema } from "../schemas/continents";
import { EanVersion, eanVersions } from "../schemas/ean";
import { TypeParsingContext } from "./parse-type.context";
import { HashingAlgorithmSchema } from "../schemas/hashing.algorithms";
import { EncryptionAlgorithmSchema } from "../schemas/encryption.algorithms";

export function parseStringTypeAttribute(
  attributeName: string,
  ctx: TypeParsingContext,
): Record<string, any> {
  if (stringBooleanFlags.includes(attributeName)) {
    return { [attributeName]: true };
  }

  const result: Record<string, any> = {};

  switch (attributeName) {
    // @todo: do a variants thing also for strings. Dont have "long" "short" "medium" etc
    // case "long":
    // case "short":
    // case "medium": {
    //   result["variant"] = attributeName;
    //   break;
    // }
    case "max":
    case "min":
    case "length":
    case "truncate": {
      result[attributeName] = ctx.swallowNumberAttributeArgument(attributeName);
      break;
    }
    case "in":
    case "notIn":
    case "excludes":
    case "includes": {
      result[attributeName] =
        ctx.swallowStringListAttributeArgument(attributeName);
      break;
    }
    case "default":
    case "eq":
    case "neq":
    case "regex":
    case "endsWith":
    case "startsWith":
    case "mask":
    case "leftJoin":
    case "rightJoin": {
      result[attributeName] = ctx.swallowStringAttributeArgument(attributeName);
      break;
    }
    case "state":
    case "province":
    case "region": {
      result["region"] = {
        country: ctx.swallowCountryAttributeArgument(attributeName),
      };
      break;
    }
    case "passportNumber":
    case "nationalIdNumber": {
      result[attributeName] = {
        country: ctx.swallowCountryAttributeArgument(attributeName),
      };
      break;
    }
    case "phoneNumber": {
      result[attributeName] = ctx.tastesLike("(")
        ? {
            country: ctx.swallowCountryAttributeArgument(attributeName),
          }
        : true;
      break;
    }
    case "color": {
      const color = ctx.swallowStringAttributeArgument(attributeName);
      if (!["hex", "rgb", "rgba", "hsl", "hsla"].includes(color)) {
        ctx.fatalError(`Found unknown color type '${color}'`);
      }
      result[attributeName] = color;
      break;
    }
    case "mimeType": {
      const val = ctx.swallowOptionalStringAttributeArgument(attributeName);
      if (val === true) {
        result[attributeName] = true;
        break;
      }

      if (
        ![
          "audio",
          "video",
          "image",
          "application",
          "text",
          "font",
          "multipart",
          "document",
          "web",
        ].includes(val)
      ) {
        ctx.fatalError(`Found unknown mime type '${val}'`);
      }
      result[attributeName] = {
        type: val,
      };
      break;
    }
    case "ean": {
      const val = ctx.swallowOptionalStringAttributeArgument(attributeName);

      if (val === true) {
        result[attributeName] = true;
        break;
      }

      if (!eanVersions.includes(val as EanVersion)) {
        ctx.fatalError(`Found unknown ean version '${val}'`);
      }

      result[attributeName] = {
        version: val,
      };
      break;
    }
    case "isbn": {
      const val = ctx.swallowOptionalStringAttributeArgument(attributeName);

      if (val === true) {
        result[attributeName] = true;
        break;
      }

      if (!["10", "13"].includes(val)) {
        ctx.fatalError(`Found unknown isbn version '${val}'`);
      }

      result[attributeName] = {
        version: val,
      };
      break;
    }
    case "country": {
      const val = ctx.swallowOptionalStringAttributeArgument(attributeName);

      if (val === true) {
        result[attributeName] = true;
        break;
      }

      const { data: continent, success } = ContinentSchema.safeParse(val);
      if (!success) {
        ctx.fatalError(`Found unknown continent '${val}'`);
      }

      result[attributeName] = {
        continent,
      };
      break;
    }
    case "hash": {
      const val = ctx.swallowOptionalStringAttributeArgument(attributeName);

      if (val === true) {
        result[attributeName] = true;
        break;
      }

      const { data: algorithm, success } =
        HashingAlgorithmSchema.safeParse(val);
      if (!success) {
        ctx.fatalError(`Found unknown hashing algorithm '${val}'`);
      }

      result[attributeName] = algorithm;
      break;
    }
    case "encrypt": {
      const val = ctx.swallowOptionalStringAttributeArgument(attributeName);

      if (val === true) {
        result[attributeName] = true;
        break;
      }

      const { data: algorithm, success } =
        EncryptionAlgorithmSchema.safeParse(val);
      if (!success) {
        ctx.fatalError(`Found unknown encryption algorithm '${val}'`);
      }

      result[attributeName] = algorithm;
      break;
    }
    case "padRight":
    case "padLeft": {
      ctx.expect("(", `attribute '@${attributeName}', expected '('`);
      ctx.swallowAir();
      const amount = ctx.swallowNumber(
        `Expected a number after '@${attributeName}('`,
      );
      ctx.swallowAir();
      ctx.expect(",", `attribute '@${attributeName}', expected ','`);
      ctx.swallowAir();
      const chars = ctx.swallowString(
        `Expected a string after '@${attributeName}('`,
      );
      result[attributeName] = [amount, chars];
      ctx.swallowAir();
      ctx.expect(")", `attribute '@${attributeName}', expected ')'`);
      break;
    }
    case "substring": {
      ctx.expect("(", `attribute '@${attributeName}', expected '('`);
      ctx.swallowAir();
      const startingPoint = ctx.swallowNumber(
        `Expected a number after '@${attributeName}('`,
      );
      ctx.swallowAir();

      if (ctx.tastesLike(",")) {
        ctx.getNextEdible();
        ctx.swallowAir();
        const endingPoint = ctx.swallowNumber(
          `Expected a number after '@${attributeName}('`,
        );
        result[attributeName] = [startingPoint, endingPoint];
      } else {
        result[attributeName] = startingPoint;
      }

      ctx.swallowAir();
      ctx.expect(")", `attribute '@${attributeName}', expected ')'`);
      break;
    }
    case "maskOccurances": {
      ctx.expect("(", `attribute '@${attributeName}', expected '('`);

      ctx.swallowAir();
      const _of = ctx.swallowString(
        `Expected a string after '@${attributeName}('`,
      );
      ctx.swallowAir();

      if (ctx.tastesLike(",")) {
        ctx.getNextEdible();
        ctx.swallowAir();
        const _with = ctx.swallowString(
          `Expected a string after ',' in '@${attributeName}'`,
        );
        result[attributeName] = [_of, _with];
      } else {
        result[attributeName] = [_of, "*"];
      }

      ctx.swallowAir();
      ctx.expect(")", `attribute '@${attributeName}', expected ')'`);
      break;
    }
    default: {
      ctx.fatalError(`Found impermissible attribute '@${attributeName}'`);
    }
  }

  return result;
}

export const stringBooleanFlags = [
  "id",
  "long",
  "medium",
  "short",
  "lowercase",
  "uppercase",
  "kebabcase",
  "capitalize",
  "screamingcase",
  "titlecase",
  "camelcase",
  "pascalcase",
  "nospecial",
  "nospaces",
  "nonempty",
  "alphanumeric",
  "alphabetic",
  "numeric",
  "url",
  "email",
  "ipaddress",
  "uuid",
  "cuid",
  "ulid",
  "cidr",
  "objectId",
  "slug",
  "slugify",
  "base64",
  "trim",
  "time",
  "datetime",
  "date",
  "secret",
  "password",
  "reverse",
  "ssn",
  "html",
  "json",
  "csv",
  // "ean", 8, 8P2, 8P5, 13, 13P2, 13P5, 14, 128
  // "isbn", 10 or 13
  "gtin",
  "upc",
  "vin",
  "chessMove",
  "pgn",
  "fen",
  "iban",
  "creditCardNumber",
  "twitterHandle",
];
