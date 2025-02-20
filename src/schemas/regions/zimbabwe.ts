import { z } from "zod";

export enum ZimbabweanProvince {
  Bulawayo = "Bulawayo",
  Harare = "Harare",
  Manicaland = "Manicaland",
  MashonalandCentral = "Mashonaland Central",
  MashonalandEast = "Mashonaland East",
  MashonalandWest = "Mashonaland West",
  Masvingo = "Masvingo",
  MatabelelandNorth = "Matabeleland North",
  MatabelelandSouth = "Matabeleland South",
  Midlands = "Midlands",
}

export const ZimbabweanProvinceSchema = z.nativeEnum(ZimbabweanProvince, {
  message: "Invalid Zimbabwean Province",
});
