const User = require("../Model/userModel")
const bcrypt = require("bcrypt")
const moment = require("moment")
const jwt = require("jsonwebtoken");
const secretKey = "kajdakdoermjsfsfskfjswoeidm";
const transporter = require("../config/emailConfig");
const cloudinary = require("../config/cloudinaryConfig");
const { welcomeEmailTemplate, loginEmailTemplate } = require("../utils/emailTemplates");

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: "udawatsudarshansingh@gmail.com", // Replace with your email
      to: to,
      subject: subject,
      html: html,
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Upload image to Cloudinary
const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'turf-booking',
      use_filename: true
    });
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

exports.createUser = async (req,res)=>{
  try {
      const { name, email, phone, password, otp, validTime, role } = req.body;

      //checking is data is not empty
      if (!(name && email && phone && password)) {
        return res.status(400).json({ msg: "all fields are required" });
      }

      // find that email is already exist or not
      const alreadyEmail = await User.findOne({ email });

      if (alreadyEmail) {
        return res.status(400).json({ msg: "email is already exist" });
      }

      // otp genreate function is created
      const genOtp = (length) => {
        const otp = Math.floor(Math.random(length) * Math.pow(10, length));
        return otp;
      };

      const newOtp = genOtp(4); // function is called
      console.log(newOtp);

      // otp time is created
      const otpTime = moment().format();

      // create hash password
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);

      const data = {
        name,
        email,
        phone,
        role,
        password: hash,
        otp: newOtp,
        validTime: otpTime,
      };

      const newUser = new User(data);
      await newUser.save();
      console.log(newUser)

      // Send welcome email
      const welcomeEmail = welcomeEmailTemplate(name);
      await sendEmail(email, 'Welcome to Turf Booking System!', welcomeEmail);
      console.log("email sent")
      return res
        .status(200)
        .json({ msg: "user created successfully", newUser });
  } catch (error) {
      return res.status(400).json({ error: error.message });
  }
}

exports.getUser = async(req,res) => {
   try {
     const result = await User.find();
     return res.status(200).json({ msg: "user get successfully", result });
   } catch (error) {
    return res.status(400).json({ error: error.message });
   }
}

exports.login = async (req,res)=>{
try {
    const { email, password} = req.body;

    const alreadyEmail = await User.findOne({ email });

    if (!alreadyEmail) {
      return res
        .status(400)
        .json({ msg: "user is not created , first signup " });
    }

    const dbpassword = alreadyEmail.password;
   

    const data = alreadyEmail;

    const match = await bcrypt.compare(password, dbpassword);

    if (!match) {
      return res.status(400).json({ msg: "password is not match" });
    }

    const token = jwt.sign({ email: alreadyEmail.email }, secretKey);
    console.log(token);

    // Send login notification email
    const loginTime = new Date().toLocaleString();
    const loginEmail = loginEmailTemplate(alreadyEmail.name, loginTime);
    await sendEmail(email, 'Login Notification - Turf Booking System', loginEmail);

    return res
      .status(200)
      .json({ msg: "User login successfully", data, token });
} catch (error) {
   console.error("Error in createUser:", error); // log it for debugging
   return res
     .status(500)
     .json({ error: error?.message || "Internal Server Error" });
}
}

exports.reset = async (req,res)=>{
const {email,oldPassword,newPassword} = req.body

const alreadyEmail = await User.findOne({email})

if(!alreadyEmail){
    return res.status(400).json({msg:"user is not created , first signup "})
}

const dbpassword = alreadyEmail.password
const id = alreadyEmail._id

const match = await bcrypt.compare(oldPassword,dbpassword)
if(!match){
    return res.status(400).json({msg:"password is incorrect"})
}

const salt = bcrypt.genSaltSync(10)
const hash = bcrypt.hashSync(newPassword,salt)

const data ={password:hash}

const result = await User.findOneAndUpdate(id,data,{new:true})

return res.status(200).json({msg:"paswword reset successfully",result})

}

exports.forgetPassword = async (req,res)=>{
const {email,newPassword} = req.body
const alreadyEmail = await User.findOne({email})
if (!alreadyEmail) {
  return res.status(400).json({ msg: "user is not created , first signup " });
}

const id = alreadyEmail._id

const salt = bcrypt.genSaltSync(10)
const hash = bcrypt.hashSync(newPassword,salt)

const data = {password:hash}

const result = await User.findByIdAndUpdate(id,data,{new:true})
return res.status(200).json({msg:"New Password genrated successfully",result})

}

// Update user profile with image
exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.user._id;
    
    let updateData = { name, email, phone };
    
    // Handle image upload if file is provided
    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file);
      updateData.image = imageUrl;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );
    
    return res.status(200).json({ 
      msg: "User updated successfully", 
      user: updatedUser 
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Delete user (only the user themselves can delete their account)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.user._id;
    
    await User.findByIdAndDelete(userId);
    
    return res.status(200).json({ msg: "User deleted successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('-password');
    
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};