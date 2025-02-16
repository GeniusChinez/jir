// import { generateStringLiteral } from "./generate.literals";

// export type DatabaseUrlSpec = {
//   type: "raw" | "env";
//   value: string;
// };

// export type DataSourceProvider =
//   | "postgresql"
//   | "mysql"
//   | "sqlite"
//   | "sqlserver"
//   | "mongodb"
//   | "cockroachdb";

// export interface DataSourceArgs {
//   name?: string;
//   provider: DataSourceProvider;
//   url: DatabaseUrlSpec;
//   shadowDatabaseUrl?: DatabaseUrlSpec;
//   directUrl?: DatabaseUrlSpec;
//   relationMode?: "foreignKeys" | "prisma";
//   // @todo: add support for extensions (used by postgres)
// }

// export function generateDataSource(args: DataSourceArgs) {
//   const {
//     name = "db",
//     provider = "mongodb",
//     url,
//     shadowDatabaseUrl,
//     directUrl,
//     relationMode,
//   } = args;

//   const result = `
// datasource ${name || "db"} {
//   ${generateDataSourceField("provider", generateStringLiteral(provider))}
//   ${generateDataSourceField("url", generateDataSourceUrl(url))}${shadowDatabaseUrl ? `\n  ${generateDataSourceField("shadowDatabaseUrl", generateDataSourceUrl(shadowDatabaseUrl))}` : ""}${directUrl ? `\n  ${generateDataSourceField("directUrl", generateDataSourceUrl(directUrl))}` : ""}${relationMode ? `\n  ${generateDataSourceField("relationMode", generateStringLiteral(relationMode))}` : ""}
// }`;
//   return result;
// }

// export function generateDataSourceField(name: string, value: string) {
//   return `${name} = ${value}`;
// }

// export function generateDataSourceUrl(spec: DatabaseUrlSpec) {
//   const inner = generateStringLiteral(spec.value);
//   return `${spec.type === "env" ? `env(${inner})` : inner}`;
// }
