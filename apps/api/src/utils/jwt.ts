import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET_KEY!;

export function signAccessToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, SECRET, { expiresIn: "15m" });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ userId }, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): jwt.JwtPayload {
  return jwt.verify(token, SECRET) as jwt.JwtPayload;
}
