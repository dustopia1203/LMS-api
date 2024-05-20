import { Request, Response, NextFunction } from "express";
import catchAsyncError from "./catchAsyncError";
import jwt, { JwtPayload } from "jsonwebtoken";
import ErrorHandler from "../ultis/errorHandler";
import User, { IUser } from "../models/User";
import dotenv from "dotenv";
import exp from "constants";

dotenv.config();

const isAuthenticated = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;
    if (!accessToken && !refreshToken) {
      return next(new ErrorHandler("Login first to access this resource", 401));
    }
    if (!accessToken && refreshToken) {
      return next(new ErrorHandler("Token Expired!", 401));
    }
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN as string
    ) as JwtPayload;
    if (!decoded) {
      return next(new ErrorHandler("Invalid access token", 401));
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    req.user = user;
    next();
  }
);

const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(
          `Role (${req.user?.role}) is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};

export { isAuthenticated, authorize };
