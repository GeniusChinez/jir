import { z } from "zod";

export enum ZambianProvince {
  Central = "Central",
  Copperbelt = "Copperbelt",
  Eastern = "Eastern",
  Lusaka = "Lusaka",
  Muchinga = "Muchinga",
  Northern = "Northern",
  NorthWestern = "North-Western",
  Southern = "Southern",
  Western = "Western",
}

export const ZambianProvinceSchema = z.nativeEnum(ZambianProvince);
