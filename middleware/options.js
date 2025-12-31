import { getHeaders } from "../shared/get-headers.js";

export default (req, res, next) => {
  if (req.method === "OPTIONS") {
    res.send({
      statusCode: 204, // No Content
      headers: getHeaders(req),
      body: null,
    });

    return;
  }

  next();
};
