/* eslint-disable @typescript-eslint/no-explicit-any */
import { isAlnum } from "./chars";
import { TypeParsingContext } from "./parse-type.context";
import {
  parseTypeAttributeName,
  parseTypeAttributes,
} from "./parse-type.attribute";
import { parseArrayTypeAttribute } from "./parse-type.attribute.array";
import { visibilities } from "./visibility";

export function parseTypeWithContext(
  ctx: TypeParsingContext,
): Record<string, any> {
  const fieldName = ctx.getFieldName();

  if (ctx.tastesLike("[")) {
    ctx.swallow();
    ctx.swallowAir();
    const baseType = parseTypeWithContext(ctx);
    ctx.swallowAir();
    ctx.expect(
      "]",
      `In '${fieldName}', expected closing ']', but found '${ctx.sample(4)}'`,
    );

    ctx.swallowAir();

    let attributes: Record<string, any> = {
      visibility: "inherit",
    };

    while (ctx.moreFood() && ctx.taste() === "@") {
      ctx.swallow();
      const attributeName = parseTypeAttributeName(ctx);

      if (attributes[attributeName]) {
        ctx.fatalError(`Duplicate attribute '${attributeName}'`);
      }

      if (visibilities.includes(attributeName as any)) {
        attributes.visibility = attributeName;
      } else if (["unique", "optional"].includes(attributeName)) {
        attributes[attributeName] = true;
      } else if (attributeName === "map") {
        attributes[attributeName] =
          ctx.swallowStringAttributeArgument(attributeName);
      } else {
        attributes = {
          ...attributes,
          ...parseArrayTypeAttribute(attributeName, baseType, ctx),
        };
      }

      ctx.swallowAir();
    }

    return {
      ...attributes,
      type: "list",
      of: baseType,
    };
  }

  let nameOfType = "";
  while (
    ctx.moreFood() &&
    (isAlnum(ctx.taste()) || ["-", "_"].includes(ctx.taste()))
  ) {
    nameOfType += ctx.swallow();
  }

  ctx.swallowAir();
  if (ctx.tastesLike("@")) {
    const attributes = parseTypeAttributes(nameOfType, ctx);
    return {
      ...attributes,
      type: nameOfType,
    };
  }

  return {
    type: nameOfType,
  };
}

export function parseFieldType(
  fieldName: string,
  source: string,
): Record<string, any> {
  const context = new TypeParsingContext(source, fieldName);
  return parseTypeWithContext(context);
}
