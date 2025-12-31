import { db } from "../../aws/db.js";
import { signJwtHs256 } from "../../utils/jwt.js";
import { getIpAddress } from "../../utils/network.js";
import { getTableName } from "../../shared/get-table-name.js";
import {
  parseRefreshToken,
  hashRefreshToken,
  timingSafeEqualHex,
  generateRefreshTokenSecret,
} from "../../utils/crypto.js";

export const refresh = async (req, res) => {
  const { refreshToken } = req.body ?? {};

  if (!refreshToken || typeof refreshToken !== "string") {
    return res.status(400).json({ message: "refreshToken is required" });
  }

  const parsed = parseRefreshToken(refreshToken);

  if (!parsed) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const { accountId, sessionId } = parsed;
  const nowSec = Math.floor(Date.now() / 1000);

  const TableName = getTableName(accountId);

  try {
    const { dbDocumentClient, GetCommand, UpdateCommand } = db;

    const pk = `ACCOUNT#${accountId}`;
    const sk = `SESSION#${sessionId}`;

    const sessionResponse = await dbDocumentClient.send(
      new GetCommand({
        TableName,
        Key: { pk, sk },
      })
    );

    const session = sessionResponse?.Item;

    if (!session) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    if (session.revokedAt) {
      return res.status(401).json({ message: "Session revoked" });
    }

    if (typeof session.expiresAt === "number" && session.expiresAt <= nowSec) {
      return res.status(401).json({ message: "Session expired" });
    }

    const incomingHash = hashRefreshToken(refreshToken);
    const storedHash = session.refreshTokenHash;

    if (!timingSafeEqualHex(String(incomingHash), String(storedHash))) {
      console.log("Refresh token hash mismatch for session:", sessionId);

      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newRefreshToken = `${accountId}.${sessionId}.${generateRefreshTokenSecret()}`;
    const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

    const atExpiresAtSec = nowSec + 15 * 60;

    const newAccessToken = signJwtHs256(
      {
        sub: session.userId,
        accountId,
        role: session.role,
        sid: sessionId,
        iat: nowSec,
        exp: atExpiresAtSec,
      },
      { secret: process.env.JWT_ACCESS_SECRET }
    );

    const ipAddress = getIpAddress(req);
    const deviceInfo = req.headers["user-agent"] || "unknown";

    await dbDocumentClient.send(
      new UpdateCommand({
        TableName,
        Key: { pk, sk },
        UpdateExpression:
          "SET refreshTokenHash = :newHash, lastSeenAt = :now, ipAddress = :ip, deviceInfo = :ua",
        ConditionExpression:
          "(attribute_not_exists(revokedAt) OR revokedAt = :null) AND refreshTokenHash = :oldHash",
        ExpressionAttributeValues: {
          ":newHash": newRefreshTokenHash,
          ":oldHash": storedHash,
          ":now": nowSec,
          ":ip": ipAddress,
          ":ua": deviceInfo,
          ":null": null,
        },
      })
    );

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    if (err?.name === "ConditionalCheckFailedException") {
      console.log(
        "Refresh token validation failed during update for session:",
        sessionId
      );

      return res.status(401).json({ message: "Invalid refresh token" });
    }

    console.error("Error during refresh:", err);

    return res.status(500).json({ message: "Internal server error" });
  }
};
