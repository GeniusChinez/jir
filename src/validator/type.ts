/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HashingAlgorithmSchema } from "src/helpers/hashing.algorithms";
import { isAlnum, isAlpha, isDigit, isSpace } from "./chars";
import { EncryptionAlgorithmSchema } from "src/helpers/encryption.algorithms";
import { DateTimeSchema } from "./date.schema";

export function createDefaultArrayType(baseType: any, depth: number): any {
  if (depth === 0) {
    return baseType;
  }
  return {
    type: "list",
    of: createDefaultArrayType(baseType, depth - 1),
  };
}

export function parseFieldType(
  fieldName: string,
  _source: string,
): Record<string, any> {
  const source = _source.trim();
  let [index, nameOfType] = [0, ""];

  // helpers
  const noMoreFood = () => index >= source.length;
  const moreFood = () => !noMoreFood();
  const swallow = () => source[index++];
  const taste = () => {
    return noMoreFood() ? "" : source[index];
  };

  const peak = (n: number = 1) =>
    index + n < source.length ? source[index + n] : "";
  const getNextEdible = (n: number = 1) => {
    index += n;
    return taste();
  };

  const swallowAir = () => {
    while (moreFood() && isSpace(taste())) {
      getNextEdible();
    }
  };

  const tastesLike = (ch: string) => {
    if (!moreFood()) {
      return false;
    }

    return source.slice(index, index + ch.length) === ch;
  };

  const matches = (...validators: ((v: string) => boolean)[]) => {
    return validators.every((validator) => validator(taste()));
  };

  const safeExpect = (expected: string) => {
    if (!tastesLike(expected)) {
      return false;
    }
    getNextEdible(expected.length);
    return true;
  };

  const expect = (expected: string, error: string) => {
    if (!tastesLike(expected)) {
      throw new Error(error);
    }
    getNextEdible(expected.length);
  };

  const parseNumber = () => {
    let temp = "";
    while (moreFood() && isDigit(taste())) {
      temp += swallow();
    }

    if (moreFood() && tastesLike(".")) {
      getNextEdible();

      while (moreFood() && matches(isDigit)) {
        temp += swallow();
      }

      if (temp.endsWith(".")) {
        temp += "0";
      }
    }

    return temp;
  };

  const swallowNumber = (error: string) => {
    const temp = parseNumber();

    if (!temp) {
      throw new Error(error);
    }

    return Number(temp);
  };

  const expectMultipleNumbers = (error: string) => {
    const result: number[] = [];
    while (moreFood()) {
      result.push(swallowNumber(error));
      swallowAir();

      if (tastesLike(",")) {
        getNextEdible();
        swallowAir();
        continue;
      }

      break;
    }
    return result;
  };

  const swallowString = (error: string) => {
    expect("'", error);
    let temp = "";

    while (moreFood() && taste() !== "'") {
      temp += swallow();
      if (taste() === "\\" && peak(1) === "'") {
        temp += "'";
        getNextEdible(2);
      }
    }

    if (!temp) {
      throw new Error(error);
    }

    expect("'", error);
    return temp;
  };

  const swallowMultipleStrings = (error: string) => {
    const result: string[] = [];
    while (moreFood()) {
      result.push(swallowString(error));
      swallowAir();

      if (tastesLike(",")) {
        getNextEdible();
        swallowAir();
        continue;
      }

      break;
    }
    return result;
  };

  const swallowBoolean = (error: string) => {
    if (noMoreFood()) {
      throw new Error(error);
    }

    if (tastesLike("t")) {
      if (safeExpect("true")) {
        return true;
      }
      throw new Error(error);
    }

    if (tastesLike("f")) {
      if (safeExpect("false")) {
        return false;
      }
      throw new Error(error);
    }

    throw new Error(error);
  };

  // ....
  while (moreFood() && (isAlnum(taste()) || ["-", "_"].includes(taste()))) {
    nameOfType += swallow();
  }

  let arrayDepth = 0;

  while (
    moreFood() &&
    taste() === "[" &&
    index + 1 < source.length &&
    peak(1) === "]"
  ) {
    arrayDepth++;
    getNextEdible(2);
  }

  swallowAir();

  if (noMoreFood()) {
    return createDefaultArrayType({ type: nameOfType }, arrayDepth);
  }

  const levels: Record<string, any>[] = new Array(arrayDepth + 1).fill({});
  let levelIndex = 0;

  const parseAttribute = () => {
    // First, we expect an attribute name
    let attributeName = "";
    while (moreFood() && isAlnum(taste())) {
      attributeName += swallow();
    }

    if (!attributeName.length) {
      throw new Error(`In '${fieldName}', found unnamed attribute in the type`);
    }

    // We dont care about the space after the attribute name
    swallowAir();

    if (levelIndex < arrayDepth) {
      expect(
        "(",
        `In '${fieldName}', expected opening '(' for attribute '@${attributeName}'`,
      );

      switch (attributeName) {
        case "nonempty":
        case "empty": {
          if (moreFood() && taste() === "(") {
            getNextEdible();
            levels[levelIndex][attributeName] = swallowBoolean(
              `In '${fieldName}', for attribute '@${attributeName}', expected true or false after '('`,
            );
            expect(
              ")",
              `In '${fieldName}', for attribute '@${attributeName}', expected closing ')'`,
            );
          } else {
            levels[levelIndex][attributeName] = true;
          }
          break;
        }
        case "some":
        case "every":
        case "none": {
          levelIndex++;
          while (true) {
            parseAttribute();
            swallowAir();

            if (tastesLike(",")) {
              getNextEdible(1);
              swallowAir();

              if (matches(isAlpha)) {
                continue;
              }
            }

            break;
          }
          levelIndex--;
          break;
        }
        default: {
          throw new Error(
            `In '${fieldName}', found impermissible attribute '@${attributeName}'`,
          );
        }
      }

      expect(
        ")",
        `In '${fieldName}', expected closing ')' for attribute '@${attributeName}'`,
      );
    } else {
      switch (nameOfType) {
        case "number": {
          if (numberBooleanFlags.includes(attributeName)) {
            if (moreFood() && taste() === "(") {
              getNextEdible();
              levels[levelIndex][attributeName] = swallowBoolean(
                `In '${fieldName}', for attribute '@${attributeName}', expected true or false after '('`,
              );
              expect(
                ")",
                `In '${fieldName}', for attribute '@${attributeName}', expected closing ')'`,
              );
            } else {
              levels[levelIndex][attributeName] = true;
            }
            break;
          }

          switch (attributeName) {
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
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              swallowAir();
              levels[levelIndex][attributeName] = swallowNumber(
                `Expected a number after '@${attributeName}('`,
              );
              swallowAir();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "divides":
            case "divisor":
            case "in":
            case "notIn": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              swallowAir();
              levels[levelIndex][attributeName] = expectMultipleNumbers(
                `Expected one or more numbers after '@${attributeName}('`,
              );
              swallowAir();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "map": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              swallowAir();
              levels[levelIndex][attributeName] = swallowString(
                `Expected a string (with single quotes) after '@${attributeName}('`,
              );
              swallowAir();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            default: {
              throw new Error(
                `In '${fieldName}', found impermissible attribute '@${attributeName}'`,
              );
            }
          }
          break;
        }
        case "string": {
          if (stringBooleanFlags.includes(attributeName)) {
            if (moreFood() && taste() === "(") {
              getNextEdible();
              levels[levelIndex][attributeName] = swallowBoolean(
                `In '${fieldName}', for attribute '@${attributeName}', expected true or false after '('`,
              );
              expect(
                ")",
                `In '${fieldName}', for attribute '@${attributeName}', expected closing ')'`,
              );
            } else {
              levels[levelIndex][attributeName] = true;
            }
            break;
          }

          switch (attributeName) {
            case "max":
            case "min": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              swallowAir();
              levels[levelIndex][attributeName] = swallowNumber(
                `Expected a number after '@${attributeName}('`,
              );
              swallowAir();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "default":
            case "eq":
            case "neq": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              swallowAir();
              levels[levelIndex][attributeName] = swallowString(
                `Expected a string after '@${attributeName}('`,
              );
              swallowAir();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "in":
            case "notIn": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              swallowAir();
              levels[levelIndex][attributeName] = swallowMultipleStrings(
                `Expected a list of strings after '@${attributeName}('`,
              );
              swallowAir();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "hash": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              swallowAir();

              const name = swallowString(
                `Expected a string (with single quotes) after '@${attributeName}('`,
              );
              const algorithm = HashingAlgorithmSchema.safeParse(name);
              if (!algorithm.success) {
                throw new Error(
                  `In '${fieldName}' attribute '@${attributeName}', unknown hashing algorithm '${name}'`,
                );
              }

              levels[levelIndex][attributeName] = algorithm.data;

              swallowAir();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "encrypt": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              swallowAir();

              const name = swallowString(
                `Expected a string (with single quotes) after '@${attributeName}('`,
              );
              const algorithm = EncryptionAlgorithmSchema.safeParse(name);
              if (!algorithm.success) {
                throw new Error(
                  `In '${fieldName}' attribute '@${attributeName}', unknown encryption algorithm '${name}'`,
                );
              }
              levels[levelIndex][attributeName] = algorithm.data;

              swallowAir();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "regex":
            case "map": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              swallowAir();
              levels[levelIndex][attributeName] = swallowString(
                `Expected a string (with single quotes) after '@${attributeName}('`,
              );
              swallowAir();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            default: {
              throw new Error(
                `In '${fieldName}', found impermissible attribute '@${attributeName}'`,
              );
            }
          }
          break;
        }
        case "boolean": {
          if (booleanBooleanFlags.includes(attributeName)) {
            if (moreFood() && taste() === "(") {
              getNextEdible();
              levels[levelIndex][attributeName] = swallowBoolean(
                `In '${fieldName}', for attribute '@${attributeName}', expected true or false after '('`,
              );
              expect(
                ")",
                `In '${fieldName}', for attribute '@${attributeName}', expected closing ')'`,
              );
            } else {
              levels[levelIndex][attributeName] = true;
            }
            break;
          }

          switch (attributeName) {
            case "default": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              swallowAir();
              levels[levelIndex][attributeName] = swallowBoolean(
                `Expected a boolean (true or false) after '@${attributeName}('`,
              );
              swallowAir();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "map": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              swallowAir();
              levels[levelIndex][attributeName] = swallowString(
                `Expected a string (with single quotes) after '@${attributeName}('`,
              );
              swallowAir();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            default: {
              throw new Error(
                `In '${fieldName}', found impermissible attribute '@${attributeName}'`,
              );
            }
          }
          break;
        }
        case "date": {
          if (dateBooleanFlags.includes(attributeName)) {
            if (moreFood() && taste() === "(") {
              getNextEdible();
              levels[levelIndex][attributeName] = swallowBoolean(
                `In '${fieldName}', for attribute '@${attributeName}', expected true or false after '('`,
              );
              expect(
                ")",
                `In '${fieldName}', for attribute '@${attributeName}', expected closing ')'`,
              );
            } else {
              levels[levelIndex][attributeName] = true;
            }
            break;
          }

          switch (attributeName) {
            case "default":
            case "lt":
            case "lte":
            case "gt":
            case "gte":
            case "eq":
            case "neq": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              swallowAir();

              const date = swallowString(
                `Expected a date in single quotes after '@${attributeName}('`,
              );
              try {
                levels[levelIndex][attributeName] = DateTimeSchema.parse(date);
              } catch (e) {
                throw new Error(
                  `Expected a valid date in single quotes after '@${attributeName}(', but found '${date}'`,
                );
              }

              swallowAir();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "in":
            case "notIn": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              swallowAir();

              const dates = swallowMultipleStrings(
                `Expected a list of dates in single quotes after '@${attributeName}('`,
              );
              try {
                levels[levelIndex][attributeName] =
                  DateTimeSchema.array().parse(dates);
              } catch (e) {
                throw new Error(
                  `Expected valid dates in single quotes after '@${attributeName}(', but found '${dates}'`,
                );
              }

              swallowAir();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "map": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              swallowAir();
              levels[levelIndex][attributeName] = swallowString(
                `Expected a string (with single quotes) after '@${attributeName}('`,
              );
              swallowAir();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            default: {
              throw new Error(
                `In '${fieldName}', found impermissible attribute '@${attributeName}'`,
              );
            }
          }
          break;
        }
        default: {
          throw new Error(
            `In '${fieldName}', found impermissible attribute '@${attributeName}'`,
          );
        }
      }
    }

    swallowAir();
  };

  do {
    const char = swallow();
    if (char !== "@") {
      throw new Error(
        `In '${fieldName}', found unexpected stuff '${char}${source.slice(index, index + 10)}...' in the type`,
      );
    }
    parseAttribute();
  } while (moreFood());

  const reapType = (ls: Record<string, any>[]): any => {
    if (ls.length === 0) {
      return {
        ...ls[0],
        type: nameOfType,
      };
    }

    return {
      ...ls[0],
      type: "list",
      of: reapType(ls.slice(1)),
    };
  };

  return reapType(levels);
}

export const numberBooleanFlags = [
  "id",
  "unique",
  "public",
  "private",
  "even",
  "odd",
  "negative",
  "positive",
  "nonnegative",
  "nonpositive",
  "nonzero",
  "abs",
  "autoincrement",
  "optional",
];

export const stringBooleanFlags = [
  "id",
  "long",
  "medium",
  "short",
  "unique",
  "public",
  "private",
  "lowercase",
  "uppercase",
  "kebabcase",
  "screamingcase",
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
  "base64",
  "trim",
  "time",
  "datetime",
  "date",
  "secret",
  "password",
  "optional",
];

export const listBooleanFlags = ["empty", "nonempty"] as string[];

export const booleanBooleanFlags = ["true", "false", "optional"] as string[];

export const dateBooleanFlags = [
  "future",
  "past",
  "updatedAt",
  "createdAt",
  "optional",
];
