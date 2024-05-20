import mongoose from "mongoose";

interface INotification extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  status: string;
}

const notificationSchema: mongoose.Schema<INotification> =
  new mongoose.Schema<INotification>(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      title: {
        type: String,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        default: "unread",
      },
    },
    { timestamps: true }
  );

const Notification: mongoose.Model<INotification> = mongoose.model(
  "Notification",
  notificationSchema
);

export default Notification;
export { INotification };
