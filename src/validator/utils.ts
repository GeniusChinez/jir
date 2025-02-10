/* eslint-disable @typescript-eslint/no-explicit-any */
import { Symbol } from "./symbols";

export function extractBooleanFields<Sym extends Symbol>(
  target: Sym,
  source: any,
  fields: (keyof Sym)[],
) {
  for (const field of fields) {
    if (field in source) {
      (target as any)[field] = !!source[field];
    }
  }
}

export function checkConflicts<Sym extends Symbol>(
  target: Sym,
  exclusiveGroups: (keyof Sym)[][],
) {
  for (const group of exclusiveGroups) {
    let trueCount = 0;
    let lastTrueField: keyof Sym | null = null;

    for (const field of group) {
      if (target[field]) {
        trueCount++;
        if (trueCount > 1) {
          throw new Error(
            `'${target.name}' cannot have both '${lastTrueField as string}' and '${field as string}'`,
          );
        }
        lastTrueField = field;
      }
    }
  }
}
