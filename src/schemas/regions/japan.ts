import { z } from "zod";

export enum JapanPrefecture {
  Hokkaido = "Hokkaido",
  Aomori = "Aomori",
  Iwate = "Iwate",
  Miyagi = "Miyagi",
  Akita = "Akita",
  Yamagata = "Yamagata",
  Fukushima = "Fukushima",
  Ibaraki = "Ibaraki",
  Tochigi = "Tochigi",
  Gunma = "Gunma",
  Saitama = "Saitama",
  Chiba = "Chiba",
  Tokyo = "Tokyo",
  Kanagawa = "Kanagawa",
  Niigata = "Niigata",
  Toyama = "Toyama",
  Ishikawa = "Ishikawa",
  Fukui = "Fukui",
  Yamanashi = "Yamanashi",
  Nagano = "Nagano",
  Gifu = "Gifu",
  Shizuoka = "Shizuoka",
  Aichi = "Aichi",
  Mie = "Mie",
  Shiga = "Shiga",
  Kyoto = "Kyoto",
  Osaka = "Osaka",
  Hyogo = "Hyogo",
  Nara = "Nara",
  Wakayama = "Wakayama",
  Tottori = "Tottori",
  Shimane = "Shimane",
  Okayama = "Okayama",
  Hiroshima = "Hiroshima",
  Yamaguchi = "Yamaguchi",
  Tokushima = "Tokushima",
  Kagawa = "Kagawa",
  Ehime = "Ehime",
  Kochi = "Kochi",
  Fukuoka = "Fukuoka",
  Saga = "Saga",
  Nagasaki = "Nagasaki",
  Kumamoto = "Kumamoto",
  Okinawa = "Okinawa",
}

export enum JapanPrefectureAbbreviation {
  Hokkaido = "01",
  Aomori = "02",
  Iwate = "03",
  Miyagi = "04",
  Akita = "05",
  Yamagata = "06",
  Fukushima = "07",
  Ibaraki = "08",
  Tochigi = "09",
  Gunma = "10",
  Saitama = "11",
  Chiba = "12",
  Tokyo = "13",
  Kanagawa = "14",
  Niigata = "15",
  Toyama = "16",
  Ishikawa = "17",
  Fukui = "18",
  Yamanashi = "19",
  Nagano = "20",
  Gifu = "21",
  Shizuoka = "22",
  Aichi = "23",
  Mie = "24",
  Shiga = "25",
  Kyoto = "26",
  Osaka = "27",
  Hyogo = "28",
  Nara = "29",
  Wakayama = "30",
  Tottori = "31",
  Shimane = "32",
  Okayama = "33",
  Hiroshima = "34",
  Yamaguchi = "35",
  Tokushima = "36",
  Kagawa = "37",
  Ehime = "38",
  Kochi = "39",
  Fukuoka = "40",
  Saga = "41",
  Nagasaki = "42",
  Kumamoto = "43",
  Okinawa = "44",
}

export const JapanPrefectureSchema = z
  .union([
    z.nativeEnum(JapanPrefecture), // Accept full prefecture name
    z.nativeEnum(JapanPrefectureAbbreviation), // Accept prefecture abbreviation
  ])
  .transform((prefecture) => {
    if (prefecture in JapanPrefectureAbbreviation) {
      return JapanPrefectureAbbreviation[
        prefecture as keyof typeof JapanPrefectureAbbreviation
      ];
    }
    return JapanPrefectureAbbreviation[
      JapanPrefecture[
        prefecture as keyof typeof JapanPrefecture
      ] as keyof typeof JapanPrefectureAbbreviation
    ];
  });
