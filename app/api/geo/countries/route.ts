import { NextResponse } from "next/server";
import { getCountries } from "@countrystatecity/countries";

type CountryItem = { code: string; label: string };

export async function GET() {
  const raw = await getCountries();

  const countries: CountryItem[] = (raw ?? [])
    .map((c) => ({
      code: (c.iso2 ?? "").toUpperCase(),
      label: (c.name ?? "").trim(),
    }))
    .filter((c) => c.code.length === 2 && c.label);

  countries.sort((a, b) => a.label.localeCompare(b.label));

  return NextResponse.json({ countries });
}
