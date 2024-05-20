import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../ultis/errorHandler";
import catchAsyncError from "../middlewares/catchAsyncError";
import Order, { IOrder } from "../models/Order";
import Course from "../models/Course";
import User from "../models/User";
import Notification from "../models/Notification";
import { newOrder, getAllOrdersService } from "../services/order.service";
import generateLast12MonthsData from "../services/analytics.generator";
import { ObjectId } from "mongoose";

const createOrder = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, paymentInfo } = req.body as IOrder;
      const user = await User.findById(req.user?._id);
      const isUserHaveCourse = user?.courses.some(
        (course: any) => course.toString() === courseId
      );
      if (isUserHaveCourse) {
        return next(new ErrorHandler("You already have this course", 400));
      }
      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }
      const data: any = {
        courseId: course._id as ObjectId,
        userId: user?._id,
        paymentInfo,
      };
      const course_id: ObjectId = course._id as ObjectId;
      user?.courses.push(course_id);
      await user?.save();
      await Notification.create({
        user: user?._id,
        title: "New order",
        message: `You have a new order from ${course.name} course`,
      });
      course.purchased ? (course.purchased += 1) : course?.purchased;
      await course.save();
      newOrder(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

const getAllOrders = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllOrdersService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

const getOrderAnalytics = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await generateLast12MonthsData(Order);
      res.status(200).json({
        success: true,
        order,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export { createOrder, getAllOrders, getOrderAnalytics };
