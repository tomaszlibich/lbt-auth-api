export const getTableName = (accountId) => {
  if (accountId === process.env.LBT_ACCOUNT_ID) {
    return process.env.DYNAMO_DB_ADMIN_TABLE_NAME;
  }

  return process.env.DYNAMO_DB_TABLE_NAME;
};
