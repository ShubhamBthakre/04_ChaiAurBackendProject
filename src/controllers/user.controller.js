import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    // console.log("user in generate token",user);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    console.log("accessToken in generate method", accessToken);
    console.log("refreshToken in generate method", refreshToken);

    //we have to store refresh token in database || first we are adding refresh token in user object
    user.refreshToken = refreshToken;
    //method to add refresh token in database || validateBeforeSave:false will not validate password it will directly save user object in database
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get userdetails from frontend
  //validation- not empty
  //check if user is already exit: username, email
  //check for image , check for avatar
  //upload them to cloudinary, check for avatar if it is properly uploaded or not
  //create user object -create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return res

  //form se data aa rha hai ya phir json se data aa rha hai toh req.body me mil jayenga
  const { username, fullName, email, password } = req.body;
  console.log(fullName, email);

  //we are checking if is there any empty field
  if (
    [username, fullName, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //here we are checking if there is any same username or email, User: this is made by mongoose so it can direclty contact to the database

  //we can use .find also ,
  //  User.findOne({username})
  //  User.findOne({email})

  //to check user from both username or email simultaneously, special syntax $or
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with this username or email already exist");
  }

  //routes ke andar middleware add kiya hai (upload) that why we get some extra excess like below ( that middleware will add extra fields in request)
  //req.body jaise express ne diya hai waise hi multer req.files ka access deta hai

  // avatar: user.routes me upload (name) ke field se "avatar" liya hai
  const avatarLocalPath = req.files?.avatar[0]?.path; //mutiple files hai isliye req.files liya hai
  // const coverImageLocalPath=req.files?.coverImage[0]?.path;

  console.log(req.files);

  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  //check for avatar
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  //check for avatar if it is properly uploaded or not

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password,
  });

  //mongoDb har ek entry ke sath ek _id ka field add krta hai
  //here we are checking if user is created properly or not by _id which is created by mangoDb
  // .select method will remove password and refresh token field from response

  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!userCreated) {
    throw new ApiError(500, "Something went wrong while registering the User");
  }

  //we can sent direct ApiResponse but Post exept res.status
  return res
    .status(200)
    .json(new ApiResponse(201, userCreated, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //req.body -> data
  // check username or email is it empty
  //find the user by username or email in database
  // password check
  // generate access and refresh token
  //send cookies

  const { username, email, password } = req.body;

  console.log(username, password);

  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }

  //fineOne is mongoDb method || we are creating instance of User
  const user = await User.findOne({ $or: [{ username }, { email }] });

  console.log("user:- ", user);

  if (!user) {
    throw new ApiError(404, "User does not exit");
  }

  //check here User or user || user is instance or User i.e. mongoDb instance so all method available in user
  const isPasswordValid = await user.isPasswordCorrect(password); //it give  result in true or false

  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid user credential");
  }

  console.log("userId:- ", user._id);
  // we are making sure here it will take time so its better to add await
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  console.log(accessToken);
  console.log(refreshToken);

  //we are making new request to database for access and refresh token || by .select method we will not get password and refreshToken
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //for cookies we have to design some options so that frontent developer can not modify cookies to make more secure || by default cookies are modifyble.
  const options = {
    httpOnly: true,
    secure: true,
  };

  //it is best practice to send response in json object to user e.g. mobile app development || we can set cookies here because of app.use(cookieParser())
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          refreshToken,
          accessToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  //this method will find user and update require information
  await User.findByIdAndUpdate(
    req.user._id,
    {
      //this is the MongoDb method
      $unset: {
        refreshToken: 1,
        //this remove the field from the document
      },
    },

    {
      // by this parameter we will get new value in return i.e. updated one (refresh token)
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  //we are clearing cookies from response || clearCookies is method
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    // we are decoding refresh token
    const decodedToken = Jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // while generating refresh token we passed _id in payload (user.module.js generate refresh token)
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    //In generateAccessAndRefreshTokens method in line no.27 we had saved refresh token in database || we are matching refresh token send by user and refresh token in database

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(
        401,
        "Invalid refresh token or token is expired or used"
      );
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie(accessToken, accessToken, options)
      .cookie(refreshToken, refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          "Access token refresh successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  console.log(oldPassword, newPassword);

  //We had added user in req in jwtVerify middleware
  const user = await User.findById(req.user._id);

  // isPasswordCorrect is async method thats why we are adding await
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  //set new password
  user.password = newPassword;

  //we dont want to validate other fields thats why validateBeforeSave:false
  await user.save({ validateBeforeSave: false }); // after this pre hook in user model will trigger

  res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetch successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(401, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { fullName, email },
    {
      //this will return new object with updated one
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading Cover Image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "cover image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }

  const channel = await User.aggregate([
    {
      //match will return one document after one exact match
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions", //in database schema store as in lowerscase and plural form,
        localField: "_id",
        foreignField: "channel",
        as: "subscribers", //mere kitna suscriber hai
      },
    },
    {
      $lookup: {
        from: "subscriptions", //in database schema store as in lowerscase and plural form,
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribersTo", //maine kisko subscribe kiya hai woh
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "subscribersTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel does not exit");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel, "User channel fetch successfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id), //aggregate me directly mongoDb se contact hota hai isliye Id match hone k liye aise convert krna padta hai
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res.status(200).json(new ApiResponse(200, user[0].watchHistory));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
