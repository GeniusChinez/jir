import { z } from "zod";
import { globalEntityOperations } from "./entity.operations";

export const EntityPermissionsSchema = (
  entityOperations = globalEntityOperations,
) =>
  z
    .record(
      z.string().or(z.literal("*")),
      z.string().array().or(z.literal("*")),
    )
    .transform((stuff) => {
      const transformed = {} as Record<string, string[]>;

      if ("*" in stuff) {
        const value = stuff["*"];
        transformed["*"] = value === "*" ? entityOperations : value;

        if (value === "*") {
          for (const role in stuff) {
            transformed[role] = entityOperations;
          }
          return transformed;
        }
      }

      for (const role in stuff) {
        if (role === "*") {
          continue;
        }

        if (stuff[role] === "*") {
          transformed[role] = entityOperations;
        } else {
          transformed[role] = stuff[role];
        }
      }

      return transformed;
    });
