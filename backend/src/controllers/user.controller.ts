import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/User";
import ErrorHandler from "../ultis/errorHandler";
import catchAsyncError from "../middlewares/catchAsyncError";
import jwt, { JwtPayload } from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import {
  sendToken,
  accessTokenOptions,
  refreshTokenOptions,
} from "../ultis/jwt";
import {
  getUserById,
  getAllUsersService,
  updateUserRoleService,
} from "../services/user.service";
import generateLast12MonthsData from "../services/analytics.generator";

interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
}

const registerUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body as IRegisterRequest;
      const isEmailTaken = await User.findOne({ email });
      if (isEmailTaken) {
        return next(new ErrorHandler("Email is already taken", 400));
      }
      const user = await User.create({ name, email, password });
      res.status(201).json({ success: true, user });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

interface ILoginUser {
  email: string;
  password: string;
}

const loginUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginUser;
      if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password", 400));
      }
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
      }
      const isPasswordMatched = await user.comparePassword(password);
      if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
      }
      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

const logoutUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("accessToken", "", { maxAge: 1 });
      res.cookie("refreshToken", "", { maxAge: 1 });
      res.status(200).json({
        success: true,
        message: "Logged out",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

const updateAccessToken = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const decoded = jwt.verify(
        req.cookies.refreshToken,
        process.env.REFRESH_TOKEN as string
      ) as JwtPayload;
      if (!decoded) {
        return next(new ErrorHandler("Could not refresh token", 400));
      }
      const session = await User.findById(decoded.id);
      if (!session) {
        return next(new ErrorHandler("User not found", 404));
      }
      const accessToken = session.signAccessToken();
      const refreshToken = session.signRefreshToken();
      req.user = session;
      res.cookie("accessToken", accessToken, accessTokenOptions);
      res.cookie("refreshToken", refreshToken, refreshTokenOptions);
      res.status(200).json({
        success: true,
        accessToken,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

const getUserInfo = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id as string;
      getUserById(userId, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

interface IUpdateUserInfo {
  name: string;
  email: string;
}

const updateUserInfo = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email } = req.body as IUpdateUserInfo;
      const userId = req.user?._id as string;
      const user = await User.findById(userId);
      if (user) {
        if (email) {
          const isEmailTaken = await User.findOne({ email });
          if (isEmailTaken) {
            return next(new ErrorHandler("Email is already taken", 400));
          }
          user.email = email;
        }
        if (name) {
          user.name = name;
        }
      }
      await user?.save();
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

interface IUpdatePassword {
  oldPassword: string;
  newPassword: string;
}

const updateUserPassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body as IUpdatePassword;
      if (!oldPassword || !newPassword) {
        return next(new ErrorHandler("Please enter old and new password", 400));
      }
      const user = await User.findById(req.user?._id).select("+password");
      if (user?.password === undefined) {
        return next(new ErrorHandler("Invalid user", 400));
      }
      const isPasswordMatched = await user?.comparePassword(oldPassword);
      if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid password", 400));
      }
      user.password = newPassword;
      await user.save();
      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

interface IUpdateAvatar {
  avatar: string;
}

const updateUserAvatar = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { avatar } = req.body as IUpdateAvatar;
      const user = await User.findById(req.user?._id);
      if (avatar && user) {
        if (user.avatar.public_id) {
          // if user already has an avatar, delete it from cloudinary
          await cloudinary.uploader.destroy(user.avatar.public_id);
          // then upload the new avatar
          const imageHolder = await cloudinary.uploader.upload(avatar, {
            folder: "avatars",
            width: 150,
          });
          user.avatar = {
            public_id: imageHolder.public_id,
            url: imageHolder.secure_url,
          };
        } else {
          const imageHolder = await cloudinary.uploader.upload(avatar, {
            folder: "avatars",
            width: 150,
          });
          user.avatar = {
            public_id: imageHolder.public_id,
            url: imageHolder.secure_url,
          };
        }
      }
      await user?.save();
      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

const getAllUsers = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllUsersService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

const updateUserRole = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, role } = req.body;
      updateUserRoleService(id, role, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

const deleteUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }
      await user.deleteOne({ id });
      res.status(200).json({
        success: true,
        message: "User deleted",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

const getUserAnalytics = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await generateLast12MonthsData(User);
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export {
  registerUser,
  loginUser,
  logoutUser,
  updateAccessToken,
  getUserInfo,
  updateUserInfo,
  updateUserPassword,
  updateUserAvatar,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getUserAnalytics,
};
