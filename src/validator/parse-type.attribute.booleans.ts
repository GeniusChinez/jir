/* eslint-disable @typescript-eslint/no-explicit-any */
import { TypeParsingContext } from "./parse-type.context";

export function parseBooleanTypeAttribute(
  attributeName: string,
  ctx: TypeParsingContext,
): Record<string, any> {
  if (booleanBooleanFlags.includes(attributeName)) {
    return { [attributeName]: true };
  }

  const result: Record<string, any> = {};

  switch (attributeName) {
    case "default": {
      result[attributeName] =
        ctx.swallowBooleanAttributeArgument(attributeName);
      break;
    }
    default: {
      ctx.fatalError(`Found impermissible attribute '@${attributeName}'`);
    }
  }

  return result;
}

export const booleanBooleanFlags = ["true", "false"] as string[];
