import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefershToken = async(userId) => {
  try {
    const user = User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refershToken = user.generateRefreshToken()

    user.refershToken = refershToken

    await user.save({validateBeforeSave: false})

    return {accessToken,refershToken}

  } catch (error) {
    throw new ApiError(501,"somthing went wrong while genreating access and regresh token")
  }
}

const registerUser = asyncHandler(async(req,res) => {
  const {Username,fullname,password,phone,email} = req.body;
  console.log("email",email); // debug ke liye

  // Step 1 if user all required fileds are provided
  if (
    [fullname,email,password,Username,phone].some((field) =>field?.trim() === "")
  ) {
    throw new ApiError(400,"All fields are required");
    
  }
  // Step 2 
  const existingUser = await User.findOne({
    $or: [{username},{email}]
  });

  if (existingUser) {
    throw new ApiError(409,"User with this email or username already  exists");

    
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400,"Avatar is required");
    
  }

  const newUser = User.Create({
    fullName: fullname,
    avatar: avatar.url,
    email,
    password,
    username: username.toLowerCase()
  });

  const CreatedUser =  await user.findById(newUser._id).select("-password -refershToken");
  
  if(!CreatedUser){
    throw new ApiError(500, "somthing went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200,"User registerd succesfully")
  );


});

const loginUser = asyncHandler(async(req,res) => {
  // step 1
  const {username,email,password,phone} = req.body;
  // step 2
  if(!username && email && phone){
    throw new ApiError(400,"username or email and phone is required")
  }

  // step3 
  const user = await User.findOne({
    $or: [{username},{email},{phone}]
  });
  if(!user){
    throw new ApiError(404,"Use does not exist");

  }

  // step 4 
  const isPasswordValid = await user.isPasswordCorrect(password);
  if(!isPasswordValid){
  throw new ApiError(401,"wrong password")
  }
  // step 5 genreate accessToken and refresh token
  const {accessToken,refreshToken} = await generateAccessAndRefershToken(user._id)

  const LogedInUser = await User.findById(user._id).select("-password - refershToken")
  // set cookie and return response
  const options = {
    httpOnly: true,
    secure: true
  };
  return res.status(200).cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json (
    new ApiResponse(
      200,
      {
        user: LogedInUser,accessToken,refreshToken
      },
      "User loggedIn successfully"
    )
  )
});


const logOutUser = asyncHandler(async(req,res) => {
  
})
export {
  registerUser,
  loginUser
};