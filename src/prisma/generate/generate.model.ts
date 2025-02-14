import { generateStringLiteral } from "./generate.literals";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ModelGenerationOptions {
  name: string;
  map?: string;
  unique?:
    | {
        fields: (
          | string
          | { name: string; length?: number; sort?: "Asc" | "Desc" }
        )[];
        name?: string;
        map?: string;
        length?: number;
        sort?: "Asc" | "Desc";
        clustered?: boolean;
      }
    | string[];
  index?:
    | {
        fields: (
          | string
          | { name: string; length?: number; sort?: "Asc" | "Desc" }
        )[];
        name?: string;
        map?: string;
        length?: number;
        sort?: "Asc" | "Desc";
        clustered?: boolean;
        ops?: string;
      }
    | string[];
  ignore?: boolean;
  id?: string[];
  schema?: string;
  fields: ({
    name: string;
  } & {
    kind: "normal";
    type: string;
    defaultValue?: any;
    relation?: {
      name: string;
      fields: string[];
      references: string[];
      map?: string;
      onUpdate?: "Cascade" | "NoAction" | "SetDefault" | "SetNull" | "Restrict";
      onDelete?: "Cascade" | "NoAction" | "SetDefault" | "SetNull" | "Restrict";
    };
  })[];
}

export function generateModel(options: ModelGenerationOptions) {
  const lines = [
    ...options.fields.map((field) => {
      const result = `${field.name} ${field.type}${field.defaultValue ? ` @default(${JSON.stringify(field.defaultValue)})` : ""}`;

      if (field.relation) {
        const relation = field.relation;
        const temp = [
          generateStringLiteral(relation.name),
          `fields: [${relation.fields.join(", ")}]`,
          `references: [${relation.references.join(", ")}]`,
          relation.map ? `map: ${relation.map}` : "",
          relation.onDelete ? `onDelete: ${relation.onDelete}` : "",
          relation.onUpdate ? `onUpdate: ${relation.onUpdate}` : "",
        ]
          .filter(Boolean)
          .join(", ");
        return `${result} @relation(${temp})`;
      }

      return result;
    }),
    " ",
    options.unique
      ? Array.isArray(options.unique)
        ? `@@unique([${options.unique.join(", ")}])`
        : (() => {
            const unique = options.unique;
            const global = [
              unique.name ? `name: ${unique.name}` : "",
              unique.map ? `map: ${unique.map}` : "",
              unique.length !== undefined ? `length: ${unique.length}` : "",
              unique.sort ? `sort: ${unique.sort}` : "",
              unique.clustered ? `clustered: ${unique.clustered}` : "",
            ]
              .filter(Boolean)
              .join(", ");

            const args = [
              `[${unique.fields
                .map((field) => {
                  if (typeof field === "string") {
                    return field;
                  }

                  if (typeof field !== "object") {
                    return field;
                  }

                  if ("sort" in field && field.sort !== undefined) {
                    if ("length" in field && field.length !== undefined) {
                      return `${field.name}(length: ${field.length}, sort: ${field.sort})`;
                    }
                    return `${field.name}(sort: ${field.sort})`;
                  } else if ("length" in field && field.length !== undefined) {
                    if ("sort" in field && field.sort !== undefined) {
                      return `${field.name}(length: ${field.length}, sort: ${field.sort})`;
                    }
                    return `${field.name}(length: ${field.length})`;
                  }
                  return field.name;
                })
                .filter(Boolean)
                .join(", ")}]`,
              global,
            ]
              .filter(Boolean)
              .join(", ");

            return `@@unique(${args})`;
          })()
      : "",
    options.index
      ? Array.isArray(options.index)
        ? `@@index([${options.index.join(", ")}])`
        : (() => {
            const index = options.index;
            const global = [
              index.name ? `name: ${index.name}` : "",
              index.map ? `map: ${index.map}` : "",
              index.length !== undefined ? `length: ${index.length}` : "",
              index.sort ? `sort: ${index.sort}` : "",
              index.clustered ? `clustered: ${index.clustered}` : "",
              index.ops ? `ops: ${index.ops}` : "",
            ]
              .filter(Boolean)
              .join(", ");

            const args = [
              `[${index.fields
                .map((field) => {
                  if (typeof field === "string") {
                    return field;
                  }

                  if (typeof field !== "object") {
                    return field;
                  }

                  if ("sort" in field && field.sort !== undefined) {
                    if ("length" in field && field.length !== undefined) {
                      return `${field.name}(length: ${field.length}, sort: ${field.sort})`;
                    }
                    return `${field.name}(sort: ${field.sort})`;
                  } else if ("length" in field && field.length !== undefined) {
                    if ("sort" in field && field.sort !== undefined) {
                      return `${field.name}(length: ${field.length}, sort: ${field.sort})`;
                    }
                    return `${field.name}(length: ${field.length})`;
                  }
                  return field.name;
                })
                .join(", ")}]`,
              global,
            ].join(", ");

            return `@@index(${args})`;
          })()
      : "",
    options.id ? `@@id([${options.id.join(", ")}])` : "",
    options.map ? `@@map(${generateStringLiteral(options.map)})` : "",
    options.schema ? `@@schema(${generateStringLiteral(options.schema)})` : "",
    options.ignore ? "\n@@ignore" : "",
  ].filter(Boolean);
  return `
model ${options.name} {
  ${lines.join("\n  ")}
}`;
}
