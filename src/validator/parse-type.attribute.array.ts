/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseTypeAttributeName } from "./parse-type.attribute";
import { parseBooleanTypeAttribute } from "./parse-type.attribute.booleans";
import { parseDateTypeAttribute } from "./parse-type.attribute.dates";
import { parseNumberTypeAttribute } from "./parse-type.attribute.numbers";
import { parseStringTypeAttribute } from "./parse-type.attribute.strings";
import { TypeParsingContext } from "./parse-type.context";

export function parseArrayTypeAttribute(
  attributeName: string,
  baseType: Record<string, any>,
  ctx: TypeParsingContext,
): Record<string, any> {
  if (listBooleanFlags.includes(attributeName)) {
    return { [attributeName]: true };
  }

  const result: Record<string, any> = {};

  switch (attributeName) {
    case "max":
    case "min":
    case "length": {
      result[attributeName] = ctx.swallowNumberAttributeArgument(attributeName);
      break;
    }
    case "none":
    case "some":
    case "every": {
      ctx.expect("(", `Expected '(' for '@${attributeName}'`);
      let temp: Record<string, any> = {};

      if (baseType.type !== "list") {
        const parse = (() => {
          switch (baseType.type) {
            case "number":
              return parseNumberTypeAttribute;
            case "string":
              return parseStringTypeAttribute;
            case "boolean":
              return parseBooleanTypeAttribute;
            case "date":
              return parseDateTypeAttribute;
            default: {
              ctx.fatalError(
                `Attributes not allowed for type '${baseType.type}'`,
              );
              throw new Error(`Unreachable`);
            }
          }
        })();

        do {
          const name = parseTypeAttributeName(ctx);
          ctx.swallowAir();

          if (temp[name]) {
            ctx.fatalError(`Duplicate attribute '${name}'`);
          }

          temp = {
            ...temp,
            ...parse(name, ctx),
          };

          ctx.swallowAir();

          if (ctx.tastesLike(",")) {
            ctx.swallow();
            ctx.swallowAir();
            continue;
          }

          break;
        } while (!ctx.noMoreFood());
      } else {
        do {
          const name = parseTypeAttributeName(ctx);
          ctx.swallowAir();

          if (temp[name]) {
            ctx.fatalError(`Duplicate attribute '${name}'`);
          }

          temp = {
            ...temp,
            ...parseArrayTypeAttribute(name, baseType.of, ctx),
          };

          ctx.swallowAir();
          if (ctx.tastesLike(",")) {
            ctx.swallow();
            ctx.swallowAir();
            continue;
          }

          break;
        } while (!ctx.noMoreFood());
      }
      result[attributeName] = temp;
      ctx.expect(
        ")",
        `Expected ')' for '@${attributeName}', but found '${ctx.sample(4)}'`,
      );
      break;
    }
    case "default":
    default: {
      ctx.fatalError(`Found impermissible attribute '@${attributeName}'`);
    }
  }

  return result;
}

export const listBooleanFlags = ["empty", "nonempty"] as string[];
