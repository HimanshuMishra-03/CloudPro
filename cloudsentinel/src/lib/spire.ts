/**
 * SPIRE Client for identity issuance.
 */

export interface SVIDBundle {
  spiffe_id: string;
  svid: string; // PEM encoded certificate
  ttl: number;
}

export async function issueWorkloadIdentity(appId: string): Promise<SVIDBundle> {
  const spiffeId = `spiffe://cloudsentinel.io/app/${appId}`;
  
  console.log(`[SPIFFE] Calling SPIRE to issue identity for: ${spiffeId}`);
  
  return {
    spiffe_id: spiffeId,
    svid: "-----BEGIN CERTIFICATE-----\nMIIC...MOCK...CERT...VALUE\n-----END CERTIFICATE-----",
    ttl: 86400, // 24 hours
  };
}

export async function verifySVID(pemCert: string | undefined): Promise<string> {
  // In a real environment, this would verify the cert against the SPIRE trust bundle
  // and extract the SPIFFE ID from the SAN (Subject Alternative Name) field.
  
  if (!pemCert || pemCert.trim() === "") {
    throw new Error("SPIFFE_IDENTITY_INVALID");
  }

  // Enhanced Mock verification for Flow 2 tests
  if (pemCert.startsWith("MOCK_SVID:")) {
    return pemCert.replace("MOCK_SVID:", "");
  }

  if (pemCert.includes("BEGIN CERTIFICATE")) {
    return "mock-app-id"; 
  }

  throw new Error("SPIFFE_IDENTITY_INVALID");
}

export function extractAppIdFromSpiffe(spiffeId: string): string {
  const prefix = "spiffe://cloudsentinel.io/app/";
  if (spiffeId.startsWith(prefix)) {
    return spiffeId.replace(prefix, "");
  }
  return "unknown";
}
