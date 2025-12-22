import express from "express";
import { login } from "../api/login.js";
import { logout } from "../api/logout.js";
import { reset } from "../api/reset.js";
import { register } from "../api/register.js";

const router = express.Router();

router.post("/login", login);
router.delete("/logout", logout);
router.post("/register", register);
router.post("/reset", reset);

export default router;
