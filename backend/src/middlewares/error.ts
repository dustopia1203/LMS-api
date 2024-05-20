import { Request, Response, NextFunction } from "express";
import ErrorHandler  from "../ultis/errorHandler";

function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction): void {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";
  if (err.name === "CastError") {
    const message: string = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 404);
  }
  if (err.code === 11000) {
    const message: string = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }
  if (err.name === "JsonWebTokenError") {
    const message: string = "JsonWebToken is invalid. Try again!!!";
    err = new ErrorHandler(message, 400);
  }
  if (err.name === "TokenExpiredError") {
    const message: string = "JsonWebToken is expired. Try again!!!";
    err = new ErrorHandler(message, 400);
  }
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
}

export default errorMiddleware;