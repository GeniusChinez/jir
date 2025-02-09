// Character classification functions similar to C's isalpha, isdigit, etc.

/**
 * Checks if a character is a letter (A-Z or a-z)
 */
export function isAlpha(char: string): boolean {
  const code = char.charCodeAt(0);
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

/**
 * Checks if a character is a digit (0-9)
 */
export function isDigit(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 48 && code <= 57;
}

/**
 * Checks if a character is alphanumeric (A-Z, a-z, 0-9)
 */
export function isAlnum(char: string): boolean {
  return isAlpha(char) || isDigit(char);
}

/**
 * Checks if a character is a whitespace character (space, tab, newline, etc.)
 */
export function isSpace(char: string): boolean {
  return /\s/.test(char);
}

/**
 * Checks if a character is an uppercase letter (A-Z)
 */
export function isUpper(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 65 && code <= 90;
}

/**
 * Checks if a character is a lowercase letter (a-z)
 */
export function isLower(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 97 && code <= 122;
}

/**
 * Checks if a character is a punctuation symbol (!, ?, ., etc.)
 */
export function isPunct(char: string): boolean {
  return /[!@#$%^&*()\-_=+[{\]}\\|;:'",<.>/?]/.test(char);
}

/**
 * Checks if a character is a hexadecimal digit (0-9, A-F, a-f)
 */
export function isHexDigit(char: string): boolean {
  return /^[0-9A-Fa-f]$/.test(char);
}

/**
 * Checks if a character is a control character (ASCII 0-31 and 127)
 */
export function isControl(char: string): boolean {
  const code = char.charCodeAt(0);
  return (code >= 0 && code <= 31) || code === 127;
}

/**
 * Checks if a character is a printable ASCII character (excluding control chars)
 */
export function isPrint(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 32 && code < 127;
}

/**
 * Checks if a character is a graphical character (printable, but not space)
 */
export function isGraph(char: string): boolean {
  return isPrint(char) && !isSpace(char);
}

/**
 * Checks if a character is a blank space (space or tab)
 */
export function isBlank(char: string): boolean {
  return char === " " || char === "\t";
}
