import { Router } from "express";
import { upload } from '../middlewares/multer.middlewares.js'
import { logoutUser, registerUser, userLogin } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "coverImage",
            maxCount: 1
        },
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    registerUser);
router.route("/login").post(userLogin);
router.route("/logout").post(verifyJWT, logoutUser);

export default router;