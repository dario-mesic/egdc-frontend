import { NextResponse } from "next/server";

export const runtime = "nodejs";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const LOGIN_URL = `${API_BASE_URL}/api/v1/login/access-token`;

type LoginBody = { username: string; password: string };

export async function POST(req: Request) {
  let body: LoginBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { username, password } = body;
  if (
    !username ||
    typeof username !== "string" ||
    !password ||
    typeof password !== "string"
  ) {
    return NextResponse.json(
      { error: "username and password are required" },
      { status: 400 },
    );
  }

  const params = new URLSearchParams();
  params.set("grant_type", "password");
  params.set("username", username.trim());
  params.set("password", password);

  try {
    const res = await fetch(LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: params.toString(),
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
                .join(", ") || "Login failed"
            : "Login failed";
      return NextResponse.json({ error: message }, { status: res.status });
    }

    if (!data?.access_token) {
      return NextResponse.json(
        { error: "Invalid response from auth server" },
        { status: 502 },
      );
    }

    const role =
      data.role &&
      ["custodian", "data_owner", "admin"].includes(
        String(data.role).toLowerCase(),
      )
        ? (String(data.role).toLowerCase() as
            | "custodian"
            | "data_owner"
            | "admin")
        : undefined;

    return NextResponse.json({
      access_token: data.access_token,
      token_type: data.token_type ?? "bearer",
      ...(role && { role }),
    });
  } catch (e) {
    console.error("Login proxy error:", e);
    return NextResponse.json(
      { error: "Unable to reach auth server" },
      { status: 502 },
    );
  }
}
