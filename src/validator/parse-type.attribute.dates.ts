/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DateTimeSchema } from "./date.schema";
import { TypeParsingContext } from "./parse-type.context";

export function parseDateTypeAttribute(
  attributeName: string,
  ctx: TypeParsingContext,
): Record<string, any> {
  if (dateBooleanFlags.includes(attributeName)) {
    return { [attributeName]: true };
  }

  const result: Record<string, any> = {};

  switch (attributeName) {
    case "default":
    case "lt":
    case "lte":
    case "gt":
    case "gte":
    case "eq":
    case "neq": {
      const value = ctx.swallowStringAttributeArgument(attributeName);
      try {
        result[attributeName] = DateTimeSchema.parse(value);
      } catch (e) {
        throw new Error(
          `Expected a valid date in single quotes after '@${attributeName}(', but found '${value}'`,
        );
      }
      break;
    }
    case "in":
    case "notIn": {
      const values = ctx.swallowStringListAttributeArgument(attributeName);
      try {
        result[attributeName] = DateTimeSchema.array().parse(values);
      } catch (e) {
        throw new Error(
          `Expected valid dates in single quotes after '@${attributeName}(', but found '${values}'`,
        );
      }
      break;
    }
    default: {
      ctx.fatalError(`Found impermissible attribute '@${attributeName}'`);
    }
  }

  return result;
}

export const dateBooleanFlags = ["future", "past", "updatedAt", "createdAt"];
