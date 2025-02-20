/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";

export enum USState {
  Alabama = "Alabama",
  Alaska = "Alaska",
  Arizona = "Arizona",
  Arkansas = "Arkansas",
  California = "California",
  Colorado = "Colorado",
  Connecticut = "Connecticut",
  Delaware = "Delaware",
  Florida = "Florida",
  Georgia = "Georgia",
  Hawaii = "Hawaii",
  Idaho = "Idaho",
  Illinois = "Illinois",
  Indiana = "Indiana",
  Iowa = "Iowa",
  Kansas = "Kansas",
  Kentucky = "Kentucky",
  Louisiana = "Louisiana",
  Maine = "Maine",
  Maryland = "Maryland",
  Massachusetts = "Massachusetts",
  Michigan = "Michigan",
  Minnesota = "Minnesota",
  Mississippi = "Mississippi",
  Missouri = "Missouri",
  Montana = "Montana",
  Nebraska = "Nebraska",
  Nevada = "Nevada",
  NewHampshire = "New Hampshire",
  NewJersey = "New Jersey",
  NewMexico = "New Mexico",
  NewYork = "New York",
  NorthCarolina = "North Carolina",
  NorthDakota = "North Dakota",
  Ohio = "Ohio",
  Oklahoma = "Oklahoma",
  Oregon = "Oregon",
  Pennsylvania = "Pennsylvania",
  RhodeIsland = "Rhode Island",
  SouthCarolina = "South Carolina",
  SouthDakota = "South Dakota",
  Tennessee = "Tennessee",
  Texas = "Texas",
  Utah = "Utah",
  Vermont = "Vermont",
  Virginia = "Virginia",
  Washington = "Washington",
  WestVirginia = "West Virginia",
  Wisconsin = "Wisconsin",
  Wyoming = "Wyoming",
}

export enum USStateAbbreviation {
  AL = "AL",
  AK = "AK",
  AZ = "AZ",
  AR = "AR",
  CA = "CA",
  CO = "CO",
  CT = "CT",
  DE = "DE",
  FL = "FL",
  GA = "GA",
  HI = "HI",
  ID = "ID",
  IL = "IL",
  IN = "IN",
  IA = "IA",
  KS = "KS",
  KY = "KY",
  LA = "LA",
  ME = "ME",
  MD = "MD",
  MA = "MA",
  MI = "MI",
  MN = "MN",
  MS = "MS",
  MO = "MO",
  MT = "MT",
  NE = "NE",
  NV = "NV",
  NH = "NH",
  NJ = "NJ",
  NM = "NM",
  NY = "NY",
  NC = "NC",
  ND = "ND",
  OH = "OH",
  OK = "OK",
  OR = "OR",
  PA = "PA",
  RI = "RI",
  SC = "SC",
  SD = "SD",
  TN = "TN",
  TX = "TX",
  UT = "UT",
  VT = "VT",
  VA = "VA",
  WA = "WA",
  WV = "WV",
  WI = "WI",
  WY = "WY",
}

// Mapping for full state name to abbreviation
const stateNameToAbbreviation: Record<USState, USStateAbbreviation> = {
  [USState.Alabama]: USStateAbbreviation.AL,
  [USState.Alaska]: USStateAbbreviation.AK,
  [USState.Arizona]: USStateAbbreviation.AZ,
  [USState.Arkansas]: USStateAbbreviation.AR,
  [USState.California]: USStateAbbreviation.CA,
  [USState.Colorado]: USStateAbbreviation.CO,
  [USState.Connecticut]: USStateAbbreviation.CT,
  [USState.Delaware]: USStateAbbreviation.DE,
  [USState.Florida]: USStateAbbreviation.FL,
  [USState.Georgia]: USStateAbbreviation.GA,
  [USState.Hawaii]: USStateAbbreviation.HI,
  [USState.Idaho]: USStateAbbreviation.ID,
  [USState.Illinois]: USStateAbbreviation.IL,
  [USState.Indiana]: USStateAbbreviation.IN,
  [USState.Iowa]: USStateAbbreviation.IA,
  [USState.Kansas]: USStateAbbreviation.KS,
  [USState.Kentucky]: USStateAbbreviation.KY,
  [USState.Louisiana]: USStateAbbreviation.LA,
  [USState.Maine]: USStateAbbreviation.ME,
  [USState.Maryland]: USStateAbbreviation.MD,
  [USState.Massachusetts]: USStateAbbreviation.MA,
  [USState.Michigan]: USStateAbbreviation.MI,
  [USState.Minnesota]: USStateAbbreviation.MN,
  [USState.Mississippi]: USStateAbbreviation.MS,
  [USState.Missouri]: USStateAbbreviation.MO,
  [USState.Montana]: USStateAbbreviation.MT,
  [USState.Nebraska]: USStateAbbreviation.NE,
  [USState.Nevada]: USStateAbbreviation.NV,
  [USState.NewHampshire]: USStateAbbreviation.NH,
  [USState.NewJersey]: USStateAbbreviation.NJ,
  [USState.NewMexico]: USStateAbbreviation.NM,
  [USState.NewYork]: USStateAbbreviation.NY,
  [USState.NorthCarolina]: USStateAbbreviation.NC,
  [USState.NorthDakota]: USStateAbbreviation.ND,
  [USState.Ohio]: USStateAbbreviation.OH,
  [USState.Oklahoma]: USStateAbbreviation.OK,
  [USState.Oregon]: USStateAbbreviation.OR,
  [USState.Pennsylvania]: USStateAbbreviation.PA,
  [USState.RhodeIsland]: USStateAbbreviation.RI,
  [USState.SouthCarolina]: USStateAbbreviation.SC,
  [USState.SouthDakota]: USStateAbbreviation.SD,
  [USState.Tennessee]: USStateAbbreviation.TN,
  [USState.Texas]: USStateAbbreviation.TX,
  [USState.Utah]: USStateAbbreviation.UT,
  [USState.Vermont]: USStateAbbreviation.VT,
  [USState.Virginia]: USStateAbbreviation.VA,
  [USState.Washington]: USStateAbbreviation.WA,
  [USState.WestVirginia]: USStateAbbreviation.WV,
  [USState.Wisconsin]: USStateAbbreviation.WI,
  [USState.Wyoming]: USStateAbbreviation.WY,
};

// Zod schema that accepts both full state names or abbreviations, and transforms the result to the abbreviation
export const USStateSchema = z
  .union([
    z.nativeEnum(USState), // Accept full state name
    z.nativeEnum(USStateAbbreviation), // Accept state abbreviation
  ])
  .transform((value) => {
    if (Object.values(USState).includes(value as any)) {
      return stateNameToAbbreviation[value as USState];
    }
    return value; // Return abbreviation if it's already an abbreviation
  });
