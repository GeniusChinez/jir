/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";

export enum SouthAfricanProvince {
  EasternCape = "Eastern Cape",
  FreeState = "Free State",
  Gauteng = "Gauteng",
  KwaZuluNatal = "KwaZulu-Natal",
  Limpopo = "Limpopo",
  Mpumalanga = "Mpumalanga",
  NorthernCape = "Northern Cape",
  NorthWest = "North West",
  WesternCape = "Western Cape",
}

export enum SouthAfricanProvinceAbbreviation {
  EC = "EC",
  FS = "FS",
  GT = "GT",
  KZN = "KZN",
  LP = "LP",
  MP = "MP",
  NC = "NC",
  NW = "NW",
  WC = "WC",
}

// Mapping for full province names to abbreviations
const provinceNameToAbbreviation: Record<
  SouthAfricanProvince,
  SouthAfricanProvinceAbbreviation
> = {
  [SouthAfricanProvince.EasternCape]: SouthAfricanProvinceAbbreviation.EC,
  [SouthAfricanProvince.FreeState]: SouthAfricanProvinceAbbreviation.FS,
  [SouthAfricanProvince.Gauteng]: SouthAfricanProvinceAbbreviation.GT,
  [SouthAfricanProvince.KwaZuluNatal]: SouthAfricanProvinceAbbreviation.KZN,
  [SouthAfricanProvince.Limpopo]: SouthAfricanProvinceAbbreviation.LP,
  [SouthAfricanProvince.Mpumalanga]: SouthAfricanProvinceAbbreviation.MP,
  [SouthAfricanProvince.NorthernCape]: SouthAfricanProvinceAbbreviation.NC,
  [SouthAfricanProvince.NorthWest]: SouthAfricanProvinceAbbreviation.NW,
  [SouthAfricanProvince.WesternCape]: SouthAfricanProvinceAbbreviation.WC,
};

// Zod schema that accepts both full province names or abbreviations and transforms to abbreviation
export const SouthAfricanProvinceSchema = z
  .union([
    z.nativeEnum(SouthAfricanProvince), // Accept full province name
    z.nativeEnum(SouthAfricanProvinceAbbreviation), // Accept province abbreviation
  ])
  .transform((value) => {
    if (Object.values(SouthAfricanProvince).includes(value as any)) {
      return provinceNameToAbbreviation[value as SouthAfricanProvince];
    }
    return value; // Return abbreviation if it's already an abbreviation
  });
