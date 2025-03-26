"use server"

import nodemailer from "nodemailer";
import 'dotenv/config'; 


const intelEmail = process.env.INTEL_EMAIL as string;
const intelPass = process.env.INTEL_PASS as string;


if (!intelEmail || !intelPass) {
  console.warn("⚠️ Intel email and pass not found.");
  throw new Error("⚠️ Intel email and pass not found.");
} else {
  console.log("Email and Pass: Loaded successfully");
}


// Create a transporter object using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail", // Use Gmail as the email service
  auth: {
    user: intelEmail, 
    pass: intelPass, 
  },
});

// Function to send an email
export async function sendEmail(to:string, subject:string, text:string, html:string) {
  try {
    // Define email options
    const mailOptions = {
      from: intelEmail, // Sender address
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
