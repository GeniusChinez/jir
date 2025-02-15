import { z } from "zod";
import { FKOnChangeSchema } from "./fk.schema";

export const ReferenceSchema = z.object({
  name: z.string(),
  field: z.string(),
  onDelete: FKOnChangeSchema,
  onUpdate: FKOnChangeSchema,
});
