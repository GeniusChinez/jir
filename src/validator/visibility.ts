import { z } from "zod";

export const VisibilitySchema = z.enum([
  "public",
  "private",
  "admin",
  "system",
  "inherit",
]);
export type Visibility = z.infer<typeof VisibilitySchema>;
