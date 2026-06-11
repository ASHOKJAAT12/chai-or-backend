import { Router } from "express";
import { upload } from '../middlewares/multer.middlewares.js'
import { accessRefreshToken, changeCurrentPassword, logoutUser, registerUser, updateUserAvatar, updateUserCoverImage, updateUserDetails, userLogin } from "../controllers/user.controllers.js";
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
router.route("/refresh-token").post(verifyJWT, accessRefreshToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/update-account-details").patch(verifyJWT, updateUserDetails);
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/update-coverimage").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
export default router;