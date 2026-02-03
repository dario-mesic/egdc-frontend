import { NextResponse } from "next/server";
import {
  getAllCitiesOfCountry,
  isValidCountryCode,
} from "@countrystatecity/countries";

const ISO2_ALIASES: Record<string, string> = {
  EL: "GR",
  UK: "GB",
};

async function normalizeIso2(code: string): Promise<string | null> {
  const upper = code.trim().toUpperCase();

  if (upper.length === 2 && (await isValidCountryCode(upper))) {
    return upper;
  }

  const aliased = ISO2_ALIASES[upper];
  if (aliased && (await isValidCountryCode(aliased))) {
    return aliased;
  }

  return null;
}
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawCountry = searchParams.get("country") ?? "";

  const country = await normalizeIso2(rawCountry);

  if (!country) {
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
