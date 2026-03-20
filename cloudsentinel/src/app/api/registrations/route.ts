import { NextResponse } from "next/server";
import { listRegistrations } from "@/lib/db";

export async function GET() {
  try {
    const registrations = await listRegistrations();
    return NextResponse.json(registrations);
  } catch (error) {
    console.error("[API] Failed to list registrations:", error);
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 });
  }
}
