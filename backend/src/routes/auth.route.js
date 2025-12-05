// DEPENDENCIES
import express from "express";
// CONTROLLERS
import { signUpController, loginController, logoutController, getCurrentUserController } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signUpController);
router.post("/login", loginController);
router.get("/me", getCurrentUserController);
router.post("/logout", logoutController);


export default router;
