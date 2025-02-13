/* eslint-disable @typescript-eslint/no-unused-vars */
import { ValidationContext } from "src/validator/context";
import { generateGenerator } from "./generate.generator";
import { generateDataSource } from "./generate.data-source";
import { EnumSymbol, SymbolKind } from "../../validator/symbols";
import { generateEnum } from "./generate.enum";

export interface PrismaGenerationOptions {
  x?: boolean;
}

export function generateFromValidationContext(
  context: ValidationContext,
  options: PrismaGenerationOptions,
) {
  const blocks = [
    generateDataSource({
      url: {
        type: "raw",
        value: "exampleDatabaseUrl",
      },
      provider: context.target,
    }).slice(1), // get rid of the first \n
    generateGenerator({
      name: "client",
      provider: "prisma-client-js",
      engineType: "library",
    }),
  ];

  for (const declName in context.table) {
    const decl = context.table[declName];
    switch (decl.type) {
      case SymbolKind.Enum: {
        blocks.push(
          generateEnum({
            name: decl.name,
            members: (decl as EnumSymbol).values,
          }),
        );
        break;
      }
      default:
    }
  }

  return blocks.join("\n");
}
