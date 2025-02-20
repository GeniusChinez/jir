import { z } from "zod";

export enum NigerianState {
  Abia = "Abia",
  Adamawa = "Adamawa",
  AkwaIbom = "Akwa Ibom",
  Anambra = "Anambra",
  Bauchi = "Bauchi",
  Bayelsa = "Bayelsa",
  Benue = "Benue",
  Borno = "Borno",
  CrossRiver = "Cross River",
  Delta = "Delta",
  Ebonyi = "Ebonyi",
  Edo = "Edo",
  Ekiti = "Ekiti",
  Enugu = "Enugu",
  Gombe = "Gombe",
  Imo = "Imo",
  Jigawa = "Jigawa",
  Kaduna = "Kaduna",
  Kano = "Kano",
  Katsina = "Katsina",
  Kebbi = "Kebbi",
  Kogi = "Kogi",
  Kwara = "Kwara",
  Lagos = "Lagos",
  Nasarawa = "Nasarawa",
  Niger = "Niger",
  Ogun = "Ogun",
  Ondo = "Ondo",
  Osun = "Osun",
  Oyo = "Oyo",
  Plateau = "Plateau",
  Rivers = "Rivers",
  Sokoto = "Sokoto",
  Taraba = "Taraba",
  Yobe = "Yobe",
  Zamfara = "Zamfara",
}

export enum NigerianStateAbbreviation {
  Abia = "AB",
  Adamawa = "AD",
  AkwaIbom = "AK",
  Anambra = "AN",
  Bauchi = "BA",
  Bayelsa = "BY",
  Benue = "BE",
  Borno = "BO",
  CrossRiver = "CR",
  Delta = "DE",
  Ebonyi = "EB",
  Edo = "ED",
  Ekiti = "EK",
  Enugu = "EN",
  Gombe = "GO",
  Imo = "IM",
  Jigawa = "JI",
  Kaduna = "KA",
  Kano = "KN",
  Katsina = "KT",
  Kebbi = "KE",
  Kogi = "KO",
  Kwara = "KW",
  Lagos = "LA",
  Nasarawa = "NA",
  Niger = "NI",
  Ogun = "OG",
  Ondo = "ON",
  Osun = "OS",
  Oyo = "OY",
  Plateau = "PL",
  Rivers = "RI",
  Sokoto = "SO",
  Taraba = "TA",
  Yobe = "YO",
  Zamfara = "ZA",
}

export const NigerianStateSchema = z
  .union([
    z.nativeEnum(NigerianState), // Accept full state name
    z.nativeEnum(NigerianStateAbbreviation), // Accept state abbreviation
  ])
  .transform((state) => {
    if (state in NigerianStateAbbreviation) {
      return state;
    }
    return NigerianStateAbbreviation[state as keyof typeof NigerianState];
  });
