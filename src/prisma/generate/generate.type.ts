/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TypeGenerationOptions {
  name: string;
  fields: ({
    name: string;
  } & {
    kind: "normal";
    type: string;
    defaultValue?: any;
  })[];
}

export function generateType(options: TypeGenerationOptions) {
  const fields = options.fields.map((field) => {
    return `${field.name} ${field.type} ${field.defaultValue ? `@default(${JSON.stringify(field.defaultValue)})` : ""}`;
  });
  return `
type ${options.name} {
  ${fields.join("\n  ")}
}`;
}
