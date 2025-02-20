import { z } from "zod";

export enum PolishVoivodeship {
  GreaterPoland = "Greater Poland (Wielkopolskie)",
  KuyavianPomeranian = "Kuyavian-Pomeranian (Kujawsko-Pomorskie)",
  Lublin = "Lublin",
  Lubusz = "Lubusz (Lubuskie)",
  Lodz = "Łódź (Lodzkie)",
  LowerSilesian = "Lower Silesian (Dolnośląskie)",
  LesserPoland = "Lesser Poland (Małopolskie)",
  Masovian = "Masovian (Mazowieckie)",
  Opole = "Opole",
  Podlaskie = "Podlaskie",
  Pomeranian = "Pomeranian (Pomorskie)",
  Silesian = "Silesian (Śląskie)",
  Subcarpathian = "Subcarpathian (Podkarpackie)",
  WarmianMasurian = "Warmian-Masurian (Warmińsko-Mazurskie)",
  WestPomeranian = "West Pomeranian (Zachodniopomorskie)",
  Swietokrzyskie = "Świętokrzyskie",
}

export const PolishVoivodeshipAbbreviation = {
  GreaterPoland: "WPN",
  KuyavianPomeranian: "KP",
  Lublin: "LB",
  Lubusz: "LB",
  Lodz: "LD",
  LowerSilesian: "DS",
  LesserPoland: "MP",
  Masovian: "MZ",
  Opole: "OP",
  Podlaskie: "PD",
  Pomeranian: "PM",
  Silesian: "SL",
  Subcarpathian: "PK",
  WarmianMasurian: "WM",
  WestPomeranian: "ZP",
  Swietokrzyskie: "SWK",
} as const;

export const PolishVoivodeshipSchema = z
  .union([
    z.nativeEnum(PolishVoivodeship),
    z.nativeEnum(PolishVoivodeshipAbbreviation),
  ])
  .transform((voivodeship) => {
    if (voivodeship in PolishVoivodeshipAbbreviation) {
      // return PolishVoivodeshipAbbreviation[voivodeship];
    }
    return PolishVoivodeshipAbbreviation[
      PolishVoivodeship[
        voivodeship as keyof typeof PolishVoivodeship
      ] as keyof typeof PolishVoivodeshipAbbreviation
    ];
  });
