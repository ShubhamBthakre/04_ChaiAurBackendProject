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
