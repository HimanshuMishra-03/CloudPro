import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session: any = await getServerSession(authOptions);
  
  const connected = !!session?.accessToken;
  const isMock = process.env.MOCK_MODE === "true" && !connected;

  return NextResponse.json({
    connected: connected || isMock,
    method: connected ? "OAUTH" : (isMock ? "MOCK" : "NONE"),
    account: session?.user?.email || (isMock ? "mock-user" : null)
  });
}
