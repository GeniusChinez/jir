// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { isAlnum, isAlpha } from "../chars";
// import { ValidationContext } from "../context";
// import { parseFieldTypeFromString } from "../parse.field-type.from-string";
// import { resolveName } from "./resolve.name";
// import { resolveSymbol } from "../resolve.symbol";
// import { parseTypeFromSource } from "../source-types";
// import { ObjectSymbol, Symbol, SymbolKind, SymbolStatus } from "./symbols";

// export function resolveObjectSymbol(
//   _symbol: Symbol,
//   context: ValidationContext,
// ) {
//   const symbol: ObjectSymbol = {
//     ..._symbol,
//     properties: {},
//     final: "final" in _symbol.raw && !!_symbol.raw.final,
//     abstract: "abstract" in _symbol.raw && !!_symbol.raw.abstract,
//   };

//   const { raw } = _symbol;

//   if (!("properties" in raw)) {
//     throw new Error(`Object '${symbol.name}' is missing 'properties'`);
//   }

//   if (!(raw.properties && typeof raw.properties === "object")) {
//     throw new Error(
//       `Object '${symbol.name}' must have a valid 'properties' object`,
//     );
//   }

//   Object.keys(raw.properties).forEach((propertyName) => {
//     if (
//       !propertyName ||
//       !propertyName.split(" ").every((ch) => isAlnum(ch) || ch === "_")
//     ) {
//       throw new Error(
//         `Object '${symbol.name}' property '${propertyName}' must be made of alphabets and or digits`,
//       );
//     }

//     if (!isAlpha(propertyName[0])) {
//       throw new Error(
//         `Object '${symbol.name}' property '${propertyName}' must start with an alphabet`,
//       );
//     }

//     const properties = raw.properties as any;
//     const property = properties[propertyName];

//     const displayName = `${symbol.name}.${propertyName}`;

//     const expandedProperty =
//       typeof property !== "string"
//         ? property
//         : parseFieldTypeFromString(displayName, property);

//     const type = parseTypeFromSource(expandedProperty) as SymbolKind;
//     if (type === SymbolKind.Entity) {
//       throw new Error(
//         `type '${property.type}' not allowed for '${displayName}'`,
//       );
//     }

//     const propertyAsSymbol: Symbol = {
//       name: displayName,
//       referenceCount: 0,
//       raw: expandedProperty,
//       status: SymbolStatus.Unresolved,
//       type,
//     };

//     const resolved = resolveSymbol(propertyAsSymbol, context);
//     symbol.properties[propertyName] = {
//       ...resolved,
//       optional: "optional" in expandedProperty && !!expandedProperty.optional,
//     };

//     if ("abstract" in resolved && !!resolved.abstract) {
//       throw new Error(
//         `Abstract type '${type}' not allowed for '${displayName}'`,
//       );
//     }

//     if ("references" in resolved && resolved.references) {
//       throw new Error(
//         `Object property '${displayName}' must not reference other entities/objects`,
//       );
//     }
//   });

//   if ("extends" in raw) {
//     if (typeof raw.extends === "string") {
//       const parent = resolveName(raw.extends, context);

//       if ("final" in parent && parent.final) {
//         throw new Error(
//           `'${symbol.name}' cannot extend '${raw.extends}' as that guy is marked 'final'`,
//         );
//       }

//       if (![SymbolKind.Entity, SymbolKind.Object].includes(parent.type)) {
//         throw new Error(
//           `'${symbol.name}' cannot extend a non-entity/object type '${raw.extends}'`,
//         );
//       }

//       if (!("properties" in parent)) {
//         throw new Error(
//           `'${symbol.name}' is extending a type with missing properties '${raw.extends}'`,
//         );
//       }

//       symbol.properties = {
//         ...symbol.properties,
//         ...(parent.properties as object),
//       };
//     } else if (typeof raw.extends === "object" && Array.isArray(raw.extends)) {
//       if (raw.extends.length) {
//         for (const proposedParent of raw.extends) {
//           if (typeof proposedParent === "string") {
//             const parent = resolveName(proposedParent, context);

//             if ("final" in parent && parent.final) {
//               throw new Error(
//                 `'${symbol.name}' cannot extend '${proposedParent}' as that guy is marked 'final'`,
//               );
//             }

//             if (![SymbolKind.Entity, SymbolKind.Object].includes(parent.type)) {
//               throw new Error(
//                 `'${symbol.name}' cannot extend a non-entity/object type '${proposedParent}'`,
//               );
//             }

//             if (!("properties" in parent)) {
//               throw new Error(
//                 `'${symbol.name}' is extending a type with missing properties '${proposedParent}'`,
//               );
//             }

//             symbol.properties = {
//               ...symbol.properties,
//               ...(parent.properties as object),
//             };
//           } else {
//             throw new Error(
//               `Expected a list of aliases in the 'extends' of '${symbol.name}'`,
//             );
//           }
//         }
//       }
//     } else {
//       throw new Error(
//         `'${symbol.name}' expected an alias or list of aliases in "extends"`,
//       );
//     }
//   }

//   return symbol;
// }
