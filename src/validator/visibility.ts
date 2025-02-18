import { z } from "zod";
import { BooleanSchema } from "./boolean.schema";

export const visibilities = [
  "public",
  "private",
  "admin",
  "system",
  "inherit",
] as const;

export const VisibilitySchema = z.enum(visibilities);
export type Visibility = z.infer<typeof VisibilitySchema>;

export const VisibilityOptionsSchema = z
  .object({
    visibility: VisibilitySchema.optional().default("inherit"),
    private: BooleanSchema.optional(),
    public: BooleanSchema.optional(),
    system: BooleanSchema.optional(),
    admin: BooleanSchema.optional(),
  })
  .transform(
    ({
      private: _private,
      public: _public,
      system: _system,
      admin,
      ...args
    }) => {
      return {
        visibility: _private
          ? "private"
          : _public
            ? "public"
            : _system
              ? "system"
              : admin
                ? "admin"
                : args.visibility || "inherit",
      };
    },
  );
