import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { metadataSchema } from "@/app/case-studies/(with-sidebar)/(protected)/upload/_lib/schemas/caseStudy";
import axios from "axios";

export const runtime = "nodejs";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const TARGET = `${API_BASE_URL}/api/v1/case-studies/`;

export async function POST(req: Request) {
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

  const metaParsed = metadataSchema.safeParse(metadataJson);
  if (!metaParsed.success) {
    return NextResponse.json(
      { error: "Invalid metadata", details: metaParsed.error.format() },
      { status: 422 },
    );
  }

  const file_methodology = form.get("file_methodology");
  const file_dataset = form.get("file_dataset");
  const file_logo = form.get("file_logo");

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

  const forward = new FormData();
  forward.append("metadata", JSON.stringify(metaParsed.data));
  forward.append("file_methodology", file_methodology);
  forward.append("file_dataset", file_dataset);
  forward.append("file_logo", file_logo);

  try {
    const backendRes = await axios.post(TARGET, forward, {
      headers: {
        "Content-Type": "multipart/form-data",
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
  } catch {
    return NextResponse.json(
      { error: "Failed to reach backend" },
      { status: 500 },
    );
  }
}
