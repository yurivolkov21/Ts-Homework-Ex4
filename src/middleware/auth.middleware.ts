import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/http.js";
import { verifyAccessToken } from "../utils/jwt.js";


export type AuthUser = {
    userId: string;
    role: "customer" | "admin";
}

declare global {
    namespace Express {
        interface Request {
            auth?: AuthUser;
        }
    }
}

// Middleware to require authentication for an endpoint
export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer")) throw new ApiError(401, { message: "Missing Authorization Bearer Token!" });

    const token = header.slice("Bearer ".length);
    try {
        const payload = verifyAccessToken(token);
        req.auth = { userId: payload.sub, role: payload.role };
        next();
    }
    catch (err) {
        throw new ApiError(401, { message: "Invalid or Expired token!" });
    }
}

// Middleware factory to require specific user role for an endpoint
export function requireRole(role: "customer" | "admin") {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.auth) throw new ApiError(401, { message: "Unauthorized!" });
        if (req.auth.role !== role) throw new ApiError(403, { message: "Forbidden!" });
        next();
    };
}
