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
      from: 'your-email@gmail.com', // Replace with your email
      to: to,
      subject: subject,
      html: html
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

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email template
const sendOTPEmail = (userName, otp) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset OTP</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .otp-box { background: #fff; border: 2px solid #dc3545; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #dc3545; }
        .footer { text-align: center; padding: 20px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Reset OTP</h1>
        </div>
        <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>You have requested to reset your password. Please use the following OTP to complete the process:</p>
            <div class="otp-box">
                <div class="otp-code">${otp}</div>
            </div>
            <p><strong>Important:</strong></p>
            <ul>
                <li>This OTP is valid for 10 minutes only</li>
                <li>Do not share this OTP with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
            </ul>
        </div>
        <div class="footer">
            <p>Best regards,<br>The Turf Booking Team</p>
        </div>
    </div>
</body>
</html>
`;

exports.createUser = async (req,res)=>{
  try {
      const { name, email, phone, password, role } = req.body;

      //checking is data is not empty
      if (!(name && email && phone && password)) {
        return res.status(400).json({ msg: "all fields are required" });
      }

      // find that email is already exist or not
      const alreadyEmail = await User.findOne({ email });

      if (alreadyEmail) {
        return res.status(400).json({ msg: "email is already exist" });
      }

      // create hash password
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);

      let userData = {
        name,
        email,
        phone,
        role,
        password: hash,
      };

      // Handle image upload if file is provided
      if (req.file) {
        const imageUrl = await uploadToCloudinary(req.file);
        userData.image = imageUrl;
      }

      const newUser = new User(userData);
      await newUser.save();

      // Send welcome email
      const welcomeEmail = welcomeEmailTemplate(name);
      await sendEmail(email, 'Welcome to Turf Booking System!', welcomeEmail);

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

// Verify credentials and send OTP for password reset
exports.verifyCredentialsAndSendOTP = async (req, res) => {
  try {
    const { email, oldPassword } = req.body;
    
    if (!email || !oldPassword) {
      return res.status(400).json({ msg: "Email and old password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Verify old password
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(400).json({ msg: "Old password is incorrect" });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with OTP
    await User.findByIdAndUpdate(user._id, {
      otp: otp,
      validTime: otpExpiry
    });

    // Send OTP email
    const otpEmail = sendOTPEmail(user.name, otp);
    await sendEmail(email, 'Password Reset OTP - Turf Booking System', otpEmail);

    return res.status(200).json({ 
      msg: "Credentials verified and OTP sent successfully to your email",
      email: email 
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Send OTP for forget password
exports.sendForgetOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with OTP
    await User.findByIdAndUpdate(user._id, {
      otp: otp,
      validTime: otpExpiry
    });

    // Send OTP email
    const otpEmail = sendOTPEmail(user.name, otp);
    await sendEmail(email, 'Password Reset OTP - Turf Booking System', otpEmail);

    return res.status(200).json({ 
      msg: "OTP sent successfully to your email",
      email: email 
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Verify OTP for password reset (Step 1)
exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ msg: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (new Date() > user.validTime) {
      return res.status(400).json({ msg: "OTP has expired" });
    }

    // Clear OTP from database after successful verification
    await User.findByIdAndUpdate(user._id, {
      otp: null,
      validTime: null
    });

    return res.status(200).json({ 
      msg: "OTP verified successfully. You can now change your password.",
      email: email 
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Verify OTP for forget password (Step 1)
exports.verifyForgetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ msg: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (new Date() > user.validTime) {
      return res.status(400).json({ msg: "OTP has expired" });
    }

    // Clear OTP from database after successful verification
    await User.findByIdAndUpdate(user._id, {
      otp: null,
      validTime: null
    });

    return res.status(200).json({ 
      msg: "OTP verified successfully. You can now change your password.",
      email: email 
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Change password after reset OTP verification (Step 2)
exports.changeResetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ msg: "Email and new password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Hash new password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);

    // Update password
    await User.findByIdAndUpdate(user._id, {
      password: hash
    });

    return res.status(200).json({ msg: "Password changed successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Change password after forget OTP verification (Step 2)
exports.changeForgetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ msg: "Email and new password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Hash new password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);

    // Update password
    await User.findByIdAndUpdate(user._id, {
      password: hash
    });

    return res.status(200).json({ msg: "Password changed successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

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