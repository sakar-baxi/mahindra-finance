export type JourneyType = "ntb" | "ntb-conversion" | "etb-nk" | "etb";

export type InviteTokenPayloadV1 = {
  v: 1;
  id: string;
  journeyType: JourneyType;
  employee: { id: string; name: string; email: string; phone?: string };
  prefilledData: Record<string, unknown>;
  issuedAt: string; // ISO
};

function base64UrlEncodeFromString(str: string): string {
  // Browser-safe UTF-8 base64url encoding
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    const utf8 = new TextEncoder().encode(str);
    let binary = "";
    for (let i = 0; i < utf8.length; i++) binary += String.fromCharCode(utf8[i]);
    const b64 = window.btoa(binary);
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  // Node.js
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const B: any = (globalThis as any).Buffer;
  if (B) {
    return B.from(str, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }

  throw new Error("Base64 encoding not supported in this environment.");
}

function base64UrlDecodeToString(token: string): string {
  const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "===".slice((b64.length + 3) % 4);

  if (typeof window !== "undefined" && typeof window.atob === "function") {
    const binary = window.atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  // Node.js
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const B: any = (globalThis as any).Buffer;
  if (B) {
    return B.from(padded, "base64").toString("utf8");
  }

  throw new Error("Base64 decoding not supported in this environment.");
}

/**
 * Creates invite token. When INVITE_TOKEN_SECRET is set, appends HMAC signature.
 * Production: set INVITE_TOKEN_SECRET for tamper-proof tokens.
 */
export function createInviteToken(payload: Omit<InviteTokenPayloadV1, "v">): string {
  const full: InviteTokenPayloadV1 = { v: 1, ...payload };
  const payloadB64 = base64UrlEncodeFromString(JSON.stringify(full));
  const secret = process.env.INVITE_TOKEN_SECRET;
  if (secret) {
    try {
      const { createHmac } = require("crypto");
      const sig = createHmac("sha256", secret).update(payloadB64).digest("base64url");
      return `inv_${payloadB64}.${sig}`;
    } catch {
      /* fallback to unsigned */
    }
  }
  return `inv_${payloadB64}`;
}

/**
 * Parses invite token. If token was signed (INVITE_TOKEN_SECRET), verifies HMAC.
 */
export function parseInviteToken(inviteIdOrToken: string): InviteTokenPayloadV1 | null {
  if (!inviteIdOrToken.startsWith("inv_")) return null;
  const rest = inviteIdOrToken.slice("inv_".length);
  const [payloadB64, sig] = rest.includes(".") ? rest.split(".", 2) : [rest, null];

  try {
    const json = base64UrlDecodeToString(payloadB64);
    const parsed = JSON.parse(json) as InviteTokenPayloadV1;
    if (parsed?.v !== 1) return null;
    if (!parsed?.id || !parsed?.journeyType || !parsed?.employee?.id) return null;
    if (sig && typeof window === "undefined") {
      try {
        const { createHmac } = require("crypto");
        const secret = process.env.INVITE_TOKEN_SECRET;
        if (secret) {
          const expected = createHmac("sha256", secret).update(payloadB64).digest("base64url");
          if (sig !== expected) return null;
        }
      } catch {
        /* Skip verification if crypto unavailable */
      }
    }
    return parsed;
  } catch {
    return null;
  }
}

