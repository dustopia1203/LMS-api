import { Router } from "express";
import {
  getNotifications,
  updateNotification,
} from "../controllers/notification.controller";
import { isAuthenticated, authorize } from "../middlewares/auth";

const router: Router = Router();

router.get("/get-all", isAuthenticated, authorize("admin"), getNotifications);

router.put(
  "/update/:id",
  isAuthenticated,
  authorize("admin"),
  updateNotification
);

export default router;
