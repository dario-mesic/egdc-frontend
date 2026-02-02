import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { metadataSchema } from "@/app/case-studies/(with-sidebar)/upload/_lib/schemas/caseStudy";

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

  const backendRes = await fetch(TARGET, {
    method: "POST",
    body: forward,
  });

  const text = await backendRes.text();

  if (backendRes.ok) {
    revalidatePath("/case-studies");
  }

  return new NextResponse(text, {
    status: backendRes.status,
    headers: {
      "content-type":
        backendRes.headers.get("content-type") ?? "application/json",
    },
  });
}
