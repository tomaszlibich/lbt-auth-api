import { createSalt, generateUUID, hashPassword } from "../../utils/crypto.js";
import { getTableName } from "../../shared/get-table-name.js";

// If accountId is not provided in the body, a new accountId is generated and role is 'owner'
// If accountId is provided and matches LBT_ACCOUNT_ID, the role is 'owner'
// If accountId is provided and does not match LBT_ACCOUNT_ID, the role is 'user'
// In the admin panel, owner can also assign role 'admin' to other users within the same account

const getRole = (accountIdFromBody) => {
  if (!!accountIdFromBody && accountIdFromBody === process.env.LBT_ACCOUNT_ID) {
    return "owner";
  }

  return "user";
};

const getAccountId = (accountIdFromBody) => {
  if (accountIdFromBody === process.env.LBT_ACCOUNT_ID) {
    return accountIdFromBody;
  }

  if (accountIdFromBody) {
    return accountIdFromBody;
  }

  return generateUUID();
};

export const prepare = async (req, res, next) => {
  const { body } = req;
  const { email, password, accountId: accountIdFromBody } = body;

  const accountId = getAccountId(accountIdFromBody);
  const TableName = getTableName(accountId);

  const role = getRole(accountIdFromBody);
  const salt = createSalt();
  const hashedPassword = hashPassword(password, salt);
  const userId = generateUUID();

  const pk = `ACCOUNT#${accountId}`;
  const sk = `USER#${email}`;
  const createdAt = Date.now();

  const Item = {
    pk,
    sk,
    id: userId,
    accountId,
    createdAt,
    email,
    password: hashedPassword,
    role,
    salt,
  };

  next({ TableName, Item });
};
