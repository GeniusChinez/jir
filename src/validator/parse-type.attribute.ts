/* eslint-disable @typescript-eslint/no-explicit-any */
import { isAlnum } from "./chars";
import { parseBooleanTypeAttribute } from "./parse-type.attribute.booleans";
import { parseDateTypeAttribute } from "./parse-type.attribute.dates";
import { parseNumberTypeAttribute } from "./parse-type.attribute.numbers";
import { parseStringTypeAttribute } from "./parse-type.attribute.strings";
import { TypeParsingContext } from "./parse-type.context";
import { visibilities } from "./visibility";

export function parseTypeAttributeName(ctx: TypeParsingContext): string {
  let attributeName = "";
  while (ctx.moreFood() && isAlnum(ctx.taste())) {
    attributeName += ctx.swallow();
  }
  if (!attributeName.length) {
    throw new Error(`Found unnamed type attribute`);
  }
  return attributeName;
}

export function parseTypeAttributesList(
  ctx: TypeParsingContext,
  parse: (attribute: string, ctx: TypeParsingContext) => Record<string, any>,
) {
  let result: Record<string, any> = {
    visibility: "inherit",
  };

  while (ctx.moreFood() && ctx.taste() === "@") {
    ctx.swallow();
    const attributeName = parseTypeAttributeName(ctx);

    if (result[attributeName]) {
      ctx.fatalError(`Duplicate attribute '${attributeName}'`);
    }

    if (visibilities.includes(attributeName as any)) {
      result.visibility = attributeName;
    } else if (["unique", "optional"].includes(attributeName)) {
      result[attributeName] = true;
    } else if (attributeName === "map") {
      result[attributeName] = ctx.swallowStringAttributeArgument(attributeName);
    } else {
      result = {
        ...result,
        ...parse(attributeName, ctx),
      };
    }

    ctx.swallowAir();
  }

  return result;
}

export function parseTypeAttributes(
  type: string,
  ctx: TypeParsingContext,
): Record<string, any> {
  const parser = (() => {
    switch (type) {
      case "number":
        return parseNumberTypeAttribute;
      case "string":
        return parseStringTypeAttribute;
      case "boolean":
        return parseBooleanTypeAttribute;
      case "date":
        return parseDateTypeAttribute;
      default: {
        ctx.fatalError(`Attributes not allowed for type '${type}'`);
        throw new Error(`Unreachable`);
      }
    }
  })();

  return parseTypeAttributesList(ctx, parser);
}
