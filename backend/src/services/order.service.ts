import { NextFunction, Response } from "express";
import Order from "../models/Order";
import ErrorHandler from "../ultis/errorHandler";
import catchAsyncError from "../middlewares/catchAsyncError";

const newOrder = catchAsyncError(
  async (data: any, res: Response, next: NextFunction) => {
    try {
      const order = await Order.create(data);
      res.status(201).json({
        success: true,
        order,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

const getAllOrdersService = async (res: Response) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    orders,
  });
};

export { newOrder, getAllOrdersService };
