import { NextResponse } from "next/server";

export const runtime = "nodejs";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const TARGET = `${API_BASE_URL}/api/v1/users/me/case-studies`;

export async function GET(req: Request) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 },
    );
  }

  const token = auth.slice(7);
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");
  const query = new URLSearchParams();
  if (page != null) query.set("page", page);
  if (limit != null) query.set("limit", limit);
  const qs = query.toString();
  const url = qs ? `${TARGET}?${qs}` : TARGET;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        typeof data?.detail === "string"
          ? data.detail
          : Array.isArray(data?.detail)
            ? data.detail.map((d: { msg?: string }) => d?.msg).filter(Boolean).join(", ") || "Request failed"
            : "Request failed";
      return NextResponse.json(
        { error: message },
        { status: res.status },
      );
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("My case studies proxy error:", e);
    return NextResponse.json(
      { error: "Unable to reach server" },
      { status: 502 },
    );
  }
}
