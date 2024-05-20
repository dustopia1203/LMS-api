import mongoose from "mongoose";

interface IOrder extends mongoose.Document {
  courseId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  paymentInfo: object;
}

const orderSchema: mongoose.Schema<IOrder> = new mongoose.Schema<IOrder>(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentInfo: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
export { IOrder };
