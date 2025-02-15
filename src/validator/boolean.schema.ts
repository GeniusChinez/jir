import { z } from "zod";

export const BooleanSchema = z
  .boolean()
  .or(z.enum(["true", "false"]).transform((r) => r === "true"));
