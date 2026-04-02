import { Router } from "express";

import { authController } from "../controllers/auth.controller";
import { authRateLimiter } from "../middleware/rate-limit.middleware";
import { asyncHandler } from "../utils/async-handler";
import { requireAuth } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { loginSchema, signupSchema, updateProfileSchema } from "../validators/auth.schema";

export const authRouter = Router();

authRouter.use(authRateLimiter);

authRouter.post("/signup", validateBody(signupSchema), asyncHandler(authController.signup));
authRouter.post("/login", validateBody(loginSchema), asyncHandler(authController.login));
authRouter.get("/me", requireAuth, asyncHandler(authController.me));
authRouter.patch("/me", requireAuth, validateBody(updateProfileSchema), asyncHandler(authController.updateProfile));
authRouter.post("/logout", requireAuth, asyncHandler(authController.logout));
authRouter.post("/refresh", asyncHandler(authController.refresh));
authRouter.post("/switch-role", requireAuth, asyncHandler(authController.switchRole));
