const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

function signToken({ email, name }) {
  return jwt.sign({ email, name }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function verifyToken(token) {
  const payload = jwt.verify(token, JWT_SECRET);
  return { email: payload.email, name: payload.name };
}

module.exports = { signToken, verifyToken, JWT_SECRET };
