import { NextResponse } from "next/server";

export const runtime = "nodejs";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const TARGET = `${API_BASE_URL}/api/v1/case-studies/preview`;

export async function POST(req: Request) {
  const form = await req.formData();

  const backendRes = await fetch(TARGET, {
    method: "POST",
    body: form,
  });

  const contentType =
    backendRes.headers.get("content-type") ?? "application/json";

  const body = await backendRes.arrayBuffer();

  return new NextResponse(body, {
    status: backendRes.status,
    headers: { "content-type": contentType },
  });
}
