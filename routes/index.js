import express from "express";
import { authRoutes } from "./auth.js";

const router = express.Router();

authRoutes(router);

export default router;
