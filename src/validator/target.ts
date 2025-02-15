import { z } from "zod";

export const TargetDatabaseSchema = z.enum([
  "postgresql",
  "mysql",
  "sqlite",
  "sqlserver",
  "mongodb",
  "cockroachdb",
]);

export type TargetDatabase = z.infer<typeof TargetDatabaseSchema>;
