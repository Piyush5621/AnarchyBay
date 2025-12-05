import express from "express";
import { createUserProfileController, getTotalUsersController, getUserProfileController } from "../controllers/profile.controller.js";
const router = express.Router();

router.post("/create-user-profile", createUserProfileController);
router.get("/get-total-users", getTotalUsersController);
router.post("/get-user-profile", getUserProfileController);


export default router;
