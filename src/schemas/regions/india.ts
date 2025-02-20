import { z } from "zod";

export enum IndianState {
  AndhraPradesh = "Andhra Pradesh",
  ArunachalPradesh = "Arunachal Pradesh",
  Assam = "Assam",
  Bihar = "Bihar",
  Chhattisgarh = "Chhattisgarh",
  Goa = "Goa",
  Gujarat = "Gujarat",
  Haryana = "Haryana",
  HimachalPradesh = "Himachal Pradesh",
  Jharkhand = "Jharkhand",
  Karnataka = "Karnataka",
  Kerala = "Kerala",
  MadhyaPradesh = "Madhya Pradesh",
  Maharashtra = "Maharashtra",
  Manipur = "Manipur",
  Meghalaya = "Meghalaya",
  Mizoram = "Mizoram",
  Nagaland = "Nagaland",
  Odisha = "Odisha",
  Punjab = "Punjab",
  Rajasthan = "Rajasthan",
  Sikkim = "Sikkim",
  TamilNadu = "Tamil Nadu",
  Telangana = "Telangana",
  Tripura = "Tripura",
  UttarPradesh = "Uttar Pradesh",
  Uttarakhand = "Uttarakhand",
  WestBengal = "West Bengal",
}

export enum IndianStateAbbreviation {
  AndhraPradesh = "AP",
  ArunachalPradesh = "AR",
  Assam = "AS",
  Bihar = "BR",
  Chhattisgarh = "CT",
  Goa = "GA",
  Gujarat = "GJ",
  Haryana = "HR",
  HimachalPradesh = "HP",
  Jharkhand = "JH",
  Karnataka = "KA",
  Kerala = "KL",
  MadhyaPradesh = "MP",
  Maharashtra = "MH",
  Manipur = "MN",
  Meghalaya = "ML",
  Mizoram = "MZ",
  Nagaland = "NL",
  Odisha = "OD",
  Punjab = "PB",
  Rajasthan = "RJ",
  Sikkim = "SK",
  TamilNadu = "TN",
  Telangana = "TG",
  Tripura = "TR",
  UttarPradesh = "UP",
  Uttarakhand = "UK",
  WestBengal = "WB",
}

export const IndianStateSchema = z
  .union([
    z.nativeEnum(IndianState), // Accept full state name
    z.nativeEnum(IndianStateAbbreviation), // Accept state abbreviation
  ])
  .transform((state) => {
    if (state in IndianStateAbbreviation) {
      return IndianStateAbbreviation[
        state as keyof typeof IndianStateAbbreviation
      ];
    }
    return IndianStateAbbreviation[
      IndianState[
        state as keyof typeof IndianState
      ] as keyof typeof IndianStateAbbreviation
    ];
  });
