const cors = {
  origin: [
    // Update as needed
    "libtomsoftware.com",
    "gateway.libtomsoftware.com",
    "http://localhost:8080",
  ],
  default: "libtomsoftware.com",
};

const getAllowedOrigin = (req) => {
  const origin = req.headers.origin?.toLowerCase();

  if (cors.origin.includes(origin)) {
    return req.headers.origin;
  }

  return cors.default;
};

export const getHeaders = (req) => ({
  "Access-Control-Allow-Origin": getAllowedOrigin(req),
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,POST",
  "Content-Type": "application/json",
});
