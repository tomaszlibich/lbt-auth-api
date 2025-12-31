import { validate } from "./validate.js";
import { prepare } from "./prepare.js";
import { check } from "./check.js";
import { execute } from "./execute.js";

export const register = async (req, res) => {
  await validate(req, res, async () => {
    await prepare(req, res, async (data) => {
      await check(data, res, async () => {
        await execute(data, res);
      });
    });
  });
};
