import countries from "@/data/countries.json";

export const ISO3_TO_ISO2: Record<string, string> = {
  AUT: "at",
  BEL: "be",
  BGR: "bg",
  HRV: "hr",
  CYP: "cy",
  CZE: "cz",
  DNK: "dk",
  EST: "ee",
  FIN: "fi",
  FRA: "fr",
  DEU: "de",
  GRC: "el",
  HUN: "hu",
  IRL: "ie",
  ITA: "it",
  LVA: "lv",
  LTU: "lt",
  LUX: "lu",
  MLT: "mt",
  NLD: "nl",
  POL: "pl",
  PRT: "pt",
  ROU: "ro",
  SVK: "sk",
  SVN: "si",
  ESP: "es",
  SWE: "se",

  CHE: "ch",
  ISL: "is",
  LIE: "li",
  NOR: "no",
  SRB: "rs",
  TUR: "tr",
  UKR: "ua",
  GBR: "uk",
};

export function iso3ToIso2(iso3?: string | null): string | null {
  if (!iso3) return null;
  const iso2 = ISO3_TO_ISO2[iso3.toUpperCase()];
  if (!iso2) return null;
  return iso2 in countries ? iso2 : null;
}

export function iso2CountryName(iso2?: string | null): string | null {
  if (!iso2) return null;
  return (countries as Record<string, string>)[iso2] ?? null;
}
