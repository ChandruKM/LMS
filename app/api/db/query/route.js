import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8081/api";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table") || "employees";

    const res = await fetch(`${BACKEND_URL}/db/query?table=${encodeURIComponent(table)}`, {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    const errData = await res.json().catch(() => ({}));
    return NextResponse.json(
      { success: false, error: errData.error || `Backend HTTP ${res.status}` },
      { status: res.status }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/db/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
