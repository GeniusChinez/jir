// /* eslint-disable @typescript-eslint/no-explicit-any */
// import dayjs from "dayjs";
// import { isValidColumnName } from "../chars";
// import { ValidationContext } from "../context";
// import { DateTimeSymbol, Symbol } from "./symbols";
// import { checkConflicts, extractBooleanFields } from "../utils";

// export function resolveDateTimeSymbol(
//   _symbol: Symbol,
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   context: ValidationContext,
// ) {
//   const symbol: DateTimeSymbol = {
//     ..._symbol,
//     visibility:
//       "private" in _symbol.raw && !!_symbol.raw.private ? "private" : "public",
//   };

//   extractBooleanFields(symbol, _symbol.raw, [
//     "future",
//     "past",
//     "createdAt",
//     "updatedAt",
//   ]);

//   checkConflicts(symbol, [
//     ["future", "past"],
//     ["createdAt", "updatedAt"],
//   ]);

//   const { raw } = _symbol;

//   if ("map" in raw) {
//     if (typeof raw.map !== "string" || !isValidColumnName(raw.map)) {
//       throw new Error(
//         `Invalid database column/field name '${raw.map}' while mapping for '${symbol.name}'`,
//       );
//     }
//     symbol.map = raw.map;
//   }

//   const reapDateValue = (name: string, rename?: string) => {
//     if (name in raw) {
//       const value = (raw as any)[name];
//       (symbol as any)[rename || name] = dayjs(value).toDate();
//     }
//   };

//   reapDateValue("default", "defaultValue");
//   reapDateValue("gt");
//   reapDateValue("gte");
//   reapDateValue("lt");
//   reapDateValue("lte");
//   reapDateValue("eq");
//   reapDateValue("neq");

//   return symbol;
// }
