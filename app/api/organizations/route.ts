import { NextResponse } from "next/server";
import { createOrganizationSchema } from "@/app/case-studies/(with-sidebar)/(protected)/upload/_lib/schemas/organization";
import axios from "axios";

export const runtime = "nodejs";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const TARGET = `${API_BASE_URL}/api/v1/organizations/`;

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);

  const parsed = createOrganizationSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid organization payload", details: parsed.error.format() },
      { status: 422 },
    );
  }

  const payload = {
    ...parsed.data,
    website_url: parsed.data.website_url || null,
    description: parsed.data.description || null,
  };

  try {
    const backendRes = await axios.post(TARGET, payload, {
      headers: { "Content-Type": "application/json" },
      validateStatus: () => true,
      responseType: "text",
      transformResponse: (r) => r,
    });

    return new NextResponse(backendRes.data as string, {
      status: backendRes.status,
      headers: {
        "content-type":
          backendRes.headers["content-type"] ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach backend" },
      { status: 500 },
    );
  }
}
