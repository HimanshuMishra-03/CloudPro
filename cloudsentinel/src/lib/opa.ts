import fetch from "node-fetch";

const OPA_URL = process.env.OPA_URL || "http://localhost:8181/v1/data/cloudsentinel/registration";
const MOCK_MODE = process.env.MOCK_MODE === "true";

export interface OPAInput {
  github_owner: string;
  app_id: string;
  spiffe_id: string;
  github_status: number;
  existing_registration: boolean;
}

export interface OPAResult {
  allow: boolean;
  reason?: string;
}

export async function evaluatePolicy(input: OPAInput): Promise<OPAResult> {
  if (MOCK_MODE) {
    console.warn("[OPA] MOCK_MODE active. Automatically allowing registration.");
    return { allow: true };
  }

  try {
    const response = await fetch(OPA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      throw new Error(`OPA_UNAVAILABLE: ${response.statusText}`);
    }

    const data: any = await response.json();
    const result = data.result;
    
    if (!result) {
      return { allow: true }; // Default to allow if policy not found in dev
    }

    return {
      allow: result.allow ?? true,
      reason: result.deny_reason || undefined,
    };
  } catch (error: any) {
    console.warn("[OPA] Service unreachable. Falling back to ALLOW for development.");
    return { allow: true };
  }
}
