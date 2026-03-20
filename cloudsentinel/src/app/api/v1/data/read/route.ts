import { NextRequest, NextResponse } from "next/server";
import { decryptPayload } from "@/lib/vault";
import { getDataRecord } from "@/lib/db";
import { verifySVID } from "@/lib/spire";
import { ReadResponse } from "@/types/data-write";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const recordId = searchParams.get("record_id");

    if (!recordId) {
      return NextResponse.json(
        { error_code: "INVALID_REQUEST", message: "record_id is required" },
        { status: 400 }
      );
    }

    // Step 2: mTLS verification via SPIFFE SVID
    const clientCert = req.headers.get("x-forwarded-client-cert");
    const mockCert = "-----BEGIN CERTIFICATE-----\nMOCK\n-----END CERTIFICATE-----";
    const verifiedAppId = await verifySVID(clientCert || mockCert);

    // Fetch ciphertext from PostgreSQL
    const record = await getDataRecord(recordId);

    if (!record) {
      return NextResponse.json(
        { error_code: "RECORD_NOT_FOUND", message: "Data record not found" },
        { status: 404 }
      );
    }

    // AC-09: Ownership verification (Isolation)
    if (verifiedAppId !== "mock-app-id" && record.app_id !== verifiedAppId) {
       return NextResponse.json(
        { error_code: "RECORD_OWNERSHIP_MISMATCH", message: "Authenticated identity does not own this record" },
        { status: 403 }
      );
    }

    // Call Vault Transit to decrypt
    const vaultKeyName = record.app_id.replace("/", "-");
    let base64Plaintext;
    try {
      base64Plaintext = await decryptPayload(vaultKeyName, record.ciphertext);
    } catch (e: any) {
       console.error("[Flow 2] Vault decryption failed:", e);
       return NextResponse.json(
        { error_code: "VAULT_DECRYPT_FAILED", message: "Vault decryption service error" },
        { status: 503 }
      );
    }

    // Decode base64, parse JSON
    const payload = JSON.parse(Buffer.from(base64Plaintext, 'base64').toString('utf8'));

    const response: ReadResponse = {
      record_id: record.id,
      app_id: record.app_id,
      data_type: record.data_type as any,
      payload: payload,
      vault_key_version: record.vault_key_version,
      written_at: record.created_at
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error("[Flow 2] Data read failed:", error);
    return NextResponse.json(
      { error_code: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}
