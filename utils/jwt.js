import crypto from "node:crypto";
import { base64url, base64urlToBuffer, bufferToBase64url } from "./encoding.js";

export const signJwtHs256 = (payload, { secret }) => {
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is required");
  }

  const header = { alg: "HS256", typ: "JWT" };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));

  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto.createHmac("sha256", secret).update(data).digest();
  const encodedSignature = base64url(signature);

  return `${data}.${encodedSignature}`;
};

export const verifyAccessToken = (token, opts) => {
  const {
    secret,
    nowSec = Math.floor(Date.now() / 1000),
    issuer,
    audience,
    clockSkewSec = 60,
  } = opts ?? {};

  if (!secret) {
    throw new Error("JWT secret is required");
  }

  if (!token || typeof token !== "string") {
    throw new Error("Missing token");
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  const [encodedHeader, encodedPayload, encodedSig] = parts;

  // Decode and parse header/payload
  let header;
  let payload;

  try {
    header = JSON.parse(base64urlToBuffer(encodedHeader).toString("utf8"));
    payload = JSON.parse(base64urlToBuffer(encodedPayload).toString("utf8"));
  } catch {
    throw new Error("Invalid token encoding");
  }

  // Enforce algorithm (prevents alg=none downgrade attacks)
  if (header?.alg !== "HS256") {
    throw new Error("Unsupported JWT alg");
  }

  // Verify signature (constant-time compare)
  const data = `${encodedHeader}.${encodedPayload}`;
  const expectedSig = crypto.createHmac("sha256", secret).update(data).digest();

  const actualSig = base64urlToBuffer(encodedSig);

  // timingSafeEqual requires equal length
  const expectedSigB64u = bufferToBase64url(expectedSig);

  if (expectedSigB64u.length !== encodedSig.length) {
    throw new Error("Invalid signature");
  }

  if (!crypto.timingSafeEqual(base64urlToBuffer(expectedSigB64u), actualSig)) {
    throw new Error("Invalid signature");
  }

  // Validate time-based claims (seconds)
  if (typeof payload?.exp !== "number") {
    throw new Error("Missing exp");
  }

  if (payload.exp <= nowSec - clockSkewSec) {
    throw new Error("Token expired");
  }

  // optional sanity: reject tokens "issued in the future" beyond skew
  if (typeof payload?.iat === "number" && payload.iat > nowSec + clockSkewSec) {
    throw new Error("Invalid iat");
  }

  if (typeof payload?.nbf === "number" && payload.nbf > nowSec + clockSkewSec) {
    throw new Error("Token not active");
  }

  // Optional issuer/audience checks
  if (issuer && payload?.iss !== issuer) {
    throw new Error("Invalid issuer");
  }

  if (audience) {
    const aud = payload?.aud;
    const allowed = Array.isArray(audience) ? audience : [audience];
    const isTokenOK =
      typeof aud === "string"
        ? allowed.includes(aud)
        : Array.isArray(aud)
        ? aud.some((a) => allowed.includes(a))
        : false;

    if (!isTokenOK) {
      throw new Error("Invalid audience");
    }
  }

  return payload;
};
