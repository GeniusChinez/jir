/* eslint-disable @typescript-eslint/no-explicit-any */
import { TypeParsingContext } from "./parse-type.context";

export function parseNumberTypeAttribute(
  attributeName: string,
  ctx: TypeParsingContext,
): Record<string, any> {
  if (numberBooleanFlags.includes(attributeName)) {
    return { [attributeName]: true };
  }

  const result: Record<string, any> = {};

  switch (attributeName) {
    // @todo: add tinyint, smallint, mediumint, bigint
    // @todo: allow "decimal" to optionally have a precision and scale
    case "bigint":
    case "int":
    case "decimal":
    case "float": {
      result["variant"] = attributeName;
      break;
    }
    case "max":
    case "min":
    case "default":
    case "mod":
    case "gt":
    case "gte":
    case "lt":
    case "lte":
    case "eq":
    case "neq":
    case "plus":
    case "minus": {
      result[attributeName] = ctx.swallowNumberAttributeArgument(attributeName);
      break;
    }
    case "divides":
    case "divisor":
    case "in":
    case "notIn": {
      result[attributeName] =
        ctx.swallowNumberListAttributeArgument(attributeName);
      break;
    }
    default: {
      ctx.fatalError(`Found impermissible attribute '@${attributeName}'`);
    }
  }

  return result;
}

export const numberBooleanFlags = [
  "id",
  "even",
  "odd",
  "negative",
  "positive",
  "nonnegative",
  "nonpositive",
  "nonzero",
  "abs",
  "autoincrement",
];
