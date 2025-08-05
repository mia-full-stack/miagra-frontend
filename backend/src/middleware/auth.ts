import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import User from "../models/userModel";
import type { AuthenticatedRequest } from "../types/express";

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({ message: "Access token required" });
    }

    console.log("🔍 Verifying token:", token.substring(0, 20) + "...");

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    console.log("✅ Token decoded, user ID:", decoded.id);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.log("❌ User not found for ID:", decoded.id);
      return res.status(401).json({ message: "Invalid token" });
    }

    console.log("✅ User authenticated:", user.username);
    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Token verification error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Alias for backward compatibility
export const auth = authenticateToken;

interface JwtPayload {
  id: string;
}

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // Получаем токен из заголовка Authorization
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    try {
      // Верифицируем токен
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      // Получаем пользователя из базы данных
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Token is valid but user no longer exists.",
        });
      }

      // Добавляем пользователя к объекту запроса
      req.user = user;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }
  } catch (error: any) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error in authentication middleware.",
    });
  }
};
