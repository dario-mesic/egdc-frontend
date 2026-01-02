import { iso3ToIso2, iso2CountryName } from "./iso";

export type AddressLike = {
  post_name?: string | null;
  admin_unit_l1?: string | null;
};

export type CompactLocation = {
  key: string;
  city: string;
  iso2: string | null;
};

export function uniqueFlagIso2s(addresses?: AddressLike[]): string[] {
  const seen = new Set<string>();
  const flags: string[] = [];

  (addresses ?? []).forEach((a) => {
    const iso2 = iso3ToIso2(a.admin_unit_l1 ?? null);
    if (!iso2) return;
    if (seen.has(iso2)) return;
    seen.add(iso2);
    flags.push(iso2);
  });

  return flags;
}

export function firstFlagIso2(addresses?: AddressLike[]): string | null {
  for (const a of addresses ?? []) {
    const iso2 = iso3ToIso2(a.admin_unit_l1 ?? null);
    if (iso2) return iso2;
  }
  return null;
}

export function addressLabel(a: AddressLike) {
  const city = a.post_name?.trim();
  const iso2 = iso3ToIso2(a.admin_unit_l1 ?? null);
  const country = iso2CountryName(iso2)?.trim();

  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (country) return country;
  return null;
}

export function uniqueLocations(addresses?: AddressLike[]) {
  const out: { key: string; label: string; iso2: string | null }[] = [];
  const seen = new Set<string>();

  (addresses ?? []).forEach((a) => {
    const label = addressLabel(a);
    if (!label) return;

    const iso2 = iso3ToIso2(a.admin_unit_l1 ?? null);
    const key = `${label}__${iso2 ?? ""}`;

    if (seen.has(key)) return;
    seen.add(key);

    out.push({ key, label, iso2 });
  });

  return out;
}
export function compactLocations(
  addresses?: {
    post_name?: string | null;
    admin_unit_l1?: string | null;
  }[]
): CompactLocation[] {
  const seen = new Set<string>();
  const out: CompactLocation[] = [];

  (addresses ?? []).forEach((a) => {
    const city = a.post_name?.trim();
    if (!city) return;

    const iso2 = iso3ToIso2(a.admin_unit_l1 ?? null);
    const key = `${city}__${iso2 ?? ""}`;

    if (seen.has(key)) return;
    seen.add(key);

    out.push({ key, city, iso2 });
  });

  return out;
}
