import { Express } from "express"
import userRouter from "./user.router"
import courseRouter from "./course.router"
import orderRouter from "./order.router"
import notificationRouter from "./notification.router"
import layoutRouter from "./layout.router"

function route (app: Express) {
  app.use("/api/user", userRouter);
  app.use("/api/course", courseRouter);
  app.use("/api/order", orderRouter);
  app.use("/api/notification", notificationRouter);
  app.use("/api/layout", layoutRouter);
}

export default route