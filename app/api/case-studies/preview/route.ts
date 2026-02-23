import { NextResponse } from "next/server";
import axios from "axios";
export const runtime = "nodejs";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const TARGET = `${API_BASE_URL}/api/v1/case-studies/preview`;

export async function POST(req: Request) {
  const form = await req.formData();

  try {
    const backendRes = await axios.post(TARGET, form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "arraybuffer",
      validateStatus: () => true,
    });

    return new NextResponse(backendRes.data, {
      status: backendRes.status,
      headers: {
        "content-type":
          backendRes.headers["content-type"] ?? "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reach backend" },
      { status: 500 },
    );
  }
}
