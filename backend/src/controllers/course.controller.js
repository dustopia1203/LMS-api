const ErrorHandler = require("../utils/errorHandler.js");
const Course = require("../models/Course.js");
const User = require("../models/User.js");
const { createCourse } = require("../services/course.service.js");
const cloudinary = require("cloudinary").v2;

const uploadCourse = async (req, res, next) => {
  try {
    const data = req.body;
    // if send a course thumbnail, upload thumbnail to cloudinary
    if (data.thumbnail) {
      const imageHolder = await cloudinary.uploader.upload(thumbnail, {
        folder: "courses",
      });
      data.thumbnail = {
        public_id: imageHolder.public_id,
        url: imageHolder.secure_url,
      };
    }
    createCourse(data, res, next);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

const editCourse = async (req, res, next) => {
  try {
    const data = req.body;
    // if send a course thumbnail, upload thumbnail to cloudinary
    if (data.thumbnail) {
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
    res.status(201).json({
      success: true,
      course,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

// get one course without purchasing - everyone can access
const getCourse = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId).select(
      "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
    );
    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

//get all courses without purchasing - everyone can access
const getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().select(
      "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
    );
    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

// get courses with purchasing - only purchased user can access
const getCourseData = async (req, res, next) => {
  try {
    const user = req.user;
    const userCourseList = await User.findById(user._id)
      .populate("courses")
      .select("courses");
    const courseId = req.params.id;
    const isCourseExist = await Course.findById(courseId);
    if (!isCourseExist) {
      return next(new ErrorHandler("Course not found", 404));
    }
    const isCoursePurchased = userCourseList.courses.find(
      (course) => course._id.toString() === courseId
    );
    if (!isCoursePurchased) {
      return next(
        new ErrorHandler("You have not permission to access this course", 401)
      );
    }
    const course = await Course.findById(courseId);
    const courseData = course.courseData;
    res.status(200).json({
      success: true,
      courseData,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

const addQuestion = async (req, res, next) => {
  try {
    const { question, courseId, courseDataId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      return next(new ErrorHandler("Course not found", 404));
    }
    const courseData = await course.courseData.find(
      (item) => item._id.toString() === courseDataId
    );
    if (!courseData) {
      return next(new ErrorHandler("Invalid course data", 404));
    }
    const comment = {
      user: req.user._id,
      comment: question,
      commentReplies: [],
    };
    courseData.questions.push(comment);
    await course.save();
    res.status(201).json({
      success: true,
      course,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

const addAnswer = async (req, res, next) => {
  try {
    const { answer, courseId, courseDataId, questionId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      return next(new ErrorHandler("Course not found", 404));
    }
    const courseData = await course.courseData.find(
      (item) => item._id.toString() === courseDataId
    );
    if (!courseData) {
      return next(new ErrorHandler("Invalid course data", 404));
    }
    const question = await courseData.questions.find(
      (item) => item._id.toString() === questionId
    );
    if (!question) {
      return next(new ErrorHandler("Question not found", 404));
    }
    const comment = {
      user: req.user._id,
      comment: answer,
    };
    question.commentReplies.push(comment);
    await course.save();
    res.status(201).json({
      success: true,
      course,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

module.exports = {
  uploadCourse,
  editCourse,
  getCourse,
  getCourses,
  getCourseData,
  addQuestion,
  addAnswer,
};
