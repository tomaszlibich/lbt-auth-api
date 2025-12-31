import crypto from "node:crypto";

export const generateUUID = () => {
  return crypto.randomUUID();
};

export const createSalt = () => {
  return crypto.randomBytes(16).toString("hex");
};

export const hashPassword = (password, salt) => {
  return crypto.scryptSync(password, salt, 64).toString("hex");
};

export const verifyPassword = (password, salt, hash) => {
  const hashToVerify = hashPassword(password, salt);

  return hash === hashToVerify;
};

export const generateRefreshTokenSecret = () => {
  return crypto.randomBytes(32).toString("base64url");
};

export const hashRefreshToken = (refreshToken) => {
  const secret = process.env.APP_SECRET;

  if (!secret) {
    throw new Error("APP_SECRET is not defined");
  }

  return crypto.createHmac("sha256", secret).update(refreshToken).digest("hex");
};

export const parseRefreshToken = (refreshToken) => {
  if (typeof refreshToken !== "string") return null;

  // Expected structure: accountId.sessionId.secret
  const parts = refreshToken.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [accountId, sessionId, secretPart] = parts;

  if (!accountId || !sessionId || !secretPart) {
    return null;
  }

  return { accountId, sessionId, secretPart };
};

const HEX_RE = /^[0-9a-f]+$/i;

export const timingSafeEqualHex = (aHex, bHex) => {
  if (typeof aHex !== "string" || typeof bHex !== "string") {
    return false;
  }

  if (aHex.length !== bHex.length) {
    return false;
  }

  if (!HEX_RE.test(aHex) || !HEX_RE.test(bHex)) {
    return false;
  }

  const a = Buffer.from(aHex, "hex");
  const b = Buffer.from(bHex, "hex");

  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(a, b);
};
