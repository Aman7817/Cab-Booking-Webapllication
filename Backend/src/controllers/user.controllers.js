import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefershToken = async(userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken;

    await user.save({validateBeforeSave: false})

    return {accessToken,refreshToken}

  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError(501,"somthing went wrong while genreating access and regresh token")
  }
}

const registerUser = asyncHandler(async(req,res) => {
  console.log("Request Body:", req.body); // Debugging line
  const {username,fullname,password,phone,email,role} = req.body;

   // debug ke liye
  console.log("Username:", username);
  console.log("Email:", email);

   // debug ke liye

  // Step 1 if user all required fileds are provided
  if (
    [fullname,email,password,username,phone,role].some((field) =>field?.trim() === "")
  ) {
    throw new ApiError(400,"All fields are required");
    
  }
  // Step 2 
  const existingUser = await User.findOne({
    $or: [{username: username.toLowerCase()},{email}]
  });

  if (existingUser) {
    throw new ApiError(409,"User with this email or username already  exists");

    
  }
 // const avatarLocalPath = req.files?.avatar[0]?.path ||  "default-avatar.jpg";
  //if (!avatarLocalPath) {
    //throw new ApiError(400,"Avatar is required");
    
 // }

  const newUser = await User.create({
    fullName: fullname,
    //avatar:  avatarLocalPath, // Default avatar assigned // avatar.url,
    email,
    password,
    phone,
    username: username.toLowerCase(),
    role 
  });

  const CreatedUser =  await User.findById(newUser._id).select("-password -refershToken");
  
  if(!CreatedUser){
    throw new ApiError(500, "somthing went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200,"User registerd succesfully")
  );


});

const loginUser = asyncHandler(async(req,res) => {
  console.log("request body",req.body);
  
  // step 1
  const {username,email,password,phone} = req.body;
  // step 2
  if(!username && !email && !phone){
    throw new ApiError(400,"username or email and phone is required")
  }

  // step3 
  const user = await User.findOne({
    $or: [{username},{email},{phone}]
  }).select("+password");
  console.log("User found:", user);
  if(!user || !user.password){
    throw new ApiError(404,"User not found or password missing");

  }

  // step 4 
  const isPasswordValid = await user.isPasswordCorrect(password);
  if(!isPasswordValid){
  throw new ApiError(401,"wrong password")
  }
  // step 5 genreate accessToken and refresh token
  const {accessToken,refreshToken} = await generateAccessAndRefershToken(user._id)

  const LogedInUser = await User.findById(user._id).lean();
  delete LogedInUser.password;
  delete LogedInUser.refreshToken;
  // set cookie and return response
  const options = {
    httpOnly: true,
    secure: true
  };
  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
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
 try {
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
   };
 
   return res
   .status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(
     new ApiResponse(200, {},"User logout successfully")
   )
 } catch (error) {
    // Handle any errors
    throw new ApiError(500, "Something went wrong during logout");
 }

  
})
export {
  registerUser,
  loginUser,
  logOutUser
};