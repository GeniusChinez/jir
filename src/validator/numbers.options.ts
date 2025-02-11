export interface NumberTransformationOptions {
  plus?: bigint | number;
  minus?: bigint | number;
  abs?: boolean;
}

export interface NumberValidationOptions {
  positive?: boolean;
  negative?: boolean;
  nonzero?: boolean;
  nonnegative?: boolean;
  nonpositive?: boolean;
  gt?: bigint | number;
  gte?: bigint | number;
  lt?: bigint | number;
  lte?: bigint | number;
  eq?: bigint | number;
  neq?: bigint | number;
  divides?: bigint | number;
  divisors?: bigint | number;
  id?: boolean;
  even?: boolean;
  odd?: boolean;
  max?: bigint | number;
  min?: bigint | number;
}

export type NumberOptions<T = object> = NumberTransformationOptions &
  NumberValidationOptions &
  T;
