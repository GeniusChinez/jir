import { z } from "zod";

export enum ChinaProvince {
  Anhui = "Anhui",
  Beijing = "Beijing",
  Chongqing = "Chongqing",
  Fujian = "Fujian",
  Gansu = "Gansu",
  Guangdong = "Guangdong",
  Guizhou = "Guizhou",
  Hainan = "Hainan",
  Hebei = "Hebei",
  Heilongjiang = "Heilongjiang",
  Henan = "Henan",
  Hunan = "Hunan",
  Jiangsu = "Jiangsu",
  Jiangxi = "Jiangxi",
  Jilin = "Jilin",
  Liaoning = "Liaoning",
  Qinghai = "Qinghai",
  Shaanxi = "Shaanxi",
  Shandong = "Shandong",
  Shanxi = "Shanxi",
  Sichuan = "Sichuan",
  Taiwan = "Taiwan",
  Tianjin = "Tianjin",
  Xinjiang = "Xinjiang",
  Xizang = "Tibet",
  Yunnan = "Yunnan",
  Zhejiang = "Zhejiang",
}

export enum ChinaProvinceAbbreviation {
  Anhui = "AH",
  Beijing = "BJ",
  Chongqing = "CQ",
  Fujian = "FJ",
  Gansu = "GS",
  Guangdong = "GD",
  Guizhou = "GZ",
  Hainan = "HI",
  Hebei = "HE",
  Heilongjiang = "HL",
  Henan = "HA",
  Hunan = "HN",
  Jiangsu = "JS",
  Jiangxi = "JX",
  Jilin = "JL",
  Liaoning = "LN",
  Qinghai = "QH",
  Shaanxi = "SN",
  Shandong = "SD",
  Shanxi = "SX",
  Sichuan = "SC",
  Taiwan = "TW",
  Tianjin = "TJ",
  Xinjiang = "XJ",
  Xizang = "XZ",
  Yunnan = "YN",
  Zhejiang = "ZJ",
}

export const ChinaProvinceSchema = z
  .union([
    z.nativeEnum(ChinaProvince), // Accept full province name
    z.nativeEnum(ChinaProvinceAbbreviation), // Accept province abbreviation
  ])
  .transform((province) => {
    if (province in ChinaProvinceAbbreviation) {
      return ChinaProvinceAbbreviation[
        province as keyof typeof ChinaProvinceAbbreviation
      ];
    }
    return ChinaProvinceAbbreviation[
      ChinaProvince[
        province as keyof typeof ChinaProvince
      ] as keyof typeof ChinaProvinceAbbreviation
    ];
  });
