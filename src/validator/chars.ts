// Character classification functions similar to C's isalpha, isdigit, etc.

import { z } from "zod";

/**
 * Checks if a string is entirely letters (A-Z or a-z)
 */
export function isAlpha(_char: string): boolean {
  return _char.split("").every((char) => {
    const code = char.charCodeAt(0);
    return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
  });
}

export const AlphaSchema = z
  .string()
  .refine(isAlpha, "Must be entirely alphabetic");

/**
 * Checks if a string is entirely digits (0-9)
 */
export function isDigit(_char: string): boolean {
  return _char.split("").every((char) => {
    const code = char.charCodeAt(0);
    return code >= 48 && code <= 57;
  });
}

export const DigitsSchema = z
  .string()
  .refine(isDigit, "Must be entirely digits");

/**
 * Checks if a string is entirely alphanumeric (A-Z, a-z, 0-9)
 */
export function isAlnum(_char: string): boolean {
  return _char.split("").every((char) => isAlpha(char) || isDigit(char));
}

export const AlnumSchema = z
  .string()
  .refine(isAlnum, "Must be entirely alphanumeric");

/**
 * Checks if a string is entirely whitespace characters (space, tab, newline, etc.)
 */
export function isSpace(_char: string): boolean {
  return _char.split("").every((char) => /\s/.test(char));
}

export const SpaceSchema = z.string().refine(isSpace, "Must be entirely space");

/**
 * Checks if a string is entirely uppercase letters (A-Z)
 */
export function isUpper(_char: string): boolean {
  return _char.split("").every((char) => {
    const code = char.charCodeAt(0);
    return code >= 65 && code <= 90;
  });
}

export const UppercaseSchema = z
  .string()
  .refine(isUpper, "Must be entirely uppercase");
export const ToUppercaseSchema = z.string().toUpperCase();

/**
 * Checks if a string is entirely lowercase letters (a-z)
 */
export function isLower(_char: string): boolean {
  return _char.split("").every((char) => {
    const code = char.charCodeAt(0);
    return code >= 97 && code <= 122;
  });
}

export const LowercaseSchema = z
  .string()
  .refine(isLower, "Must be entirely lowercase");
export const ToLowercaseSchema = z.string().toLowerCase();

/**
 * Checks if a string is entirely punctuation symbols (!, ?, ., etc.)
 */
export function isPunct(_char: string): boolean {
  return _char
    .split("")
    .every((char) => /[!@#$%^&*()\-_=+[{\]}\\|;:'",<.>/?]/.test(char));
}

export const PunctSchema = z
  .string()
  .refine(isPunct, "Must be entirely punctuation");

/**
 * Checks if a string is entirely hexadecimal digits (0-9, A-F, a-f)
 */
export function isHexDigit(_char: string): boolean {
  return _char.split("").every((char) => /^[0-9A-Fa-f]$/.test(char));
}

export const HexDigitSchema = z
  .string()
  .refine(isHexDigit, "Must be entirely hexadecimal digits");

/**
 * Checks if a string is entirely control characters (ASCII 0-31 and 127)
 */
export function isControl(_char: string): boolean {
  return _char.split("").every((char) => {
    const code = char.charCodeAt(0);
    return (code >= 0 && code <= 31) || code === 127;
  });
}

export const ControlCharacterSchema = z
  .string()
  .refine(isControl, "Must be entirely control characters");

/**
 * Checks if a string is entirely printable ASCII characters (excluding control chars)
 */
export function isPrint(_char: string): boolean {
  return _char.split("").every((char) => {
    const code = char.charCodeAt(0);
    return code >= 32 && code < 127;
  });
}

export const PrintableCharacterSchema = z
  .string()
  .refine(isPrint, "Must be entirely printable characters");

/**
 * Checks if a string is entirely graphical characters (printable, but not space)
 */
export function isGraph(_char: string): boolean {
  return _char.split("").every((char) => isPrint(char) && !isSpace(char));
}

export const GraphicalCharacterSchema = z
  .string()
  .refine(isGraph, "Must be entirely graphical characters");

/**
 * Checks if a string is entirely blank spaces (space or tab)
 */
export function isBlank(_char: string): boolean {
  return _char.split("").every((char) => char === " " || char === "\t");
}

export const BlankSchema = z.string().refine(isBlank, "Must be entirely blank");

/**
 * Checks if a string is a valid database column/field name
 */
export function isValidColumnName(name: string) {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

export const ValidColumnSchema = z
  .string()
  .refine(isValidColumnName, "Must be valid column name");
