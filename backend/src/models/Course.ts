import mongoose from "mongoose";

interface IComment extends mongoose.Document {
  user: mongoose.Schema.Types.ObjectId;
  comment: string;
  commentReplies?: IComment[];
}

interface IReview extends mongoose.Document {
  user: mongoose.Schema.Types.ObjectId;
  rating: number;
  comment: string;
  commentReplies: IComment[];
}

interface ILink extends mongoose.Document {
  title: string;
  url: string;
}

interface ICourseData extends mongoose.Document {
  title: string;
  description: string;
  videoUrl: string;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: ILink[];
  suggestion: string;
  questions: IComment[];
}

interface ICourse extends mongoose.Document {
  name: string;
  description: string;
  price: number;
  estimatedPrice?: number;
  thumbnail: object;
  tags: string;
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  prerequisites: { title: string }[];
  reviews: IReview[];
  courseData: ICourseData[];
  rating?: number;
  purchased?: number;
}

const commentSchema: mongoose.Schema<IComment> = new mongoose.Schema<IComment>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  comment: String,
  commentReplies: [Object],
});

const reviewSchema: mongoose.Schema<IReview> = new mongoose.Schema<IReview>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  rating: {
    type: Number,
    default: 0,
  },
  comment: String,
  commentReplies: [Object],
});

const linkSchema: mongoose.Schema<ILink> = new mongoose.Schema<ILink>({
  title: String,
  url: String,
});

const courseDataSchema: mongoose.Schema<ICourseData> =
  new mongoose.Schema<ICourseData>({
    videoUrl: String,
    title: String,
    videoSection: String,
    description: String,
    videoLength: Number,
    videoPlayer: String,
    links: [linkSchema],
    suggestion: String,
    questions: [commentSchema],
  });

const courseSchema: mongoose.Schema<ICourse> = new mongoose.Schema<ICourse>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    estimatedPrice: Number,
    thumbnail: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    tags: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    demoUrl: {
      type: String,
      required: true,
    },
    benefits: [
      {
        title: String,
      },
    ],
    prerequisites: [
      {
        title: String,
      },
    ],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    rating: {
      type: Number,
      default: 0,
    },
    purchased: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Course: mongoose.Model<ICourse> = mongoose.model("Course", courseSchema);

export default Course;
export { ICourse };
