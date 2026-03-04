import { NextResponse } from "next/server";

export const runtime = "nodejs";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

function target(id: string) {
  return `${API_BASE_URL}/api/v1/users/${id}`;
}

type RouteContext = { params: Promise<{ id: string }> };

function requireAuth(req: Request) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return {
      error: NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 },
      ),
    } as const;
  }
  return { auth } as const;
}

export async function DELETE(req: Request, context: RouteContext) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const { auth } = authResult;

  const { id } = await context.params;

  try {
    const res = await fetch(target(id), {
      method: "DELETE",
      headers: {
        Authorization: auth,
        Accept: "application/json",
      },
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

    return NextResponse.json(data);
  } catch (e) {
    console.error("User DELETE proxy error:", e);
    return NextResponse.json(
      { error: "Unable to reach server" },
      { status: 502 },
    );
  }
}
