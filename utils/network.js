import net from "node:net";

/**
 * - Do NOT trust X-Forwarded-For unless you explicitly opt in (trustProxy=true).
 * - Validate extracted value is an IP address.
 *
 */
export const getIpAddress = (req, opts = {}) => {
  const {
    trustProxy = false,
    prefer = [
      "cf-connecting-ip",
      "true-client-ip",
      "x-forwarded-for",
      "req-ip",
      "socket",
    ],
  } = opts;

  const firstValidIp = (value) => {
    if (!value || typeof value !== "string") return null;

    // XFF may contain: "client, proxy1, proxy2"
    const candidates = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const c of candidates) {
      // Strip IPv6 zone index if present (rare, but possible): "fe80::1%lo0"
      const cleaned = c.includes("%") ? c.split("%")[0] : c;

      // Express / Node can give IPv4-mapped IPv6 like "::ffff:203.0.113.10"
      const v4Mapped = cleaned.startsWith("::ffff:")
        ? cleaned.slice(7)
        : cleaned;

      if (net.isIP(v4Mapped)) return v4Mapped;
      if (net.isIP(cleaned)) return cleaned;
    }
    return null;
  };

  // Only trust proxy headers if configured to do so.
  const headerIp = (name) => firstValidIp(req.headers?.[name]);

  for (const source of prefer) {
    if (source === "cf-connecting-ip") {
      // Cloudflare client IP
      const ip = trustProxy ? headerIp("cf-connecting-ip") : null;
      if (ip) return ip;
    }

    if (source === "true-client-ip") {
      // Some CDNs / proxies
      const ip = trustProxy ? headerIp("true-client-ip") : null;
      if (ip) return ip;
    }

    if (source === "x-forwarded-for") {
      const ip = trustProxy ? headerIp("x-forwarded-for") : null;
      if (ip) return ip;
    }

    if (source === "req-ip") {
      // Express populates req.ip and (if trust proxy enabled) may use XFF internally.
      const ip = firstValidIp(req.ip);
      if (ip) return ip;
    }

    if (source === "socket") {
      const ip = firstValidIp(req.socket?.remoteAddress);
      if (ip) return ip;
    }
  }

  return "unknown";
};

export const extractBearerToken = (req) => {
  const auth = req.headers?.authorization;

  if (!auth || typeof auth !== "string") {
    return null;
  }

  const [scheme, token] = auth.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};
