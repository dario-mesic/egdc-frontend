import { NextResponse } from "next/server";
import { getAllCitiesOfCountry } from "@countrystatecity/countries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const country = (searchParams.get("country") ?? "").trim().toUpperCase();

  if (country.length !== 2) {
    return NextResponse.json({ cities: [] }, { status: 400 });
  }

  const raw = await getAllCitiesOfCountry(country);

  const cities = (raw ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    countryCode: c.country_code,
    stateCode: c.state_code,
  }));

  return NextResponse.json({ cities });
}
