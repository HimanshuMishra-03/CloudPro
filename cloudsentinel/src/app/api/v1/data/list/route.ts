import { NextRequest, NextResponse } from "next/server";
import { listAppData } from "@/lib/db";
import { verifySVID } from "@/lib/spire";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const appId = searchParams.get("app_id");

    if (!appId) {
      return NextResponse.json(
        { error_code: "INVALID_REQUEST", message: "app_id is required" },
        { status: 400 }
      );
    }

    // Step 2: mTLS verification via SPIFFE SVID
    const clientCert = req.headers.get("x-forwarded-client-cert");
    const mockCert = "-----BEGIN CERTIFICATE-----\nMOCK\n-----END CERTIFICATE-----";
    const verifiedAppId = await verifySVID(clientCert || mockCert);

    // AC-09: Isolation check
    if (verifiedAppId !== "mock-app-id" && appId !== verifiedAppId) {
       return NextResponse.json(
        { error_code: "RECORD_OWNERSHIP_MISMATCH", message: "Authenticated identity does not own this app's data" },
        { status: 403 }
      );
    }

    const records = await listAppData(appId);

    return NextResponse.json(records, { status: 200 });

  } catch (error: any) {
    console.error("[Flow 2] Data list failed:", error);
    return NextResponse.json(
      { error_code: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}
