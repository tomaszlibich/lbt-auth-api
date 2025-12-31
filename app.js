import "dotenv/config";

import express from "express";
import bodyParser from "body-parser";

import middleware from "./middleware/index.js";
import routes from "./routes/index.js";

const port = process.env.PORT || 3000;
const app = express();

app.set("trust proxy", true);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(middleware.options);
app.use(routes);
app.use(middleware.handle404);

app.listen(port, () => {
  console.log(`LBT Auth API is running on http://localhost:${port}`);
});
