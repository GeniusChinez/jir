export function generateStringLiteral(value: string) {
  return `"${value}"`;
}

export function generateBooleanLiteral(value: boolean) {
  return value ? "true" : "false";
}

export function generateNumberLiteral(value: number) {
  return value.toString();
}
