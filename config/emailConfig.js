const nodemailer = require('nodemailer');

 const transporter = nodemailer.createTransport({
   host: "smtp.gmail.com",
   auth: {
     user: "udawatsudarshansingh@gmail.com",
     pass: "qqyz dabh pshe ktrc",
   },
 });

module.exports = transporter; 