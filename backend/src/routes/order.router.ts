import { Router } from "express";
import {
  createOrder,
  getAllOrders,
  getOrderAnalytics,
} from "../controllers/order.controller";
import { isAuthenticated, authorize } from "../middlewares/auth";

const router: Router = Router();

router.post("/create-order", isAuthenticated, createOrder);

router.get(
  "/get-all-orders",
  isAuthenticated,
  authorize("admin"),
  getAllOrders
);

router.get(
  "/analytics",
  isAuthenticated,
  authorize("admin"),
  getOrderAnalytics
);

export default router;
