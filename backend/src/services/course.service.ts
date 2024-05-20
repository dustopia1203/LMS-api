import { Response } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";
import Course from "../models/Course";

const createCourse = catchAsyncError(async (data: any, res: Response) => {
  const course = await Course.create(data);
  res.status(201).json({
    success: true,
    course,
  });
});

const getAllCoursesService = async (res: Response) => {
  const courses = await Course.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    courses,
  });
};

export { createCourse, getAllCoursesService };
