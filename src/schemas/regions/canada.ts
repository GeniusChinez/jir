import { z } from "zod";

export enum CanadianProvince {
  Alberta = "Alberta",
  BritishColumbia = "British Columbia",
  Manitoba = "Manitoba",
  NewBrunswick = "New Brunswick",
  NewfoundlandLabrador = "Newfoundland and Labrador",
  NovaScotia = "Nova Scotia",
  Ontario = "Ontario",
  PrinceEdwardIsland = "Prince Edward Island",
  Quebec = "Quebec",
  Saskatchewan = "Saskatchewan",
}

export enum CanadianTerritory {
  NorthwestTerritories = "Northwest Territories",
  Nunavut = "Nunavut",
  Yukon = "Yukon",
}

export enum CanadianProvinceAbbreviation {
  Alberta = "AB",
  BritishColumbia = "BC",
  Manitoba = "MB",
  NewBrunswick = "NB",
  NewfoundlandLabrador = "NL",
  NovaScotia = "NS",
  Ontario = "ON",
  PrinceEdwardIsland = "PE",
  Quebec = "QC",
  Saskatchewan = "SK",
}

export enum CanadianTerritoryAbbreviation {
  NorthwestTerritories = "NT",
  Nunavut = "NU",
  Yukon = "YT",
}

export const CanadianProvinceOrTerritorySchema = z
  .union([
    z.nativeEnum(CanadianProvince), // Accept full province name
    z.nativeEnum(CanadianTerritory), // Accept full territory name
    z.nativeEnum(CanadianProvinceAbbreviation), // Accept province abbreviation
    z.nativeEnum(CanadianTerritoryAbbreviation), // Accept territory abbreviation
  ])
  .transform((provinceOrTerritory) => {
    if (provinceOrTerritory in CanadianProvinceAbbreviation) {
      return provinceOrTerritory;
    }
    if (provinceOrTerritory in CanadianTerritoryAbbreviation) {
      return provinceOrTerritory;
    }
    return (
      CanadianProvinceAbbreviation[
        provinceOrTerritory as keyof typeof CanadianProvince
      ] ||
      CanadianTerritoryAbbreviation[
        provinceOrTerritory as keyof typeof CanadianTerritory
      ]
    );
  });
