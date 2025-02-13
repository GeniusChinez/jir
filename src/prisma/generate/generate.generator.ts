/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateStringLiteral } from "./generate.literals";

export interface GeneratorArgs {
  name: string;
  provider: string;
  output?: string;
  previewFeatures?: string[];
  engineType?: "library" | "binary";
  binaryTargets?: string[];
  customFields?: Record<string, any>;
}

export function generateGenerator(args: GeneratorArgs) {
  const {
    name,
    provider = "mongodb",
    output,
    previewFeatures,
    engineType,
    binaryTargets,
  } = args;

  const fields = [
    generateGeneratorField("provider", generateStringLiteral(provider)),
    output
      ? generateGeneratorField("output", generateStringLiteral(output))
      : undefined,
    previewFeatures
      ? generateGeneratorField(
          "previewFetures",
          JSON.stringify(previewFeatures),
        )
      : undefined,
    engineType
      ? generateGeneratorField("engineType", generateStringLiteral(engineType))
      : undefined,
    binaryTargets
      ? generateGeneratorField("binaryTargets", JSON.stringify(binaryTargets))
      : undefined,
  ]
    .filter(Boolean)
    .join("\n  ");

  const result = `
generator ${name} {
  ${fields}
}`;
  return result;
}

export function generateGeneratorField(name: string, value: string) {
  return `${name} = ${value}`;
}
