import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js';
import { User } from '../models/user.models.js'
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findOne(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false});
        console.log("token create successfull.");
        
        return { accessToken, refreshToken };
    } catch ( error ) {
        throw new ApiError(500,"somthing is worng while generation access and refresh token.");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //Take input from front end 
    //all feild are required
    //check username already exist or not
    //check for avatar and coverImage
    //upload on cloudinary 
    //create user obeject
    //remove password and refreshtoken
    //return user

    const { username, fullName, password, email } = req.body || {} 

    if( !username || !fullName || !password || !email ) {
        throw new ApiError(400,"All feild are required.");
    }
    
    if ( 
        [username, fullName, password, email].some((field)=>field.trim()==="")
    )
    {
        throw new ApiError(400,"all feild are required.")
    }
    const userExist = await User.findOne({
        $or: [{username},{email}]
    });

    if ( userExist ) {
        throw new ApiError(400,"username and email already register.");
    }

    const coverImageLocalPath = req.files?.coverImage[0].path;
    const avatarLocalPath = req.files?.avatar[0].path;
    console.log(req.files);
    if ( !avatarLocalPath || !coverImageLocalPath ) {
        throw new ApiError(401,"avatar or coverImage are required.")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if ( !avatar || !coverImage ) {
        throw new ApiError(500,"avatar or coverImage can not upload on cloudinary.");
    }

    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        password,
        email: email.toLowerCase(),
        coverImage: coverImage.url || "",
        avatar: avatar.url
    });

    const createdUser = await User.findById(user._id).select( "-password -refreshToken");

    if(!createdUser) {
        throw new ApiError(500,"somethong is wrong user can not be created.");
    } else {
        console.log("User Created Successfully.")
    }


    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Successfull Created.")
    )
})

const userLogin = asyncHandler ( async (req, res) => {
    //input from front end
    //check all field are required
    //check username created
    //check password

    const {username , password} = req.body || {}

    if ( !username && !password) {
        throw new ApiError(400,"All field are required.");
    }
    console.log(username)
    const userExist = await User.findOne({username})
    console.log(userExist);
    if(!userExist) {
        throw new ApiError(400,"username and email can not register.");
    }

    const isPassword = await userExist.isPasswordCorrect(password);

    if(!isPassword) {
        throw new ApiError(400,"Wrong Password.");
    }

    const {accessToken , refreshToken } = await generateAccessAndRefreshToken(userExist._id);

    const loggedUser = await User.findById(userExist._id).select( "-password -refreshToken");

    const option = {
        httpOnly: true,
        secure: true
    }
    console.log("User Login successfully.");

    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
        new ApiResponse(200,{user:loggedUser,accessToken,refreshToken},"User successfully login.")
    )
    
})

const logoutUser = asyncHandler ( async (req , res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"User logout successfully")
    )
})

const accessRefreshToken = asyncHandler ( async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if( !incomingRefreshToken ) {
        throw new ApiError(401,"unautorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);

        

        const user = await User.findById(decodedToken?._id)
        if( !user ) {
            throw new ApiError(401,"invalid refresh token")
        }

        if ( incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401,"Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const {accessToken , newrefreshToken} = await generateAccessAndRefreshToken(user._id);

    } catch (error) {
        throw new ApiError(401, error?.message || "error to access refresh token");
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrrefreshToken,options)
    .json(
        new ApiResponse(200,{accessToken,refreshToken: newrefreshToken},"access token refreshed.")
    )
})

const changeCurrentPassword = asyncHandler ( async (req, res) => {

    const {oldPassword, newPassword} = req.body || {}

    if ( !oldPassword && !newPassword ) {
        throw new ApiError(400,"All feild are required.")
    }

    const user = await User.findById(req.user?._id)

    if ( !user ) {
        throw new ApiError(401,"user can not find.")
    }

    const isPassword = await user.isPasswordCorrect(oldPassword);

    if ( !isPassword ) {
        throw new ApiError(401,"old password is wrong.")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"User Password Change successfully.")
    )
})

const updateUserDetails = asyncHandler ( async (req, res) => {

    const {fullName, email} = req.body || {}

    console.log(fullName,email);

    if ( !fullName || !email ) {
        throw new ApiError(400,"All feild are required.");
    }

    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {
            new: true
        }
    ).select("-password")
    console.log(user)
    return res
    .status(200)
    .json(
        new ApiResponse(200,{user},"user details update successfully.")
    )
})

const updateUserAvatar = asyncHandler ( async (req, res) => {
    
    const avatarLocalPath = req.file?.path

    if ( !avatarLocalPath ) {
        throw new ApiError(400,"avatar is missing.")
    }

    const currentUser = await User.findById(req.user?._id);

    const deleteAvatarFromCloudinary = await deleteFromCloudinary(currentUser.avatar.split("/").pop().split(".")[0])

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if ( !avatar.url || !avatar ) {
        throw new ApiError(400,"can not uploade on cloudinary.");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Avatar update successfully.")
    )
})

const updateUserCoverImage = asyncHandler ( async ( req, res ) => {
    const coverImageLocalPath = req.file?.path;

    if ( !coverImageLocalPath ) {
        throw new ApiError(400,"cover image is missing.");
    }

    const currentUser = await User.findById(req.user?._id)

    if ( !currentUser ) {
        throw new ApiError(401,"user can not found");
    }

    const coverImageUrl = currentUser.coverImage.split("/").pop().split(".")[0];

    const coverImageDeleteFromCloudinary = await deleteFromCloudinary(coverImageUrl);

    const user = await User.findBbyIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"cover image update successfully.")
    )
})

export {
    registerUser,
    userLogin,
    logoutUser,
    accessRefreshToken,
    changeCurrentPassword,
    updateUserDetails,
    updateUserAvatar,
    updateUserCoverImage
};