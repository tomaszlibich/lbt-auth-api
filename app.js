import "dotenv/config";

import express from "express";
import bodyParser from "body-parser";

import authRoutes from "./routes/auth.js";

const port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(authRoutes);

app.listen(port, () => {
  console.log(`LBT Auth API is running on http://localhost:${port}`);
});
