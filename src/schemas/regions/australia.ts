import { z } from "zod";

export enum AustraliaState {
  NewSouthWales = "New South Wales",
  Victoria = "Victoria",
  Queensland = "Queensland",
  SouthAustralia = "South Australia",
  WesternAustralia = "Western Australia",
  Tasmania = "Tasmania",
  AustralianCapitalTerritory = "Australian Capital Territory",
  NorthernTerritory = "Northern Territory",
}

export enum AustraliaStateAbbreviation {
  NewSouthWales = "NSW",
  Victoria = "VIC",
  Queensland = "QLD",
  SouthAustralia = "SA",
  WesternAustralia = "WA",
  Tasmania = "TAS",
  AustralianCapitalTerritory = "ACT",
  NorthernTerritory = "NT",
}

export const AustraliaStateSchema = z
  .union([
    z.nativeEnum(AustraliaState), // Accept full state name
    z.nativeEnum(AustraliaStateAbbreviation), // Accept state abbreviation
  ])
  .transform((state) => {
    if (state in AustraliaStateAbbreviation) {
      return AustraliaStateAbbreviation[
        state as keyof typeof AustraliaStateAbbreviation
      ];
    }
    return AustraliaStateAbbreviation[
      AustraliaState[
        state as keyof typeof AustraliaState
      ] as keyof typeof AustraliaStateAbbreviation
    ];
  });
