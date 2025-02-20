import { z } from "zod";

export enum UKCountry {
  England = "England",
  Scotland = "Scotland",
  Wales = "Wales",
  NorthernIreland = "Northern Ireland",
}

export enum UKCountryAbbreviation {
  England = "ENG",
  Scotland = "SCO",
  Wales = "WAL",
  NorthernIreland = "NIR",
}

export const UKCountrySchema = z
  .union([
    z.nativeEnum(UKCountry), // Accept full country name
    z.nativeEnum(UKCountryAbbreviation), // Accept country abbreviation
  ])
  .transform((country) => {
    if (country in UKCountryAbbreviation) {
      return country;
    }
    return UKCountryAbbreviation[
      UKCountry[
        country as keyof typeof UKCountry
      ] as keyof typeof UKCountryAbbreviation
    ];
  });
