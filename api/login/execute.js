import {
  generateUUID,
  generateRefreshTokenSecret,
  hashRefreshToken,
} from "../../utils/crypto.js";
import { signJwtHs256 } from "../../utils/jwt.js";
import { db } from "../../aws/db.js";
import { getIpAddress } from "../../utils/network.js";

export const execute = async ({ TableName, user }, req, res) => {
  const { accountId, email, role, id: userId } = user;

  try {
    const { dbDocumentClient, PutCommand } = db;

    const sessionId = generateUUID();
    const nowSec = Math.floor(Date.now() / 1000);

    const atExpiresAtSec = nowSec + 15 * 60; // 15 minutes
    const rtExpiresAtSec = nowSec + 3 * 24 * 60 * 60; // 3 days

    const ipAddress = getIpAddress(req);
    const deviceInfo = req.headers["user-agent"] || "unknown";

    const accessToken = signJwtHs256(
      {
        sub: userId,
        accountId,
        role,
        sid: sessionId,
        iat: nowSec,
        exp: atExpiresAtSec,
      },
      { secret: process.env.JWT_ACCESS_SECRET }
    );
    const refreshToken = `${accountId}.${sessionId}.${generateRefreshTokenSecret()}`;
    const refreshTokenHash = hashRefreshToken(refreshToken);

    const SessionItem = {
      pk: `ACCOUNT#${accountId}`,
      sk: `SESSION#${sessionId}`,
      accountId,
      userId,
      id: sessionId,
      createdAt: nowSec,
      lastSeenAt: nowSec,
      expiresAt: rtExpiresAtSec,
      ipAddress,
      deviceInfo,
      refreshTokenHash,
      revokedAt: null,
      revokedReason: null,
      role,
    };

    const sessionParams = {
      TableName,
      Item: SessionItem,
    };

    await dbDocumentClient.send(new PutCommand(sessionParams));

    res.status(200).json({
      accountId,
      email,
      role,
      id: userId,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error during login execution:", error);

    res.status(500).json({
      message: "Internal server error",
    });

    return;
  }
};
