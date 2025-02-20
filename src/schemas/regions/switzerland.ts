import { z } from "zod";

export enum SwissCanton {
  Aargau = "Aargau",
  AppenzellAusserrhoden = "Appenzell Ausserrhoden",
  AppenzellInnerrhoden = "Appenzell Innerrhoden",
  BaselLandschaft = "Basel-Landschaft",
  BaselStadt = "Basel-Stadt",
  Bern = "Bern",
  Fribourg = "Fribourg",
  Geneva = "Geneva",
  Glarus = "Glarus",
  Grisons = "Grisons (Graubünden)",
  Jura = "Jura",
  Luzern = "Luzern (Lucerne)",
  Neuchatel = "Neuchâtel",
  Nidwalden = "Nidwalden",
  Obwalden = "Obwalden",
  Schaffhausen = "Schaffhausen",
  Schwyz = "Schwyz",
  Solothurn = "Solothurn",
  StGallen = "St. Gallen",
  Ticino = "Ticino",
  Thurgau = "Thurgau",
  Uri = "Uri",
  Valais = "Valais (Wallis)",
  Vaud = "Vaud (Vaud)",
  Zug = "Zug",
  Zurich = "Zurich",
}

export const SwissCantonAbbreviation = {
  Aargau: "AG",
  AppenzellAusserrhoden: "AR",
  AppenzellInnerrhoden: "AI",
  BaselLandschaft: "BL",
  BaselStadt: "BS",
  Bern: "BE",
  Fribourg: "FR",
  Geneva: "GE",
  Glarus: "GL",
  Grisons: "GR",
  Jura: "JU",
  Luzern: "LU",
  Neuchatel: "NE",
  Nidwalden: "NW",
  Obwalden: "OW",
  Schaffhausen: "SH",
  Schwyz: "SZ",
  Solothurn: "SO",
  StGallen: "SG",
  Ticino: "TI",
  Thurgau: "TG",
  Uri: "UR",
  Valais: "VS",
  Vaud: "VD",
  Zug: "ZG",
  Zurich: "ZH",
};

export const SwissCantonSchema = z
  .union([z.nativeEnum(SwissCanton), z.nativeEnum(SwissCantonAbbreviation)])
  .transform((canton) => {
    if (canton in SwissCantonAbbreviation) {
      // return SwissCantonAbbreviation[canton];
    }
    return SwissCantonAbbreviation[
      SwissCanton[
        canton as keyof typeof SwissCanton
      ] as keyof typeof SwissCantonAbbreviation
    ];
  });
