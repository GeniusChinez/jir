import { z } from "zod";

export const FKOnChangeSchema = z.enum([
  "NoAction",
  "Cascade",
  "Restrict",
  "SetNull",
]);
export type FKOnChange = z.infer<typeof FKOnChangeSchema>;
