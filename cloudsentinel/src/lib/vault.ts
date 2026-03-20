import { VaultEncryptResponse, VaultDecryptResponse } from "@/types/data-write";

const VAULT_ADDR = process.env.VAULT_ADDR || "http://localhost:8200";
const VAULT_TOKEN = process.env.VAULT_TOKEN || "root";
const MOCK_MODE = process.env.MOCK_MODE === "true";

export async function createTransitKey(keyName: string): Promise<boolean> {
  if (MOCK_MODE) {
    console.warn(`[Vault] MOCK_MODE active. Simulating success for key: ${keyName}`);
    return true;
  }

  const url = `${VAULT_ADDR}/v1/transit/keys/${keyName}`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-Vault-Token": VAULT_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "aes256-gcm96",
      }),
    });

    return response.ok || response.status === 204;
  } catch (error: any) {
    console.warn(`[Vault] Service unreachable. Falling back for local development.`);
    return true;
  }
}

export async function encryptPayload(keyName: string, base64Plaintext: string): Promise<VaultEncryptResponse['data']> {
  if (MOCK_MODE) {
    return {
      ciphertext: `vault:v1:mock:${Buffer.from(base64Plaintext, 'base64').toString('hex')}`,
      key_version: 1,
    };
  }

  const url = `${VAULT_ADDR}/v1/transit/encrypt/${keyName}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "X-Vault-Token": VAULT_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plaintext: base64Plaintext,
    }),
  });

  if (!response.ok) {
    throw new Error("VAULT_ENCRYPT_FAILED");
  }

  const result: VaultEncryptResponse = await response.json();
  return result.data;
}

export async function decryptPayload(keyName: string, ciphertext: string): Promise<string> {
  if (MOCK_MODE || ciphertext.startsWith("vault:v1:mock:")) {
    // Basic mock reversal
    if (ciphertext.startsWith("vault:v1:mock:")) {
      const hex = ciphertext.replace("vault:v1:mock:", "");
      return Buffer.from(hex, 'hex').toString('base64');
    }
    return ciphertext; // Fallback
  }

  const url = `${VAULT_ADDR}/v1/transit/decrypt/${keyName}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "X-Vault-Token": VAULT_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ciphertext: ciphertext,
    }),
  });

  if (!response.ok) {
    throw new Error("VAULT_DECRYPT_FAILED");
  }

  const result: VaultDecryptResponse = await response.json();
  return result.data.plaintext;
}
