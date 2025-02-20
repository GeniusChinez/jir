import { z } from "zod";

export enum ItalianRegion {
  Abruzzo = "Abruzzo",
  AostaValley = "Aosta Valley",
  Apulia = "Apulia",
  Basilicata = "Basilicata",
  Calabria = "Calabria",
  Campania = "Campania",
  EmiliaRomagna = "Emilia-Romagna",
  FriuliVeneziaGiulia = "Friuli Venezia Giulia",
  Lazio = "Lazio",
  Liguria = "Liguria",
  Lombardy = "Lombardy",
  Marche = "Marche",
  Molise = "Molise",
  Piedmont = "Piedmont",
  Sardinia = "Sardinia",
  Sicily = "Sicily",
  TrentinoSouthTyrol = "Trentino-South Tyrol",
  Tuscany = "Tuscany",
  Umbria = "Umbria",
  Veneto = "Veneto",
}

export const ItalianRegionAbbreviation = {
  Abruzzo: "AB",
  AostaValley: "AO",
  Apulia: "PU",
  Basilicata: "BA",
  Calabria: "CL",
  Campania: "CP",
  EmiliaRomagna: "ER",
  FriuliVeneziaGiulia: "FVG",
  Lazio: "LA",
  Liguria: "LI",
  Lombardy: "LO",
  Marche: "MC",
  Molise: "MO",
  Piedmont: "PI",
  Sardinia: "SR",
  Sicily: "SI",
  TrentinoSouthTyrol: "TN",
  Tuscany: "TU",
  Umbria: "UM",
  Veneto: "VE",
};

export const ItalianRegionSchema = z
  .union([z.nativeEnum(ItalianRegion), z.nativeEnum(ItalianRegionAbbreviation)])
  .transform((region) => {
    if (region in ItalianRegionAbbreviation) {
      // return ItalianRegionAbbreviation[region];
    }
    return ItalianRegionAbbreviation[
      ItalianRegion[
        region as keyof typeof ItalianRegion
      ] as keyof typeof ItalianRegionAbbreviation
    ];
  });
