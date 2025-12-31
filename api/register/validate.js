import { isValidEmail } from "../../utils/validations.js";

export const validate = (req, res, next) => {
  const { body } = req;

  if (!body) {
    res.status(400).json({
      message: "Bad request",
    });

    return;
  }

  const { email, password } = body;

  if (!email) {
    res.status(400).json({
      message: "Email is required",
    });

    return;
  }

  if (!password) {
    res.status(400).json({
      message: "Password is required",
    });

    return;
  }

  if (!isValidEmail(email)) {
    res.status(400).json({
      message: "Invalid email format",
    });

    return;
  }

  next();
};
