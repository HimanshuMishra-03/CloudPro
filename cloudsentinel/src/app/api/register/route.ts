import { NextRequest, NextResponse } from "next/server";
import { validateAndParseRepo } from "@/lib/github";
import { issueWorkloadIdentity } from "@/lib/spire";
import { evaluatePolicy } from "@/lib/opa";
import { createTransitKey } from "@/lib/vault";
import { saveRegistration, checkExistingRegistration } from "@/lib/db";
import { emitAuditEvent } from "@/lib/kafka";

const MOCK_MODE = process.env.MOCK_MODE === "true";

export async function POST(req: NextRequest) {
  let appId = "unknown";
  let actor = "unknown";

  try {
    const body = await req.json();
    const { repo_url, user_id } = body;
    actor = user_id;

    if (!repo_url || !user_id) {
      return NextResponse.json(
        { error_code: "MISSING_FIELDS", message: "repo_url and user_id are required" },
        { status: 400 }
      );
    }

    // Step 1: GitHub Validation
    console.log(`[Flow 1] Step 1: Validating GitHub repo: ${repo_url}`);
    const repoMetadata = await validateAndParseRepo(repo_url);
    appId = repoMetadata.appId;

    // Early duplicate check
    const exists = await checkExistingRegistration(appId);
    if (exists) {
      console.warn(`[Flow 1] App already registered: ${appId}`);
      return NextResponse.json(
        { error_code: "ALREADY_REGISTERED", message: "App already has an ACTIVE registration record in the DB" },
        { status: 409 }
      );
    }

    // Step 2: SPIRE Identity Issuance
    console.log(`[Flow 1] Step 2: Issuing SPIFFE identity for ${appId}`);
    const svidBundle = await issueWorkloadIdentity(appId);

    // Step 3: OPA Policy Evaluation
    console.log(`[Flow 1] Step 3: Evaluating OPA policy`);
    const policyResult = await evaluatePolicy({
      github_owner: repoMetadata.owner,
      app_id: appId,
      spiffe_id: svidBundle.spiffe_id,
      github_status: 200,
      existing_registration: false,
    });

    if (!policyResult.allow) {
      console.warn(`[Flow 1] OPA DENY: ${policyResult.reason}`);
      await emitAuditEvent({
        event_type: "REGISTRATION_FAILED",
        schema_version: "1.0",
        timestamp: Date.now(),
        actor,
        app_id: appId,
        spiffe_id: svidBundle.spiffe_id,
        vault_key_name: "none",
        detected_stack: repoMetadata.stack,
        result: "DENIED",
        reason_code: policyResult.reason,
        platform_version: "1.0.0",
      });
      return NextResponse.json(
        { error_code: "OPA_POLICY_DENIED", message: "OPA policy evaluation returned deny", reason: policyResult.reason },
        { status: 403 }
      );
    }

    // Step 4: Vault KEK Generation
    console.log(`[Flow 1] Step 4: Generating Vault KEK`);
    const vaultKeyName = `${repoMetadata.owner}-${repoMetadata.name}`;
    await createTransitKey(vaultKeyName);

    // Step 5: Database Record Write
    console.log(`[Flow 1] Step 5: Writing registration record to DB`);
    const registrationRecord = {
      app_id: appId,
      spiffe_id: svidBundle.spiffe_id,
      vault_key_name: vaultKeyName,
      github_owner: repoMetadata.owner,
      detected_stack: repoMetadata.stack,
      default_branch: repoMetadata.defaultBranch,
      status: "ACTIVE" as const,
    };
    await saveRegistration(registrationRecord);

    // Step 6: Kafka Audit Event Emission
    console.log(`[Flow 1] Step 6: Emitting APP_REGISTERED event`);
    await emitAuditEvent({
      event_type: "APP_REGISTERED",
      schema_version: "1.0",
      timestamp: Date.now(),
      actor,
      app_id: appId,
      spiffe_id: svidBundle.spiffe_id,
      vault_key_name: vaultKeyName,
      detected_stack: repoMetadata.stack,
      result: "SUCCESS",
      reason_code: null,
      platform_version: "1.0.0",
    });

    return NextResponse.json(
      {
        app_id: appId,
        spiffe_id: svidBundle.spiffe_id,
        vault_key_name: vaultKeyName,
        stack: repoMetadata.stack,
        status: "ACTIVE",
        registered_at: new Date().toISOString(),
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("[Flow 1] Saga failed:", error);
    
    // Attempt audit failure event
    try {
      await emitAuditEvent({
        event_type: "REGISTRATION_FAILED",
        schema_version: "1.0",
        timestamp: Date.now(),
        actor,
        app_id: appId,
        spiffe_id: "error",
        vault_key_name: "error",
        detected_stack: "unknown",
        result: "DENIED",
        reason_code: error.message || "INTERNAL_ERROR",
        platform_version: "1.0.0",
      });
    } catch (e) {
      // Ignore
    }

    const statusCodeMap: Record<string, number> = {
      "REPO_NOT_FOUND": 404,
      "INVALID_REPO_URL": 400,
      "ALREADY_REGISTERED": 409,
    };

    const status = statusCodeMap[error.message] || 500;
    return NextResponse.json(
      { error_code: error.message || "INTERNAL_SERVER_ERROR", message: error.message },
      { status }
    );
  }
}
