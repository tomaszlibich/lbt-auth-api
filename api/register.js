export const register = async (req, res) => {
  const { body } = req;

  if (!body) {
    res.status(400).json({
      message: "Bad request",
    });
  }

  const { username, password } = body;

  res.status(200).json({
    body: { username, password },
  });
};
