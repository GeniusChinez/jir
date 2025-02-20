import { z } from "zod";

export enum GermanState {
  BadenWürttemberg = "Baden-Württemberg",
  Bavaria = "Bavaria",
  Berlin = "Berlin",
  Brandenburg = "Brandenburg",
  Bremen = "Bremen",
  Hamburg = "Hamburg",
  Hesse = "Hesse",
  LowerSaxony = "Lower Saxony",
  MecklenburgVorpommern = "Mecklenburg-Vorpommern",
  NorthRhineWestphalia = "North Rhine-Westphalia",
  RhinelandPalatinate = "Rhineland-Palatinate",
  Saarland = "Saarland",
  Saxony = "Saxony",
  SaxonyAnhalt = "Saxony-Anhalt",
  SchleswigHolstein = "Schleswig-Holstein",
  Thuringia = "Thuringia",
}

export enum GermanStateAbbreviation {
  BadenWürttemberg = "BW",
  Bavaria = "BY",
  Berlin = "BE",
  Brandenburg = "BB",
  Bremen = "HB",
  Hamburg = "HH",
  Hesse = "HE",
  LowerSaxony = "NI",
  MecklenburgVorpommern = "MV",
  NorthRhineWestphalia = "NW",
  RhinelandPalatinate = "RP",
  Saarland = "SL",
  Saxony = "SN",
  SaxonyAnhalt = "ST",
  SchleswigHolstein = "SH",
  Thuringia = "TH",
}

export const GermanStateSchema = z
  .union([
    z.nativeEnum(GermanState), // Accept full state name
    z.nativeEnum(GermanStateAbbreviation), // Accept state abbreviation
  ])
  .transform((state) => {
    if (state in GermanStateAbbreviation) {
      return state;
    }
    return GermanStateAbbreviation[
      GermanState[
        state as keyof typeof GermanState
      ] as keyof typeof GermanStateAbbreviation
    ];
  });
