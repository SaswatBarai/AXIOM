import { Server as SocketServer } from "socket.io";
import type { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { setSocketServer } from "../services/notification.service";
import { logger } from "../utils/logger";

const JWT_SECRET = process.env.JWT_SECRET_KEY;
if (!JWT_SECRET) {
  throw new Error("Missing required environment variable: JWT_SECRET_KEY");
}
const SECRET: string = JWT_SECRET;

export function initSocketIO(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env["FRONTEND_URL"] ?? "http://localhost:3000",
      credentials: true,
    },
  });

  // Auth middleware — verify JWT before allowing connection
  io.use((socket, next) => {
    const token = socket.handshake.auth["token"] as string | undefined
      ?? (socket.handshake.headers["authorization"] ?? "").replace("Bearer ", "");
    if (!token) return next(new Error("No token"));
    try {
      const payload = jwt.verify(token, SECRET) as unknown as { userId: string };
      socket.data["userId"] = payload.userId;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data["userId"] as string;
    socket.join(`user:${userId}`);
    logger.info(`Socket connected: userId=${userId}`);

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: userId=${userId}`);
    });
  });

  setSocketServer(io);
  return io;
}
