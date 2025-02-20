import { CountryCodeSchema } from "../schemas/countries";
import { isDigit, isSpace } from "./chars";

export class TypeParsingContext {
  private _source: string;
  private _index: number;
  private _field: string;

  constructor(source: string, field: string) {
    this._field = field;
    this._source = source.trim();
    this._index = 0;
  }

  fatalError(error: string) {
    throw new Error(`In '${this._field}', ${error}`);
  }

  getFieldName() {
    return this._field;
  }

  noMoreFood() {
    return this._index >= this._source.length;
  }
  moreFood() {
    return !this.noMoreFood();
  }
  swallow() {
    return this._source[this._index++];
  }
  taste() {
    return this.noMoreFood() ? "" : this._source[this._index];
  }

  peak(n: number = 1) {
    return this._index + n < this._source.length
      ? this._source[this._index + n]
      : "";
  }

  peaked(what: string) {
    const n = what.length;
    return (
      (this._index + n < this._source.length
        ? this._source[this._index + n]
        : "") === what
    );
  }

  sample(n = 10) {
    return this._source.slice(this._index, this._index + n);
  }

  getNextEdible(n: number = 1) {
    this._index += n;
    return this.taste();
  }

  swallowAir() {
    while (this.moreFood() && isSpace(this.taste())) {
      this.getNextEdible();
    }
  }

  tastesLike(ch: string) {
    if (!this.moreFood()) {
      return false;
    }

    return this._source.slice(this._index, this._index + ch.length) === ch;
  }

  matches(...validators: ((v: string) => boolean)[]) {
    return validators.every((validator) => validator(this.taste()));
  }

  safeExpect(expected: string) {
    if (!this.tastesLike(expected)) {
      return false;
    }
    this.getNextEdible(expected.length);
    return true;
  }

  expect(expected: string, error: string) {
    if (!this.tastesLike(expected)) {
      this.fatalError(error);
    }
    this.getNextEdible(expected.length);
  }

  parseNumber() {
    let temp = "";
    let isNegative = false;

    // Check for negative sign at the beginning
    if (this.moreFood() && this.tastesLike("-")) {
      isNegative = true;
      this.getNextEdible();
    }

    // Check for hexadecimal numbers (0x or 0X)
    if (this.moreFood() && (this.tastesLike("0x") || this.tastesLike("0X"))) {
      temp += this.swallow(); // '0'
      temp += this.swallow(); // 'x' or 'X'

      // Parse hexadecimal digits (0-9, a-f, A-F)
      while (this.moreFood() && /[0-9a-fA-F]/.test(this.taste())) {
        temp += this.swallow();
      }
      return temp;
    }

    // Check for binary numbers (0b or 0B)
    if (this.tastesLike("0b") || this.tastesLike("0B")) {
      temp += this.swallow(); // '0'
      temp += this.swallow(); // 'b' or 'B'

      // Parse binary digits (0-1)
      while (this.moreFood() && /[01]/.test(this.taste())) {
        temp += this.swallow();
      }
      return temp;
    }

    // Check for octal numbers (starting with 0)
    if (this.moreFood() && this.tastesLike("0")) {
      temp += this.swallow(); // '0'

      // Parse octal digits (0-7)
      while (this.moreFood() && /[0-7]/.test(this.taste())) {
        temp += this.swallow();
      }
      return temp;
    }

    // Otherwise, parse regular numbers (including decimals)
    while (this.moreFood() && isDigit(this.taste())) {
      temp += this.swallow();
    }

    // Handle decimal point
    if (this.moreFood() && this.tastesLike(".")) {
      this.getNextEdible();
      while (this.moreFood() && isDigit(this.taste())) {
        temp += this.swallow();
      }
      if (temp.endsWith(".")) {
        temp += "0";
      }
    }

    // Add the negative sign to the beginning if it's a negative number
    if (isNegative) {
      temp = "-" + temp;
    }

    return temp;
  }

  swallowNumber(error: string) {
    const temp = this.parseNumber();

    if (!temp) {
      this.fatalError(error);
    }

    return Number(temp);
  }

  expectMultipleNumbers(error: string) {
    const result: number[] = [];
    while (this.moreFood()) {
      result.push(this.swallowNumber(error));
      this.swallowAir();

      if (this.tastesLike(",")) {
        this.getNextEdible();
        this.swallowAir();
        continue;
      }

      break;
    }
    return result;
  }

  swallowString(error: string) {
    this.expect("'", error);
    let temp = "";

    while (this.moreFood() && !this.tastesLike("'")) {
      temp += this.swallow();
      if (this.tastesLike("\\") && this.peak(1) === "'") {
        temp += "'";
        this.getNextEdible(2);
      }
    }

    if (!temp) {
      this.fatalError(error);
    }

    this.expect("'", error);
    return temp;
  }

  swallowMultipleStrings(error: string) {
    const result: string[] = [];
    while (this.moreFood()) {
      result.push(this.swallowString(error));
      this.swallowAir();

      if (this.tastesLike(",")) {
        this.getNextEdible();
        this.swallowAir();
        continue;
      }

      break;
    }
    return result;
  }

  swallowBoolean(error: string) {
    if (this.noMoreFood()) {
      this.fatalError(error);
    }

    if (this.tastesLike("t")) {
      if (this.safeExpect("true")) {
        return true;
      }
      this.fatalError(error);
    }

    if (this.tastesLike("f")) {
      if (this.safeExpect("false")) {
        return false;
      }
      this.fatalError(error);
    }

    this.fatalError(error);
  }

  swallowStringAttributeArgument(attributeName: string) {
    this.expect("(", `For attribute '@${attributeName}', expected '('`);
    this.swallowAir();
    const value = this.swallowString(
      `Expected a string (with single quotes) after '@${attributeName}('`,
    );
    this.swallowAir();
    this.expect(")", `For attribute '@${attributeName}', expected ')'`);
    return value;
  }

  swallowBooleanAttributeArgument(attributeName: string) {
    this.expect("(", `For attribute '@${attributeName}', expected '('`);
    this.swallowAir();
    const value = this.swallowBoolean(
      `Expected a boolean after '@${attributeName}('`,
    );
    this.swallowAir();
    this.expect(")", `For attribute '@${attributeName}', expected ')'`);
    return value;
  }

  swallowOptionalStringAttributeArgument(attributeName: string) {
    if (this.tastesLike("(")) {
      this.swallow();
      this.swallowAir();
      const value = this.swallowString(
        `Expected a string (with single quotes) after '@${attributeName}('`,
      );
      this.swallowAir();
      this.expect(")", `For attribute '@${attributeName}', expected ')'`);
      return value;
    }
    return true;
  }

  swallowCountryAttributeArgument(attributeName: string) {
    this.expect("(", `For attribute '@${attributeName}', expected '('`);
    this.swallowAir();
    const value = this.swallowString(
      `Expected a string (with single quotes) after '@${attributeName}('`,
    );
    const { data: countryCode, success } = CountryCodeSchema.safeParse(value);
    if (!success) {
      this.fatalError(`Found unknown country '${value}'`);
    }

    this.swallowAir();
    this.expect(")", `For attribute '@${attributeName}', expected ')'`);
    return countryCode;
  }

  swallowStringListAttributeArgument(attributeName: string) {
    this.expect("(", `For attribute '@${attributeName}', expected '('`);
    this.swallowAir();
    const value = this.swallowMultipleStrings(
      `Expected strings (with single quotes) after '@${attributeName}('`,
    );
    this.swallowAir();
    this.expect(")", `For attribute '@${attributeName}', expected ')'`);
    return value;
  }

  swallowNumberAttributeArgument(attributeName: string) {
    this.expect("(", `For attribute '@${attributeName}', expected '('`);
    this.swallowAir();
    const value = this.swallowNumber(
      `Expected number after '@${attributeName}('`,
    );
    this.swallowAir();
    this.expect(")", `For attribute '@${attributeName}', expected ')'`);
    return value;
  }

  swallowNumberListAttributeArgument(attributeName: string) {
    this.expect("(", `For attribute '@${attributeName}', expected '('`);
    this.swallowAir();
    const value = this.expectMultipleNumbers(
      `Expected numbers after '@${attributeName}('`,
    );
    this.swallowAir();
    this.expect(")", `For attribute '@${attributeName}', expected ')'`);
    return value;
  }
}
