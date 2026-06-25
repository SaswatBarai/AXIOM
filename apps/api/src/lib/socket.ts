import { Server as SocketServer } from "socket.io";
import type { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { setSocketServer } from "../services/notification.service";
import { redis } from "../services/redis.service";
import { CacheKey } from "../utils/constants";
import { requireEnv } from "../utils/env";
import { extractJti } from "../utils/jwt";
import { logger } from "../utils/logger";

const SECRET = requireEnv("JWT_SECRET_KEY");

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
      const payload = jwt.verify(token, SECRET, { algorithms: ["HS256"] }) as unknown as { userId: string };
      socket.data["userId"] = payload.userId;
      socket.data["token"] = token;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data["userId"] as string;
    socket.join(`user:${userId}`);

    // Periodically verify token — disconnect if revoked or expired
    const verifyInterval = setInterval(async () => {
      try {
        const token = socket.data["token"] as string;
        if (!token) { socket.disconnect(); return; }
        jwt.verify(token, SECRET, { algorithms: ["HS256"] });
        const jti = extractJti(token);
        if (jti) {
          const blacklisted = await redis.get(CacheKey.blacklist(jti));
          if (blacklisted) { socket.disconnect(); return; }
        }
      } catch {
        socket.disconnect();
      }
    }, 5 * 60 * 1000);

    logger.info(`Socket connected: userId=${userId}`);

    socket.on("disconnect", () => {
      clearInterval(verifyInterval);
      logger.info(`Socket disconnected: userId=${userId}`);
    });
  });

  setSocketServer(io);
  return io;
}
