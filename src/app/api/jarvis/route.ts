import { NextResponse } from "next/server";

const HEAD_IP = "34.69.30.127";
const HEAD_URL = `http://${HEAD_IP}:8000`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") || "status";

  try {
    const res = await fetch(`${HEAD_URL}/${path}`, {
      cache: 'no-store'
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Head Gateway unreachable" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") || "start_brain";

  try {
    const res = await fetch(`${HEAD_URL}/${path}`, {
      method: "POST",
      cache: 'no-store'
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Head Gateway unreachable" }, { status: 500 });
  }
}
