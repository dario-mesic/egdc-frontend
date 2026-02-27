import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { metadataSchema } from "@/app/case-studies/(with-sidebar)/(protected)/upload/_lib/schemas/caseStudy";
import axios from "axios";

export const runtime = "nodejs";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const TARGET = `${API_BASE_URL}/api/v1/case-studies/`;

export async function POST(req: Request) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 },
    );
  }

  const form = await req.formData();

  const metadataRaw = form.get("metadata");
  if (typeof metadataRaw !== "string") {
    return NextResponse.json(
      { error: "metadata is required" },
      { status: 400 },
    );
  }

  let metadataJson: unknown;
  try {
    metadataJson = JSON.parse(metadataRaw);
  } catch {
    return NextResponse.json(
      { error: "metadata must be valid JSON" },
      { status: 400 },
    );
  }

  const isDraft =
    metadataJson &&
    typeof metadataJson === "object" &&
    (metadataJson as Record<string, unknown>).status === "draft";

  const metaParsed = isDraft
    ? (typeof metadataJson === "object" && metadataJson !== null
        ? { success: true as const, data: metadataJson as Record<string, unknown> }
        : { success: false as const, error: null })
    : metadataSchema.safeParse(metadataJson);

  if (!metaParsed.success) {
    return NextResponse.json(
      { error: "Invalid metadata", details: (metaParsed as any).error?.format?.() },
      { status: 422 },
    );
  }

  const file_methodology = form.get("file_methodology");
  const file_dataset = form.get("file_dataset");
  const file_logo = form.get("file_logo");
  const file_additional_document = form.get("file_additional_document");

  if (!isDraft) {
    if (!(file_methodology instanceof File)) {
      return NextResponse.json(
        { error: "file_methodology is required" },
        { status: 400 },
      );
    }
    if (!(file_dataset instanceof File)) {
      return NextResponse.json(
        { error: "file_dataset is required" },
        { status: 400 },
      );
    }
    if (!(file_logo instanceof File)) {
      return NextResponse.json(
        { error: "file_logo is required" },
        { status: 400 },
      );
    }
  }

  const forward = new FormData();
  if (isDraft) {
    form.forEach((value, key) => {
      if (value instanceof File) forward.append(key, value);
      else forward.append(key, value as string);
    });
    forward.set("metadata", JSON.stringify(metaParsed.data));
  } else {
    forward.append("metadata", JSON.stringify(metaParsed.data));
    forward.append("file_methodology", file_methodology as File);
    forward.append("file_dataset", file_dataset as File);
    forward.append("file_logo", file_logo as File);
    if (file_additional_document instanceof File) {
      forward.append("file_additional_document", file_additional_document);
    }
  }

  try {
    const backendRes = await axios.post(TARGET, forward, {
      headers: {
        Authorization: auth,
        Accept: "application/json",
      },
      validateStatus: () => true,
      responseType: "text",
      transformResponse: (r) => r,
    });

    if (backendRes.status >= 200 && backendRes.status < 300) {
      revalidatePath("/case-studies");
    }

    return new NextResponse(backendRes.data as string, {
      status: backendRes.status,
      headers: {
        "content-type":
          backendRes.headers["content-type"] ?? "application/json",
      },
    });
  } catch (e) {
    console.error("Case studies POST proxy error:", e);
    return NextResponse.json(
      { error: "Failed to reach backend" },
      { status: 502 },
    );
  }
}
