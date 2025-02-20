import { z } from "zod";

export enum Continents {
  Africa = "Africa",
  Asia = "Asia",
  Europe = "Europe",
  NorthAmerica = "North America",
  SouthAmerica = "South America",
  Oceania = "Oceania",
  Antarctica = "Antarctica",
}

export const continentNames = [
  Continents.Africa,
  Continents.Asia,
  Continents.Europe,
  Continents.NorthAmerica,
  Continents.SouthAmerica,
  Continents.Oceania,
  Continents.Antarctica,
] as const;

export const continentsOptions = [
  { label: "Africa", value: Continents.Africa },
  { label: "Asia", value: Continents.Asia },
  { label: "Europe", value: Continents.Europe },
  { label: "North America", value: Continents.NorthAmerica },
  { label: "South America", value: Continents.SouthAmerica },
  { label: "Oceania", value: Continents.Oceania },
  { label: "Antarctica", value: Continents.Antarctica },
];

export const ContinentSchema = z.enum(continentNames);
