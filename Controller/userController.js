const User = require("../Model/userModel")
const bcrypt = require("bcrypt")
const moment = require("moment")
const jwt = require("jsonwebtoken");
const secretKey = "kajdakdoermjsfsfskfjswoeidm";

exports.createUser = async (req,res)=>{
    const { name, email, phone, password, otp, validTime,role } = req.body;
    
    //checking is data is not empty
    if(!(name && email && phone && password)){
        return res.status(400).json({ msg: "all fields are required" }); 
    }
    
    // find that email is already exist or not
    const alreadyEmail = await User.findOne({email})

    if(alreadyEmail){
        return res.status(400).json({msg:"email is already exist"})
    }

    // otp genreate function is created 
    const genOtp = (length)=>{
        const otp = Math.floor(Math.random(length)*Math.pow(10,length))
        return otp
    }

    const newOtp = genOtp(4) // function is called
    console.log(newOtp);
    
    // otp time is created
    const otpTime = moment().format()

    // create hash password 
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(password,salt)
    

    const data = {name,email,phone,role,password:hash,otp:newOtp,validTime:otpTime}

    const newUser = new User(data)
    await newUser.save()

    return res.status(200).json({msg:"user created successfully",newUser})
}

exports.getUser = async(req,res) => {
    const result = await User.find()
    return res.status(200).json({msg:"user get successfully",result})
}

exports.login = async (req,res)=>{
const {email,password,otp} =req.body

const alreadyEmail = await User.findOne({email})

if(!alreadyEmail){
    return res.status(400).json({msg:"user is not created , first signup "})
}

const dbpassword = alreadyEmail.password
const dbotp = alreadyEmail.otp

const otpTime = alreadyEmail.validTime

const data = alreadyEmail

const match = await bcrypt.compare(password,dbpassword)

if(!match){
    return res.status(400).json({msg:"password is not match"})
}

const token = jwt.sign({ email: alreadyEmail.email }, secretKey);
console.log(token);

if(otp===dbotp){
    const current = moment()
    const timeValid = current.diff(otpTime,"minutes")
    console.log("otp valid time",timeValid);

    if(timeValid>10){
        return res.status(400).json({msg:"Otp is expire , please genrate new otp"})
    }

    return res
      .status(200)
      .json({ msg: "otp is matched,User login successfully" ,data,token});
}
else{
    return res
      .status(400)
      .json({ msg: "Otp is invalid or not matched" });
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