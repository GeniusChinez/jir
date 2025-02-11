export interface TextTranformationOptions {
  lowercase?: boolean;
  uppercase?: boolean;
  kebabcase?: boolean;
  screamingcase?: boolean;
  camelcase?: boolean;
  pascalcase?: boolean;
  nospaces?: boolean;
  secret?: boolean; // means it will be encrypted
  slug?: boolean;
  trim?: boolean;
  encrypt?: string;
  hash?: string;
  password?: boolean;
}

export interface TextValidationOptions {
  nonempty?: boolean;
  nospecial?: boolean;
  alphanumeric?: boolean;
  alphabetic?: boolean;
  numeric?: boolean;
  url?: boolean;
  email?: boolean;
  ipaddress?: boolean;
  uuid?: boolean;
  cuid?: boolean;
  ulid?: boolean;
  cidr?: boolean;
  objectId?: boolean;
  base64?: boolean;
  time?: boolean;
  datetime?: boolean;
  date?: boolean;
  id?: boolean;
}

export type TextOptions<T = object> = TextTranformationOptions &
  TextValidationOptions &
  T;
