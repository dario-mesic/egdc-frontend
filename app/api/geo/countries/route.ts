import { NextResponse } from "next/server";
import { getCountries } from "@countrystatecity/countries";

type CountryItem = { code: string; label: string; iso3?: string };

export async function GET() {
  const raw = await getCountries();

  const countries: CountryItem[] = (raw ?? [])
    .map((c) => {
      const row = c as { iso2?: string; iso3?: string; name?: string };
      return {
        code: (row.iso2 ?? "").toUpperCase(),
        label: (row.name ?? "").trim(),
        iso3: row.iso3 ? String(row.iso3).toUpperCase() : undefined,
      };
    })
    .filter((c) => c.code.length === 2 && c.label);

  countries.sort((a, b) => a.label.localeCompare(b.label));

  return NextResponse.json({ countries });
}
