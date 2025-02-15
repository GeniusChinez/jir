/* eslint-disable @typescript-eslint/no-explicit-any */
import { DateOptions } from "./options/dates";
import { NumberOptions } from "./options/numbers";
import { TextOptions } from "./options/text";

export function parseFieldTypeFromString(field: string, type: string) {
  // if (!type.includes(" ")) {
  //   return {
  //     type: type,
  //   };
  // }

  const split = type.split(" ");

  if (split.length === 0) {
    throw new Error(`Field '${field}' type must contain the base type`);
  }

  const baseType = split[0];
  const attributes = split.slice(1);

  if (!attributes.every((attribute) => attribute.startsWith("@"))) {
    throw new Error(
      `Every attribute of the type of the field '${field}' must start with '@'`,
    );
  }

  const result: Record<
    string,
    string | boolean | number | NumberOptions | TextOptions | DateOptions
  > = {
    type: baseType,
  };

  switch (baseType) {
    case "number": {
      const booleanFlags = numberBooleanFlags;

      for (const attribute of attributes) {
        if (booleanFlags.includes(attribute)) {
          result[attribute.slice(1)] = true;
          continue;
        }

        switch (attribute) {
          case "@biginteger":
          case "@bigint": {
            result["variant"] = "bigint";
            break;
          }
          case "@integer":
          case "@int": {
            result["variant"] = "int";
            break;
          }
          case "@float": {
            result["variant"] = "float";
            break;
          }
          case "@decimal": {
            result["variant"] = "decimal";
            break;
          }
          default: {
            let found = false;
            for (const [prefix, key] of Object.entries(
              numericAttributeParsers,
            )) {
              if (attribute.startsWith(prefix)) {
                result[key] = parseNumericAttributeValue(
                  attribute,
                  field,
                  prefix,
                );
                found = true;
                break;
              }
            }
            if (!found) {
              throw new Error(
                `'${field}' has an impermissible attribute '${attribute}'`,
              );
            }
          }
        }
      }
      break;
    }
    case "string": {
      const booleanFlags = stringBooleanFlags;

      for (const attribute of attributes) {
        if (booleanFlags.includes(attribute)) {
          result[attribute.slice(1)] = true;
          continue;
        }

        let found = false;
        for (const [prefix, { key, type }] of Object.entries(
          stringAttributeParsers,
        )) {
          if (attribute.startsWith(prefix)) {
            result[key] = (() => {
              if (type === "number") {
                return parseNumericAttributeValue(attribute, field, prefix);
              }
              return parseStringAttributeValue(attribute, field, prefix);
            })();
            found = true;
            break;
          }
        }

        if (!found) {
          throw new Error(
            `'${field}' has an impermissible attribute '${attribute}'`,
          );
        }
      }
      break;
    }
    case "date": {
      const booleanFlags = dateBooleanFlags;

      for (const attribute of attributes) {
        if (booleanFlags.includes(attribute)) {
          result[attribute.slice(1)] = true;
          continue;
        }

        let found = false;
        for (const [prefix, { key, type }] of Object.entries(
          dateAttributeParsers,
        )) {
          if (attribute.startsWith(prefix)) {
            result[key] = (() => {
              if (type === "number") {
                return parseNumericAttributeValue(attribute, field, prefix);
              }
              return parseStringAttributeValue(attribute, field, prefix);
            })();
            found = true;
            break;
          }
        }

        if (!found) {
          throw new Error(
            `'${field}' has an impermissible attribute '${attribute}'`,
          );
        }
      }
      break;
    }
    case "boolean": {
      const booleanFlags: string[] = ["@optional"];
      for (const attribute of attributes) {
        if (booleanFlags.includes(attribute)) {
          result[attribute.slice(1)] = true;
          continue;
        }
        throw new Error(
          `'${field}' has an impermissible attribute '${attribute}'`,
        );
      }
      break;
    }
    case "number[]": {
      const booleanFlags: string[] = ["@nonempty"];
      for (const attribute of attributes) {
        if (booleanFlags.includes(attribute)) {
          result[attribute.slice(1)] = true;
          continue;
        }

        if (attribute.startsWith("@map")) {
          result["map"] = parseStringAttributeValue(attribute, field, "@map");
          continue;
        }

        let found = false;
        for (const [prefix, key] of Object.entries(listAttributeParsers)) {
          if (attribute.startsWith(prefix)) {
            result[key] = (() => {
              const value = attribute.slice(
                prefix.length,
                attribute.indexOf(")"),
              );
              const memberAttributes = value.split(",");
              const options: NumberOptions = {};
              for (const memberAttribute of memberAttributes) {
                if (numberBooleanFlags.includes(`@${memberAttribute}`)) {
                  (options as any)[memberAttribute] = true;
                } else {
                  throw new Error(
                    `Invalid attribute '${memberAttribute}' in the '${key}' of '${field}'`,
                  );
                }
              }
              return options;
            })();
            found = true;
            break;
          }
        }

        if (!found) {
          throw new Error(
            `'${field}' has an impermissible attribute '${attribute}'`,
          );
        }
      }
      return {
        ...result,
        type: "list",
        of: {
          type: "number",
        },
      };
    }
    case "string[]": {
      const booleanFlags: string[] = ["@nonempty"];
      for (const attribute of attributes) {
        if (booleanFlags.includes(attribute)) {
          result[attribute.slice(1)] = true;
          continue;
        }

        if (attribute.startsWith("@map")) {
          result["map"] = parseStringAttributeValue(attribute, field, "@map");
          continue;
        }

        let found = false;
        for (const [prefix, key] of Object.entries(listAttributeParsers)) {
          if (attribute.startsWith(prefix)) {
            result[key] = (() => {
              const value = attribute.slice(
                prefix.length,
                attribute.indexOf(")"),
              );
              const memberAttributes = value.split(",");
              const options: NumberOptions = {};
              for (const memberAttribute of memberAttributes) {
                if (stringBooleanFlags.includes(`@${memberAttribute}`)) {
                  (options as any)[memberAttribute] = true;
                } else {
                  throw new Error(
                    `Invalid attribute '${memberAttribute}' in the '${key}' of '${field}'`,
                  );
                }
              }
              return options;
            })();
            found = true;
            break;
          }
        }

        if (!found) {
          throw new Error(
            `'${field}' has an impermissible attribute '${attribute}'`,
          );
        }
      }
      return {
        ...result,
        type: "list",
        of: {
          type: "string",
        },
      };
    }
    case "boolean[]": {
      const booleanFlags: string[] = ["@nonempty"];
      for (const attribute of attributes) {
        if (booleanFlags.includes(attribute)) {
          result[attribute.slice(1)] = true;
          continue;
        }

        if (attribute.startsWith("@map")) {
          result["map"] = parseStringAttributeValue(attribute, field, "@map");
          continue;
        }

        let found = false;
        for (const [prefix, key] of Object.entries(listAttributeParsers)) {
          if (attribute.startsWith(prefix)) {
            result[key] = (() => {
              const value = attribute.slice(
                prefix.length,
                attribute.indexOf(")"),
              );
              const memberAttributes = value.split(",");
              const options: NumberOptions = {};
              for (const memberAttribute of memberAttributes) {
                if (booleanBooleanFlags.includes(`@${memberAttribute}`)) {
                  (options as any)[memberAttribute] = true;
                } else {
                  throw new Error(
                    `Invalid attribute '${memberAttribute}' in the '${key}' of '${field}'`,
                  );
                }
              }
              return options;
            })();
            found = true;
            break;
          }
        }

        if (!found) {
          throw new Error(
            `'${field}' has an impermissible attribute '${attribute}'`,
          );
        }
      }
      return {
        ...result,
        type: "list",
        of: {
          type: "boolean",
        },
      };
    }
    default: {
      if (attributes.length) {
        throw new Error(`'${field}' can't have attributes for now`);
      }
    }
  }

  return result;
}

export const numericAttributeParsers: Record<string, string> = {
  "@default(": "default",
  "@map(": "map",
  "@max(": "max",
  "@min(": "min",
  "@mod(": "mod",
  "@gt(": "gt",
  "@gte(": "gte",
  "@lt(": "lt",
  "@lte(": "lte",
  "@eq(": "eq",
  "@neq(": "neq",
  "@plus(": "plus",
  "@minus(": "minus",
  "@divides(": "divides",
  "@divisor(": "divisor",
};

export const listAttributeParsers: Record<string, string> = {
  "@every(": "every",
  "@some(": "some",
  "@none(": "none",
};

export const stringAttributeParsers: Record<
  string,
  {
    key: string;
    type: "number" | "string";
  }
> = {
  "@default(": {
    key: "default",
    type: "string",
  },
  "@map(": {
    key: "map",
    type: "string",
  },
  "@max(": {
    key: "max",
    type: "number",
  },
  "@min(": {
    key: "min",
    type: "number",
  },
  "@eq(": {
    key: "eq",
    type: "string",
  },
  "@neq(": {
    key: "neq",
    type: "string",
  },
  "@hash(": {
    key: "hash",
    type: "string",
  },
  "@encrypt(": {
    key: "hash",
    type: "string",
  },
};

export const dateAttributeParsers: Record<
  string,
  {
    key: string;
    type: "number" | "string";
  }
> = {
  "@default(": {
    key: "default",
    type: "string",
  },
  "@map(": {
    key: "map",
    type: "string",
  },
  "@lt(": {
    key: "lt",
    type: "string",
  },
  "@lte(": {
    key: "lte",
    type: "string",
  },
  "@gt(": {
    key: "gt",
    type: "string",
  },
  "@gte(": {
    key: "gte",
    type: "string",
  },
  "@eq(": {
    key: "eq",
    type: "string",
  },
  "@neq(": {
    key: "neq",
    type: "string",
  },
};

export const numberBooleanFlags = [
  "@id",
  "@unique",
  "@public",
  "@private",
  "@even",
  "@odd",
  "@negative",
  "@positive",
  "@nonnegative",
  "@nonpositive",
  "@nonzero",
  "@abs",
  "@autoincrement",
  "@optional",
];

export const stringBooleanFlags = [
  "@id",
  "@long",
  "@medium",
  "@short",
  "@unique",
  "@public",
  "@private",
  "@lowercase",
  "@uppercase",
  "@kebabcase",
  "@screamingcase",
  "@camelcase",
  "@pascalcase",
  "@nospecial",
  "@nospaces",
  "@nonempty",
  "@alphanumeric",
  "@alphabetic",
  "@numeric",
  "@url",
  "@email",
  "@ipaddress",
  "@uuid",
  "@cuid",
  "@ulid",
  "@cidr",
  "@objectId",
  "@slug",
  "@base64",
  "@trim",
  "@time",
  "@datetime",
  "@date",
  "@secret",
  "@password",
  "@optional",
];

export const dateBooleanFlags = [
  "@future",
  "@past",
  "@updatedAt",
  "@createdAt",
  "@optional",
];

export const booleanBooleanFlags: string[] = [];

export function parseNumericAttributeValue(
  attribute: string,
  field: string,
  prefix: string,
): number | string {
  if (!attribute.endsWith(")")) {
    throw new Error(`'${field}' has ${prefix} attribute missing a closing ')'`);
  }
  const value = attribute.slice(prefix.length, attribute.indexOf(")"));
  return isNaN(parseFloat(value)) ? value : parseFloat(value);
}

export function parseStringAttributeValue(
  attribute: string,
  field: string,
  prefix: string,
): number | string {
  if (!attribute.endsWith(")")) {
    throw new Error(`'${field}' has ${prefix} attribute missing a closing ')'`);
  }
  return attribute.slice(prefix.length, attribute.indexOf(")"));
}
