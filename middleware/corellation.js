export default (req, res, next) => {
  const requestCorrelationId = req.get("X-Request-Id");

  if (requestCorrelationId) {
    console.log("Request correlation id:", requestCorrelationId);
  }

  next();
};
