import { NextFunction, Request, Response, Router } from "express";
import { AuthControllers } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import passport from "passport";
import { envVars } from "../../config/env";

const router = Router();

router.post("/login", AuthControllers.credentialsLogin);
router.post("/refresh-token", AuthControllers.getNewAccessToken);
router.post("/logout", AuthControllers.logout);

router.post(
  "/change-password",
  checkAuth(...Object.values(Role)),
  AuthControllers.changePassword
);

router.post(
  "/set-password",
  checkAuth(...Object.values(Role)),
  AuthControllers.setPassword
);

//Frontend -> forget-password -> email -> user status check(isActive; isBlocked) -> short expiration token (valid for 10 min) -> email -> Frontend Link (http://localhost:5173/reset-password?email=example@gmail.com&token=token) ->Frontend - query extract korbe -> new password -> backend /reset-password api -> authorization = token -> newPassword -> token verify -> hash password
router.post("/forgot-password", AuthControllers.forgotPassword);

router.post(
  "/reset-password",
  checkAuth(...Object.values(Role)),
  AuthControllers.resetPassword
);

// /booking -> /login -> successful google login -> /booking frontend
// /login -> /login -> successful google login -> / frontend

router.get("/google", (req: Request, res: Response, next: NextFunction) => {
  const redirect = req.query.redirect || "/";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: redirect as string,
  })(req, res, next);
});

// /api/v1/auth/google/callback?state=/booking
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${envVars.FRONTEND_URL}/login?error=There is some issues with your account. Please contact with our support team. `,
  }),
  AuthControllers.googleCallbackController
);

export const AuthRouters = router;
