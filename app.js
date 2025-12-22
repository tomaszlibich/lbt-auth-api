import "dotenv/config";

import express from "express";
import bodyParser from "body-parser";

import authRoutes from "./routes/auth.js";

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(authRoutes);

app.listen(3000, () => {
  console.log("LBT Auth API is running on http://localhost:3000");
});
