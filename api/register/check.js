import { db } from "../../aws/db.js";

export const check = async ({ TableName, Item }, res, next) => {
  const { dbDocumentClient, QueryCommand } = db;
  const { pk, sk } = Item;

  const findUserCommand = new QueryCommand({
    TableName,
    KeyConditionExpression: "pk = :pk AND sk = :sk",
    ExpressionAttributeValues: {
      ":pk": pk,
      ":sk": sk,
    },
  });
  const response = await dbDocumentClient.send(findUserCommand);

  const { Items: existingUsers } = response;

  if (existingUsers && existingUsers.length > 0) {
    res.status(409).json({
      message: "User with this email already exists",
    });

    return;
  }

  next({ TableName, Item });
};
