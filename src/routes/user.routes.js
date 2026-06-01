import { Router } from "express";
import { upload } from '../middlewares/multer.middlewares.js'
import { registerUser, userLogin } from "../controllers/user.controllers.js";
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

export default router;