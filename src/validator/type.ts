/* eslint-disable @typescript-eslint/no-explicit-any */
import { isAlnum, isDigit, isSpace } from "./chars";

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
  const eof = () => index >= source.length;
  const eat = () => source[index++];
  const taste = () => (eof() ? "" : source[index]);
  const peak = (n: number = 1) =>
    index + n < source.length ? source[index + n] : "";
  const pass = (n: number = 1) => (index += n);

  const skipSpace = () => {
    while (!eof() && isSpace(taste())) {
      pass();
    }
  };

  const match = (ch: string) => {
    return !eof() && source.slice(index, index + ch.length) === ch;
  };

  const safeExpect = (expected: string) => {
    if (!match(expected)) {
      return false;
    }
    pass(expected.length);
    return true;
  };

  const expect = (expected: string, error: string) => {
    if (!match(expected)) {
      throw new Error(error);
    }
    pass(expected.length);
  };

  const parseNumber = () => {
    let temp = "";
    while (!eof() && isDigit(taste())) {
      temp += eat();
    }

    if (!eof() && taste() === ".") {
      pass();

      while (!eof() && isDigit(taste())) {
        temp += eat();
      }

      if (temp.endsWith(".")) {
        temp += "0";
      }
    }

    return temp;
  };

  const expectNumber = (error: string) => {
    const temp = parseNumber();

    if (!temp) {
      throw new Error(error);
    }

    return Number(temp);
  };

  const expectMultipleNumbers = (error: string) => {
    const result: number[] = [];
    while (!eof()) {
      result.push(expectNumber(error));
      skipSpace();

      if (match(",")) {
        pass();
        skipSpace();
        continue;
      }

      break;
    }
    return result;
  };

  const expectString = (error: string) => {
    expect("'", error);
    let temp = "";

    while (!eof() && taste() !== "'") {
      temp += eat();
      if (taste() === "\\" && peak(1) === "'") {
        temp += "'";
        pass(2);
      }
    }

    if (!temp) {
      throw new Error(error);
    }

    expect("'", error);
    return temp;
  };

  const expectBoolean = (error: string) => {
    if (eof()) {
      throw new Error(error);
    }

    if (taste() === "t") {
      if (safeExpect("true")) {
        return true;
      }
      throw new Error(error);
    }

    if (taste() === "f") {
      if (safeExpect("false")) {
        return false;
      }
      throw new Error(error);
    }

    throw new Error(error);
  };

  // ....
  while (!eof() && (isAlnum(taste()) || ["-", "_"].includes(taste()))) {
    nameOfType += eat();
  }

  let arrayDepth = 0;

  while (
    !eof() &&
    taste() === "[" &&
    index + 1 < source.length &&
    peak(1) === "]"
  ) {
    arrayDepth++;
    pass(2);
  }

  skipSpace();

  if (eof()) {
    return createDefaultArrayType({ type: nameOfType }, arrayDepth);
  }

  const levels: Record<string, any>[] = [{}];
  let levelIndex = levels.length;

  const parseAttribute = () => {
    // NOTE: THIS APPROACH DOESNT WORK. USE A RECURSIVE ONE, WHERE THIS FUNCTION RETURNS SOMETHING
    // const

    // We're gonna need somewhere to hold info parsed here

    // First, we expect an attribute name
    let attributeName = "";
    while (!eof() && isAlnum(taste())) {
      attributeName += eat();
    }

    if (!attributeName.length) {
      throw new Error(`In '${fieldName}', found unnamed attribute in the type`);
    }

    // We dont care about the space after the attribute name
    skipSpace();

    if (levelIndex < arrayDepth) {
      expect(
        "(",
        `In '${fieldName}', expected opening '(' for attribute '@${attributeName}'`,
      );

      switch (attributeName) {
        case "some":
        case "every":
        case "none": {
          levelIndex++;
          // parseAttribute();
          // levels[levelIndex][attributeName] =

          // WHAT DO WE DO HERE!!!!!!!!!!!!!!!!
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
            if (!eof() && taste() === "(") {
              pass();
              levels[levelIndex][attributeName] = expectBoolean(
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
            case "max": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              skipSpace();
              levels[levelIndex]["max"] = expectNumber(
                `Expected a number after '@${attributeName}('`,
              );
              skipSpace();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "min": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              skipSpace();
              levels[levelIndex]["min"] = expectNumber(
                `Expected a number after '@${attributeName}('`,
              );
              skipSpace();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "default": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              skipSpace();
              levels[levelIndex]["min"] = expectNumber(
                `Expected a number after '@${attributeName}('`,
              );
              skipSpace();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "mod": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              skipSpace();
              levels[levelIndex]["mod"] = expectNumber(
                `Expected a number after '@${attributeName}('`,
              );
              skipSpace();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "gt": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              skipSpace();
              levels[levelIndex]["gt"] = expectNumber(
                `Expected a number after '@${attributeName}('`,
              );
              skipSpace();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "gte": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              skipSpace();
              levels[levelIndex]["gte"] = expectNumber(
                `Expected a number after '@${attributeName}('`,
              );
              skipSpace();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "lt": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              skipSpace();
              levels[levelIndex]["lt"] = expectNumber(
                `Expected a number after '@${attributeName}('`,
              );
              skipSpace();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "lte": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              skipSpace();
              levels[levelIndex]["lte"] = expectNumber(
                `Expected a number after '@${attributeName}('`,
              );
              skipSpace();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "eq": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              skipSpace();
              levels[levelIndex]["eq"] = expectNumber(
                `Expected a number after '@${attributeName}('`,
              );
              skipSpace();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "neq": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              skipSpace();
              levels[levelIndex]["neq"] = expectNumber(
                `Expected a number after '@${attributeName}('`,
              );
              skipSpace();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "plus": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              skipSpace();
              levels[levelIndex]["plus"] = expectNumber(
                `Expected a number after '@${attributeName}('`,
              );
              skipSpace();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "minus": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              skipSpace();
              levels[levelIndex]["minus"] = expectNumber(
                `Expected a number after '@${attributeName}('`,
              );
              skipSpace();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "divides": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              skipSpace();
              levels[levelIndex]["divides"] = expectMultipleNumbers(
                `Expected one or more numbers after '@${attributeName}('`,
              );
              skipSpace();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "divisor": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              skipSpace();
              levels[levelIndex]["divisor"] = expectMultipleNumbers(
                `Expected one or more numbers after '@${attributeName}('`,
              );
              skipSpace();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "in": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              skipSpace();
              levels[levelIndex]["in"] = expectMultipleNumbers(
                `Expected one or more numbers after '@${attributeName}('`,
              );
              skipSpace();
              expect(
                ")",
                `In '${fieldName}' attribute '@${attributeName}', expected ')'`,
              );
              break;
            }
            case "notIn": {
              expect(
                "(",
                `In '${fieldName}' attribute '@${attributeName}', expected '('`,
              );
              skipSpace();
              levels[levelIndex]["notIn"] = expectMultipleNumbers(
                `Expected one or more numbers after '@${attributeName}('`,
              );
              skipSpace();
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
              skipSpace();
              levels[levelIndex]["map"] = expectString(
                `Expected a string (with single quotes) after '@${attributeName}('`,
              );
              skipSpace();
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
        case "string":
        case "boolean":
        case "date":
        default: {
          throw new Error(
            `In '${fieldName}', found impermissible attribute '@${attributeName}'`,
          );
        }
      }
    }

    skipSpace();
  };

  do {
    const char = eat();
    if (char !== "@") {
      throw new Error(
        `In '${fieldName}', found unexpected stuff '${char}${source.slice(index, index + 10)}...' in the type`,
      );
    }
    parseAttribute();
  } while (!eof());

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
