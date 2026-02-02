import { NextResponse } from "next/server";
import { createOrganizationSchema } from "@/app/case-studies/(with-sidebar)/upload/_lib/schemas/organization";

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
    website_url: parsed.data.website_url ? parsed.data.website_url : null,
    description: parsed.data.description ? parsed.data.description : null,
  };

  const backendRes = await fetch(TARGET, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await backendRes.text();
  return new NextResponse(text, {
    status: backendRes.status,
    headers: {
      "content-type":
        backendRes.headers.get("content-type") ?? "application/json",
    },
  });
}
