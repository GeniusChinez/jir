// Character classification functions similar to C's isalpha, isdigit, etc.

/**
 * Checks if a string is entirely letters (A-Z or a-z)
 */
export function isAlpha(_char: string): boolean {
  return _char.split("").every((char) => {
    const code = char.charCodeAt(0);
    return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
  });
}

/**
 * Checks if a string is entirely digits (0-9)
 */
export function isDigit(_char: string): boolean {
  return _char.split("").every((char) => {
    const code = char.charCodeAt(0);
    return code >= 48 && code <= 57;
  });
}

/**
 * Checks if a string is entirely alphanumeric (A-Z, a-z, 0-9)
 */
export function isAlnum(_char: string): boolean {
  return _char.split("").every((char) => isAlpha(char) || isDigit(char));
}

/**
 * Checks if a string is entirely whitespace characters (space, tab, newline, etc.)
 */
export function isSpace(_char: string): boolean {
  return _char.split("").every((char) => /\s/.test(char));
}

/**
 * Checks if a string is entirely uppercase letters (A-Z)
 */
export function isUpper(_char: string): boolean {
  return _char.split("").every((char) => {
    const code = char.charCodeAt(0);
    return code >= 65 && code <= 90;
  });
}

/**
 * Checks if a string is entirely lowercase letters (a-z)
 */
export function isLower(_char: string): boolean {
  return _char.split("").every((char) => {
    const code = char.charCodeAt(0);
    return code >= 97 && code <= 122;
  });
}

/**
 * Checks if a string is entirely punctuation symbols (!, ?, ., etc.)
 */
export function isPunct(_char: string): boolean {
  return _char
    .split("")
    .every((char) => /[!@#$%^&*()\-_=+[{\]}\\|;:'",<.>/?]/.test(char));
}

/**
 * Checks if a string is entirely hexadecimal digits (0-9, A-F, a-f)
 */
export function isHexDigit(_char: string): boolean {
  return _char.split("").every((char) => /^[0-9A-Fa-f]$/.test(char));
}

/**
 * Checks if a string is entirely control characters (ASCII 0-31 and 127)
 */
export function isControl(_char: string): boolean {
  return _char.split("").every((char) => {
    const code = char.charCodeAt(0);
    return (code >= 0 && code <= 31) || code === 127;
  });
}

/**
 * Checks if a string is entirely printable ASCII characters (excluding control chars)
 */
export function isPrint(_char: string): boolean {
  return _char.split("").every((char) => {
    const code = char.charCodeAt(0);
    return code >= 32 && code < 127;
  });
}

/**
 * Checks if a string is entirely graphical characters (printable, but not space)
 */
export function isGraph(_char: string): boolean {
  return _char.split("").every((char) => isPrint(char) && !isSpace(char));
}

/**
 * Checks if a string is entirely blank spaces (space or tab)
 */
export function isBlank(_char: string): boolean {
  return _char.split("").every((char) => char === " " || char === "\t");
}
/**
 * Checks if a string is a valid database column/field name
 */
export function isValidColumnName(name: string) {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}
