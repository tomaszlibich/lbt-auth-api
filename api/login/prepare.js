import { getTableName } from "../../shared/get-table-name.js";

export const prepare = async (req, res, next) => {
  const { body } = req;
  const { email, accountId: accountIdFromBody, password: rawPassword } = body;

  const accountId = accountIdFromBody || process.env.LBT_ACCOUNT_ID;
  const TableName = getTableName(accountId);

  const pk = `ACCOUNT#${accountId}`;
  const sk = `USER#${email}`;

  const Item = {
    pk,
    sk,
  };

  next({ TableName, Item }, rawPassword);
};
