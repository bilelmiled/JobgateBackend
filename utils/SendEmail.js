const nodemailer = require("nodemailer");

const sendEmail = async(email, subject,htmlMessage)=>{


    try {

const transporter = nodemailer.createTransport({
service: process.env.service,

  auth: {
    user: process.env.emailuser,
    pass: process.env.pass,
  },
});
// options for sending emails
const options = {

    from: '"Maddison Foo Koch" <maddison53@ethereal.email>',
    to: email,
    subject: subject,
    html: htmlMessage, // HTML body
}

// send email
await transporter.sendMail(options)
console.log("reset email sucessfully to: ", email) 
return true;
    } catch (error) {
        console.error("Error sending email:", error);
    }
    }
    module.exports = sendEmail