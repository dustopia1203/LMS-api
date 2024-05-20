import { Response } from "express";
import User from "../models/User";

const getUserById = async (id: string, res: Response) => {
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({
    sucess: true,
    user,
  });
};

const getAllUsersService = async (res: Response) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    users,
  });
};

const updateUserRoleService = async (
  id: string,
  role: string,
  res: Response
) => {
  const user = await User.findByIdAndUpdate(id, { role }, { new: true });
  res.status(200).json({
    success: true,
    user,
  });
};

export { getUserById, getAllUsersService, updateUserRoleService };
