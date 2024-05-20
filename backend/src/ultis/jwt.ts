import { Response } from "express";
import { IUser } from "../models/User";
import dotenv from "dotenv";

dotenv.config();

interface ITokenOption {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

const accessTokenExpire: number = parseInt(
  process.env.ACCESS_TOKEN_EXPIRE || "300",
  10
);
const refreshTokenExpire: number = parseInt(
  process.env.REFRESH_TOKEN_EXPIRE || "1200",
  10
);

const accessTokenOptions: ITokenOption = {
  expires: new Date(Date.now() + accessTokenExpire * 60 * 1000),
  maxAge: accessTokenExpire * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};
const refreshTokenOptions: ITokenOption = {
  expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 1000),
  maxAge: refreshTokenExpire * 24 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

function sendToken(user: IUser, statusCode: number, res: Response) {
  const accessToken = user.signAccessToken();
  const refreshToken = user.signRefreshToken();
  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
    refreshTokenOptions.secure = true;
  }
  res.cookie("accessToken", accessToken, accessTokenOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenOptions);
  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
  });
}

export { sendToken, accessTokenOptions, refreshTokenOptions };
