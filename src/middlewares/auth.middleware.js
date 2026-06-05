import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import JWT from "jsonwebtoken";
import { User } from "../models/user.models.js";
export const verifyJWT = asyncHandler ( async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","");
        console.log(token);
        if ( !token ) {
            throw new ApiError(401,"unauthorized error");
        }

        const decodedToken = JWT.verify(token,process.env.ACCESS_TOKEN_SECRET);
        console.log(decodedToken)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if ( !user ) {
            throw new ApiError(401,"invaild access token");
        }
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(400, error?.message || "verifying fail of refresh token");

    }
})