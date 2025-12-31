export const base64url = (input) => {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);

  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

export const base64urlToBuffer = (b64url) => {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (b64.length % 4)) % 4;
  return Buffer.from(b64 + "=".repeat(padLen), "base64");
};

export const bufferToBase64url = (buf) => {
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};
