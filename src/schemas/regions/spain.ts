import { z } from "zod";

export enum SpanishCommunity {
  Andalusia = "Andalusia",
  Aragon = "Aragon",
  Asturias = "Asturias",
  BalearicIslands = "Balearic Islands",
  BasqueCountry = "Basque Country",
  CanaryIslands = "Canary Islands",
  Cantabria = "Cantabria",
  CastileAndLeon = "Castile and León",
  CastileLaMancha = "Castilla-La Mancha",
  Catalonia = "Catalonia",
  Extremadura = "Extremadura",
  Galicia = "Galicia",
  Madrid = "Madrid",
  Murcia = "Murcia",
  Navarre = "Navarre",
  LaRioja = "La Rioja",
  ValencianCommunity = "Valencian Community",
  Ceuta = "Ceuta",
  Melilla = "Melilla",
}

export const SpanishCommunityAbbreviation = {
  Andalusia: "AN",
  Aragon: "AR",
  Asturias: "AS",
  BalearicIslands: "IB",
  BasqueCountry: "PV",
  CanaryIslands: "CN",
  Cantabria: "CB",
  CastileAndLeon: "CL",
  CastileLaMancha: "CM",
  Catalonia: "CT",
  Extremadura: "EX",
  Galicia: "GA",
  Madrid: "MD",
  Murcia: "MU",
  Navarre: "NA",
  LaRioja: "RI",
  ValencianCommunity: "VC",
  Ceuta: "CE",
  Melilla: "ML",
} as const;

export const SpanishCommunitySchema = z
  .union([
    z.nativeEnum(SpanishCommunity),
    z.nativeEnum(SpanishCommunityAbbreviation),
  ])
  .transform((community) => {
    if (community in SpanishCommunityAbbreviation) {
      // return SpanishCommunityAbbreviation[community];
    }
    return SpanishCommunityAbbreviation[
      SpanishCommunity[
        community as keyof typeof SpanishCommunity
      ] as keyof typeof SpanishCommunityAbbreviation
    ];
  });
