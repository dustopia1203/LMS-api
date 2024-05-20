import { Router } from "express";
import {
  createLayout,
  editLayout,
  getLayoutByType,
} from "../controllers/layout.controller";
import { isAuthenticated, authorize } from "../middlewares/auth";

const router: Router = Router();

router.post("/create", isAuthenticated, authorize("admin"), createLayout);

router.put("/edit", isAuthenticated, authorize("admin"), editLayout);

router.get("/:type", getLayoutByType);

export default router;
