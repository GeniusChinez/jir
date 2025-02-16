// /* eslint-disable @typescript-eslint/no-explicit-any */

// /* eslint-disable @typescript-eslint/no-unused-vars */
// import { ValidationContext } from "src/validator/context";
// import { generateGenerator } from "./generate.generator";
// import { DataSourceProvider, generateDataSource } from "./generate.data-source";
// import {
//   DateTimeSymbol,
//   EntitySymbol,
//   EnumSymbol,
//   ListSymbol,
//   NumberSymbol,
//   ObjectSymbol,
//   Symbol,
//   SymbolKind,
//   TextSymbol,
// } from "../../validator/symbols";
// import { generateEnum } from "./generate.enum";
// import { generateType } from "./generate.type";
// import { generateModel } from "./generate.model";

// export interface PrismaGenerationOptions {
//   x?: boolean;
// }

// export function generateFromValidationContext(
//   context: ValidationContext,
//   options: PrismaGenerationOptions,
// ) {
//   const blocks = [
//     generateDataSource({
//       url: {
//         type: "raw",
//         value: "exampleDatabaseUrl",
//       },
//       provider: context.target,
//     }).slice(1), // get rid of the first \n
//     generateGenerator({
//       name: "client",
//       provider: "prisma-client-js",
//       engineType: "library",
//     }),
//   ];

//   for (const declName in context.table) {
//     const decl = context.table[declName];
//     switch (decl.type) {
//       case SymbolKind.Enum: {
//         blocks.push(
//           generateEnum({
//             name: decl.name,
//             members: (decl as EnumSymbol).values,
//           }),
//         );
//         break;
//       }
//       case SymbolKind.Object: {
//         blocks.push(
//           generateType({
//             name: decl.name,
//             fields: (() => {
//               const d = decl as ObjectSymbol;
//               return Object.keys(d.properties).map((name) => {
//                 const property = d.properties[name];

//                 return {
//                   name,
//                   kind: "normal",
//                   type: convertSymbolToPrismaTypeString({
//                     ...(property as any),
//                     target: context.target,
//                   }),
//                   optional: property.optional,
//                 };
//               });
//             })(),
//           }),
//         );
//         break;
//       }
//       case SymbolKind.Entity: {
//         const d = decl as EntitySymbol;
//         blocks.push(
//           generateModel({
//             unique: d.uniqueKey,
//             index: d.index,
//             schema: d.schema,
//             id: d.compositeKey,
//             ignore: d.ignore,
//             name: decl.name,
//             map: decl.map,
//             fields: (() => {
//               return Object.keys(d.properties).map((name) => {
//                 const property = d.properties[name];

//                 return {
//                   name,
//                   kind: "normal",
//                   type: convertSymbolToPrismaTypeString({
//                     ...(property as any),
//                     target: context.target,
//                   }),
//                   optional: property.optional,
//                   relation: {
//                     name: "creation_relation",
//                     fields: ["creatorId"],
//                     references: ["id"],
//                     onDelete: "Cascade",
//                     onUpdate: "SetNull",
//                   },
//                 };
//               });
//             })(),
//           }),
//         );
//         break;
//       }
//       default:
//     }
//   }

//   return blocks.join("\n");
// }

// export function convertSymbolToPrismaTypeString(
//   symbol: Symbol & { optional?: boolean; target: DataSourceProvider },
// ) {
//   let result = "";
//   const property = symbol;

//   if (property.type === SymbolKind.Boolean) {
//     result = "Boolean";
//   } else if (property.type === SymbolKind.DateTime) {
//     result = "Date";
//     const sym = symbol as DateTimeSymbol;
//     if (sym.createdAt) {
//       result = `${result} @default(now())`;
//     }

//     if (sym.updatedAt) {
//       result = `${result} @updatedAt`;
//     }

//     if (sym.defaultValue) {
//       result = `${result} @default(${sym.defaultValue.toISOString()})`;
//     }
//   } else if (property.type === SymbolKind.Number) {
//     const sym = property as NumberSymbol;
//     switch (sym.variant) {
//       case "bigint": {
//         result = "BigInt";
//         break;
//       }
//       case "decimal": {
//         result = "Decimal";
//         break;
//       }
//       case "float": {
//         result = "Float";
//         break;
//       }
//       case "int": {
//         result = "Int";
//         break;
//       }
//       default: {
//         result = "Int";
//         break;
//       }
//     }

//     if (sym.id) {
//       //  @default(autoincrement())
//       result = `${result} @id @default(autoincrement())`;
//     } else if (sym.autoincrement) {
//       result = `${result} @default(autoincrement())`;
//     } else if (sym.defaultValue) {
//       result = `${result} @default(${sym.defaultValue})`;
//     }
//   } else if (property.type === SymbolKind.Text) {
//     result = "String";
//     const sym = symbol as TextSymbol;

//     if (sym.id) {
//       result = `${result} @id`;
//       switch (symbol.target) {
//         case "mongodb": {
//           result = `${result} @default(${sym.defaultValue ? sym.defaultValue : "auto()"}) @map("_id")${sym.cuid || sym.uuid ? "" : " @db.ObjectId"}`;
//           break;
//         }
//         default:
//       }
//     } else if (sym.objectId) {
//       result = `${result} @db.ObjectId`;
//       if (sym.defaultValue) {
//         result = `${result} @default(${sym.defaultValue})`;
//       }
//     } else if (sym.defaultValue) {
//       result = `${result} @default(${sym.defaultValue})`;
//     }
//   } else if (property.type === SymbolKind.Object) {
//     result = property.name;
//   } else if (property.type === SymbolKind.Enum) {
//     result = property.name;
//     // const sym =
//     // if (sym.defaultValue) {
//     //   result = `${result} @default(${sym.defaultValue})`;
//     // }
//   } else if (property.type === SymbolKind.List) {
//     const sym = symbol as unknown as ListSymbol;
//     result = `${convertSymbolToPrismaTypeString({
//       ...sym.of,
//       target: symbol.target,
//     })}[]`;
//   } else {
//     result = property.name;
//   }

//   if (symbol.map) {
//     result = `${result} @map("${symbol.map}")`;
//   }

//   if (symbol.optional) {
//     result = result
//       .split(" ")
//       .map((item, index) => {
//         if (index === 0) {
//           return `${item}?`;
//         }
//         return item;
//       })
//       .join(" ");
//   }

//   if ((symbol as any).unique) {
//     result = `${result} @unique`;
//   }

//   if ((symbol as any).ignore) {
//     result = `${result} @ignore`;
//   }

//   if (symbol.db) {
//     result = `${result} ${symbol.db.map((item) => `@db.${item}`).join(" ")}`;
//   }

//   return result;
// }
