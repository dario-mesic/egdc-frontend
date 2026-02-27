import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import axios from "axios";

export const runtime = "nodejs";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

function target(id: string) {
  return `${API_BASE_URL}/api/v1/case-studies/${id}/`;
}

function requireAuth(req: Request) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return {
      error: NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 },
      ),
    };
  }
  return { auth } as const;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const { auth } = authResult;

  try {
    const res = await axios.get(target(id), {
      headers: { Authorization: auth, Accept: "application/json" },
      validateStatus: () => true,
      responseType: "json",
    });
    return NextResponse.json(res.data, { status: res.status });
  } catch (e) {
    console.error("Case study GET proxy error:", e);
    return NextResponse.json(
      { error: "Failed to reach backend" },
      { status: 502 },
    );
  }
}

export async function PUT(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const { auth } = authResult;

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Content-Type must be multipart/form-data" },
      { status: 400 },
    );
  }

  try {
    const chunks: Buffer[] = [];
    const reader = req.body!.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const len = value.byteLength;
        const copy = Buffer.allocUnsafe(len);
        for (let i = 0; i < len; i++) copy[i] = value[i];
        chunks.push(copy);
      }
    } finally {
      reader.releaseLock();
    }
    const bodyCopy = Buffer.concat(chunks);
    const backendUrl = target(id);
    const backendRes = await axios.put(backendUrl, bodyCopy, {
      headers: {
        Authorization: auth,
        Accept: "application/json",
        "Content-Type": contentType,
      },
      validateStatus: () => true,
      responseType: "text",
      transformResponse: (r) => r,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
    if (backendRes.status >= 200 && backendRes.status < 300) {
      revalidatePath("/case-studies");
      revalidatePath("/case-studies/my");
    }
    return new NextResponse(backendRes.data as string, {
      status: backendRes.status,
      headers: {
        "content-type":
          (backendRes.headers["content-type"] as string) ?? "application/json",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const cause = e instanceof Error && e.cause ? String(e.cause) : undefined;
    console.error("Case study PUT proxy error:", e);
    return NextResponse.json(
      {
        error: "Failed to reach backend",
        detail: message,
        ...(cause && { cause }),
        backendUrl: target(id),
      },
      { status: 502 },
    );
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const { auth } = authResult;

  try {
    const res = await axios.delete(target(id), {
      headers: { Authorization: auth, Accept: "application/json" },
      validateStatus: () => true,
      responseType: "text",
      transformResponse: (r) => r,
    });
    if (res.status >= 200 && res.status < 300) {
      try {
        revalidatePath("/case-studies");
        revalidatePath("/case-studies/my");
      } catch (revalidateErr) {
        console.warn(
          "Case study DELETE revalidatePath error (continuing):",
          revalidateErr,
        );
      }
    }
    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    const body =
      typeof res.data === "string" && res.data !== "" ? res.data : "{}";
    return new NextResponse(body, {
      status: res.status,
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    const err = e as Error & {
      response?: unknown;
      request?: unknown;
      code?: string;
    };
    const detail = err?.message ?? String(e);
    const code = err?.code;
    console.error("Case study DELETE proxy error:", detail);
    console.error("Case study DELETE proxy error (detail):", {
      name: err?.name,
      message: err?.message,
      stack: err?.stack,
      code: err?.code,
      ...(err?.response != null && { response: err.response }),
      ...(err?.request != null && { request: "[present]" }),
    });
    return NextResponse.json(
      {
        error: "Failed to reach backend",
        detail,
        ...(code && { code }),
      },
      { status: 502 },
    );
  }
}
