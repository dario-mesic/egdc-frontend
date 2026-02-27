import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

function target(id: string) {
  return `${API_BASE_URL}/api/v1/case-studies/${id}/review`;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  let body: { status?: string; rejection_comment?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(target(id), {
      method: "PATCH",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        typeof data?.detail === "string"
          ? data.detail
          : Array.isArray(data?.detail)
            ? data.detail
                .map((d: { msg?: string }) => d?.msg)
                .filter(Boolean)
                .join(", ") || "Request failed"
            : data?.error ?? "Request failed";
      return NextResponse.json({ error: message }, { status: res.status });
    }

    try {
      revalidatePath("/case-studies");
      revalidatePath("/case-studies/my");
    } catch {
      // ignore
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("Case study review proxy error:", e);
    return NextResponse.json(
      { error: "Unable to reach server" },
      { status: 502 },
    );
  }
}
