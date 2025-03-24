const nodemailer = require("nodemailer");

// Create a transporter object using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail", // Use Gmail as the email service
  auth: {
    user: "intelai24@gmail.com", // Your Gmail address
    pass: "exhi ycwr wtuo iphk", // Your Gmail app password
  },
});

// Function to send an email
export async function sendEmail(to:string, subject:string, text:string, html:string) {
  try {
    // Define email options
    const mailOptions = {
      from: "intelai24@gmail.com", // Sender address
      to, // Recipient address
      subject, // Subject line
      text, // Plain text body
      html, // HTML body
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
