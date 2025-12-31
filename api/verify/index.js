import { verifyAccessToken } from "../../utils/jwt.js";
import { extractBearerToken } from "../../utils/network.js";

export const verify = async (req, res) => {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      console.error("Missing bearer token");

      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = verifyAccessToken(token, {
      secret: process.env.JWT_ACCESS_SECRET,
      clockSkewSec: 60,
    });

    req.user = payload;

    res.status(200).json({ message: "OK" });
  } catch (e) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
