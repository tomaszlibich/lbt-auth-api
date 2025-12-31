import { db } from "../../aws/db.js";
import { hashPassword } from "../../utils/crypto.js";

export const check = async (
  { TableName, Item },
  rawPassword,
  req,
  res,
  next
) => {
  const { dbDocumentClient, QueryCommand } = db;

  const findUserCommand = new QueryCommand({
    TableName,
    KeyConditionExpression: "pk = :pk AND sk = :sk",
    ExpressionAttributeValues: {
      ":pk": Item.pk,
      ":sk": Item.sk,
    },
  });
  const response = await dbDocumentClient.send(findUserCommand);

  const { Items: existingUsers } = response;

  if (!existingUsers || existingUsers.length === 0) {
    console.log("User not found:", Item.sk);

    res.status(401).json({
      message: "Invalid email or password",
    });

    return;
  }

  if (existingUsers.length > 1) {
    console.log("Multiple users found with the same email:", Item.sk);

    res.status(500).json({
      message: "Internal server error",
    });

    return;
  }

  const user = existingUsers[0];

  const hashedPassword = hashPassword(rawPassword, user.salt);

  if (hashedPassword !== user.password) {
    console.log("Invalid password for user:", Item.sk);

    res.status(401).json({
      message: "Invalid email or password",
    });

    return;
  }

  next({ user });
};
