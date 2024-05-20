import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../ultis/errorHandler";
import catchAsyncError from "../middlewares/catchAsyncError";
import Course from "../models/Course";
import User from "../models/User";
import Notification from "../models/Notification";
import { v2 as cloudinary } from "cloudinary";
import { createCourse, getAllCoursesService } from "../services/course.service";
import generateLast12MonthsData from "../services/analytics.generator";

const uploadCourse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        const imageHolder = await cloudinary.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: imageHolder.public_id,
          url: imageHolder.secure_url,
        };
      }
      createCourse(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

const editCourse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        await cloudinary.uploader.destroy(thumbnail.public_id);
        const imageHolder = await cloudinary.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: imageHolder.public_id,
          url: imageHolder.secure_url,
        };
      }
      const courseId = req.params.id;
      const course = await Course.findByIdAndUpdate(
        courseId,
        { $set: data },
        { new: true }
      );
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

const getCourse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      const course = await Course.findById(courseId).select(
        "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
      );
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

const getCourses = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await Course.find().select(
        "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
      );
      res.status(200).json({
        success: true,
        courses,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

const getCourseData = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const userCourseList = await User.findById(user?._id)
        .populate("courses")
        .select("courses");
      const courseId = req.params.id;
      const isCourseExist = await Course.findById(courseId);
      if (!isCourseExist) {
        return next(new ErrorHandler("Course not found", 404));
      }
      const isCoursePurchased = userCourseList?.courses.find(
        (course: any) => course._id.toString() === courseId
      );
      if (!isCoursePurchased) {
        return next(
          new ErrorHandler("You have not permission to access this course", 401)
        );
      }
      const course = await Course.findById(courseId);
      const courseData = course?.courseData;
      res.status(200).json({
        success: true,
        courseData,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

interface IAddQuestion {
  question: string;
  courseId: string;
  courseDataId: string;
}

const addQuestion = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, courseId, courseDataId } = req.body as IAddQuestion;
      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }
      const courseData = course.courseData.find(
        (item: any) => item._id.toString() === courseDataId
      );
      if (!courseData) {
        return next(new ErrorHandler("Invalid course data", 404));
      }
      const comment: any = {
        user: req.user?._id,
        comment: question,
        commentReplies: [],
      };
      courseData.questions.push(comment);
      await Notification.create({
        user: req.user?._id,
        title: "New question received",
        message: `You have a new question in ${courseData.title}`,
      });
      await course.save();
      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

interface IAddAnswer {
  answer: string;
  courseId: string;
  courseDataId: string;
  questionId: string;
}

const addAnswer = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, courseId, courseDataId, questionId } =
        req.body as IAddAnswer;
      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }
      const courseData = await course.courseData.find(
        (item: any) => item._id.toString() === courseDataId
      );
      if (!courseData) {
        return next(new ErrorHandler("Invalid course data", 404));
      }
      const question = await courseData.questions.find(
        (item: any) => item._id.toString() === questionId
      );
      if (!question) {
        return next(new ErrorHandler("Question not found", 404));
      }
      const comment: any = {
        user: req.user?._id,
        comment: answer,
      };
      question.commentReplies?.push(comment);
      await course.save();
      if (req.user?._id === question.user) {
        await Notification.create({
          user: req.user._id,
          title: "New question reply received",
          message: `You have a new question reply in ${courseData.title}`,
        });
      }
      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

interface IAddReview {
  rating: number;
  comment: string;
}

const addReview = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const userCourseList = await User.findById(user?._id)
        .populate("courses")
        .select("courses");
      const courseId = req.params.id;
      const isCourseExist = await Course.findById(courseId);
      if (!isCourseExist) {
        return next(new ErrorHandler("Course not found", 404));
      }
      const isCoursePurchased = userCourseList?.courses.find(
        (course: any) => course._id.toString() === courseId
      );
      if (!isCoursePurchased) {
        return next(
          new ErrorHandler("You have not permission to access this course", 401)
        );
      }
      const course = await Course.findById(courseId);
      const { rating, comment } = req.body as IAddReview;
      const review: any = {
        user: user?._id,
        rating,
        comment: comment,
      };
      course?.reviews.push(review);
      let avg = 0;
      course?.reviews.forEach((review) => {
        avg += review.rating;
      });
      if (course) {
        course.rating = avg / course.reviews.length;
      }
      await course?.save();
      await Notification.create({
        title: "New review received",
        message: `${req.user?.name} have given a new review in ${course?.name}`,
      });
      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

interface IAddReviewReply {
  comment: string;
  courseId: string;
  reviewId: string;
}

const addReviewReply = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, courseId, reviewId } = req.body as IAddReviewReply;
      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }
      const review = await course.reviews.find(
        (item: any) => item._id.toString() === reviewId
      );
      if (!review) {
        return next(new ErrorHandler("Review not found", 404));
      }
      const reply: any = {
        user: req.user?._id,
        comment,
      };
      review.commentReplies.push(reply);
      await course.save();
      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

const getAllCourses = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllCoursesService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

const deleteCourse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const course = await Course.findById(id);
      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }
      await course.deleteOne({ id });
      res.status(200).json({
        success: true,
        message: "Course deleted",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

const getCourseAnalytics = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const course = await generateLast12MonthsData(Course);
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export {
  uploadCourse,
  editCourse,
  getCourse,
  getCourses,
  getCourseData,
  addQuestion,
  addAnswer,
  addReview,
  addReviewReply,
  getAllCourses,
  deleteCourse,
  getCourseAnalytics,
};
