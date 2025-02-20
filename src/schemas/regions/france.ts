import { z } from "zod";

export enum FrenchRegion {
  AuvergneRhôneAlpes = "Auvergne-Rhône-Alpes",
  BourgogneFrancheComté = "Bourgogne-Franche-Comté",
  Bretagne = "Bretagne",
  CentreValDeLoire = "Centre-Val de Loire",
  Corse = "Corse",
  GrandEst = "Grand Est",
  HautsDeFrance = "Hauts-de-France",
  ÎleDeFrance = "Île-de-France",
  Normandie = "Normandie",
  NouvelleAquitaine = "Nouvelle-Aquitaine",
  Occitanie = "Occitanie",
  PaysDeLaLoire = "Pays de la Loire",
  ProvenceAlpesCôteDAzur = "Provence-Alpes-Côte d'Azur",
  Guadeloupe = "Guadeloupe",
  Martinique = "Martinique",
  Guyane = "Guyane",
  LaRéunion = "La Réunion",
  Mayotte = "Mayotte",
}

export enum FrenchRegionAbbreviation {
  AuvergneRhôneAlpes = "ARA",
  BourgogneFrancheComté = "BFC",
  Bretagne = "BRE",
  CentreValDeLoire = "CVL",
  Corse = "COR",
  GrandEst = "GES",
  HautsDeFrance = "HDF",
  ÎleDeFrance = "IDF",
  Normandie = "NOR",
  NouvelleAquitaine = "NAQ",
  Occitanie = "OCC",
  PaysDeLaLoire = "PDL",
  ProvenceAlpesCôteDAzur = "PAC",
  Guadeloupe = "GUA",
  Martinique = "MTQ",
  Guyane = "GUY",
  LaRéunion = "REU",
  Mayotte = "MAY",
}

export const FrenchRegionSchema = z
  .union([
    z.nativeEnum(FrenchRegion), // Accept full region name
    z.nativeEnum(FrenchRegionAbbreviation), // Accept region abbreviation
  ])
  .transform((region) => {
    if (region in FrenchRegionAbbreviation) {
      return region;
    }
    return FrenchRegionAbbreviation[
      FrenchRegion[
        region as keyof typeof FrenchRegion
      ] as keyof typeof FrenchRegionAbbreviation
    ];
  });
