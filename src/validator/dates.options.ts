export interface DateValidationOptions {
  gt?: Date;
  gte?: Date;
  lt?: Date;
  lte?: Date;
  eq?: Date;
  neq?: Date;
  past?: boolean;
  future?: boolean;
  updatedAt?: boolean;
  createdAt?: boolean;
}

export type DateOptions<T = object> = DateValidationOptions & T;
