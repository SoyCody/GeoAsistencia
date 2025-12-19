import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "8h"; // ajusta a tu criterio

export const createToken = (userId) => {
  return jwt.sign(
    { sub: userId },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: "HS256"
    }
  );
};
