import { z } from "zod";

export const DateSchema = z.date().or(
  z
    .string()
    .date()
    .transform((d) => new Date(d)),
);
export const DateTimeSchema = z.date().or(
  z
    .string()
    .datetime()
    .transform((d) => new Date(d)),
);
