import { db } from "../../aws/db.js";

export const execute = async ({ TableName, Item }, res) => {
  const { id, email, role, accountId } = Item;

  try {
    const { dbDocumentClient, PutCommand } = db;
    const registerUserParams = {
      TableName,
      Item,
    };

    await dbDocumentClient.send(new PutCommand(registerUserParams));

    res.status(200).json({
      body: { id, email, accountId, role },
    });
  } catch (dbError) {
    console.error("Database error during registration:", dbError);

    res.status(500).json({
      message: "Database error",
    });

    return;
  }
};
