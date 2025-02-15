import { z } from "zod";

export const SortOrderSchema = z.enum(["Asc", "Desc"]);
export type SortOrder = z.infer<typeof SortOrderSchema>;
