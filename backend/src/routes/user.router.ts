import { Router } from "express";
import { isAuthenticated, authorize } from "../middlewares/auth";
import {
  registerUser,
  loginUser,
  logoutUser,
  updateAccessToken,
  getUserInfo,
  updateUserInfo,
  updateUserPassword,
  updateUserAvatar,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getUserAnalytics,
} from "../controllers/user.controller";

const router: Router = Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/logout", isAuthenticated, logoutUser);

router.get("/refresh", updateAccessToken);

router.get("/me", isAuthenticated, getUserInfo);

router.put("/update-info", isAuthenticated, updateUserInfo);

router.put("/update-password", isAuthenticated, updateUserPassword);

router.put("/update-avatar", isAuthenticated, updateUserAvatar);

router.get("/get-all-users", isAuthenticated, authorize("admin"), getAllUsers);

router.put("/update-role", isAuthenticated, authorize("admin"), updateUserRole);

router.delete("/delete/:id", isAuthenticated, authorize("admin"), deleteUser);

router.get("/analytics", isAuthenticated, authorize("admin"), getUserAnalytics);

export default router;
