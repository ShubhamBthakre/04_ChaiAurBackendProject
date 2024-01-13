import mongoose, { Schema } from "mongoose";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowerCase: true,
      trim: true,
      index: true,
      //index will make it more searchable in database (use it for special cases only)
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowerCase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudinary url
      required: true,
    },
    coverImage: {
      type: String, //cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"], //custome error msg
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

//mongoose documentation->Middleware->Types of Middleware
//avoid arraw function in pre middlware because of current context (this)
//pre hook is use to execute something before doing any event in database (e.g. validate ,save, remove, updateOne, deleteOne, init )

userSchema.pre("save", async function (next) {
  //we get this.isModified method like this and have to pass hardcoded value (e.g. "password" which is taken from userSchema ) || if user save any information in database every time password will be hash by bcrypt method to avoid this we are checking here by isModified() method that password is modified or not if it is not  modified return next() or perform hash operation || 
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password,10);
  next();
});


// like updateOne deleteOne mongoose give us access to make custom methods , for that we have to use below syntax
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password); // it will give result in boolean format
};

/*
Access Token:

Purpose: The primary purpose of an access token is to grant access to a protected resource (e.g., user data, API endpoint) on behalf of the user.
Lifespan: Access tokens have a relatively short lifespan, usually ranging from a few minutes to a few hours.
Usage: The client (e.g., a web or mobile application) includes the access token in API requests to prove that the user has been authenticated and has the necessary permissions to access the requested resource.
Security: Since access tokens are short-lived, even if they are compromised, the potential damage is limited. Additionally, using HTTPS helps secure the transmission of access tokens.

Refresh Token:

Purpose: The refresh token is used to obtain a new access token when the current access token expires.
Lifespan: Refresh tokens have a longer lifespan compared to access tokens. They are designed to be stored securely and used to obtain new access tokens when needed.
Usage: When the access token expires, the client sends a request to the authorization server with the refresh token to obtain a new access token without requiring the user to re-authenticate.
Security: Refresh tokens are more sensitive and should be stored securely. They are typically not included in API requests; instead, they are exchanged for a new access token through a secure back-end communication with the authorization server.

*/

userSchema.methods.generateAccessToken =function () {
  return Jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

//refresh token refresh again and again that why we sent less information in payload
userSchema.methods.generateRefreshToken =function () {
  return Jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
