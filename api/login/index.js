import { validate } from "./validate.js";
import { prepare } from "./prepare.js";
import { check } from "./check.js";
import { execute } from "./execute.js";

export const login = async (req, res) => {
  await validate(req, res, async () => {
    await prepare(req, res, async ({ TableName, Item }, rawPassword) => {
      await check(
        { TableName, Item },
        rawPassword,
        req,
        res,
        async ({ user }) => {
          await execute({ TableName, user }, req, res);
        }
      );
    });
  });
};
