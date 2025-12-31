import { login } from "../api/login/index.js";
import { logout } from "../api/logout.js";
import { reset } from "../api/reset.js";
import { register } from "../api/register/index.js";
import { verify } from "../api/verify/index.js";
import { refresh } from "../api/refresh/index.js";

export const authRoutes = (router) => {
  router.post("/login", login);
  router.delete("/logout", logout);
  router.post("/register", register);
  router.post("/reset", reset);

  router.post("/verify", verify);
  router.post("/refresh", refresh);
};
