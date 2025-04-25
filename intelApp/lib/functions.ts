"use server";

//This file contains all the functions that involve use of ORM i.e Prisma
import prisma from "./db";
import { sendEmail } from "../app/actions/EmailService";

//function to get a user's details
export async function getUser(userId: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        address: true,
        email: true,
        passPhrase: true,
        staked: true,
        privateKey: true,
        emailed: true,
      },
    });

    return user;
  } catch (error) {
    console.log("Error fetching user:", error);
    return null;
  }
}

//function to get the current  pool
export async function getCurrentPool() {
  const pool = await prisma.pool.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 1,
  });
  return pool[0];
}

//function to create/update a staked pool
export async function updatePool(poolIdentifier: string, poolName: string) {
  // Check if its the same pool
  const existingPool = await prisma.pool.findFirst({
    where: {
      poolSpec: poolIdentifier,
    },
  });

  if (existingPool) {
    console.log(`Current Pool: ${existingPool.name}`);
    return;
  }

  await prisma.pool.create({
    data: {
      name: poolName,
      poolSpec: poolIdentifier,
    },
  });

  console.log("New pool successfully updated.");
}

//function update user's emailed status
export async function updateUserEmailedStatus(email: string) {
  await prisma.user.update({
    where: { email: email },
    data: { emailed: true, staked: true },
  });
}

//function to create a transaction
export async function createTransaction(
  senderId: number,
  txHash: string,
  message: string,
  amount: number
) {
  try {
    const transaction = await prisma.transaction.create({
      data: {
        txHash,
        message,
        amount,
        senderId,
      },
    });
    console.log("Transaction created:", transaction);
    return transaction;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}

//function to get transactions from a user
export async function getUserTransactions(userId: number) {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { senderId: userId },
      orderBy: { time: "desc" }, // Newest first
    });
    return transactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
}

//function to create notification
export async function createNotification(
  receiverId: number,
  title: string,
  content?: string
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        title,
        content,
        receiverId,
      },
    });
    console.log("Notification created:", notification);
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

//function to get notifications for a user
export async function getUserNotifications(userId: number) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { receiverId: userId },
      orderBy: { id: "desc" }, // Get latest first
    });
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

//function to send email to all staked users( will happen if a the AI reallocates the funds)
export async function sendEmailToAllStakedUsers() {
  try {
    const stakedUsers = await prisma.user.findMany({
      where: { staked: true },
      select: { email: true },
    });
    // Loop through each staked user and send an email
    for (const user of stakedUsers) {
      const email = user.email;
      const subject = "Intel AI Has Successfully Staked to Moola Market!";

      const text = `Dear Valued User,
      
      We are excited to inform you that Intel AI has successfully staked to Moola Market. 
      Your trust and participation in our platform are truly appreciated.
      
      By staking, you contribute to a secure and thriving ecosystem while gaining exclusive 
      benefits within the Moola Market staking Pool.
      
      Thank you for being a part of this journey with us.
      
      Best regards,  
      Intel AI Team`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2c3e50;">Intel AI Has Successfully Staked to Moola Market!</h2>
          <p style="font-size: 16px; color: #555;">
            Dear Valued User,  
          </p>
          <p style="font-size: 16px; color: #555;">
            We are excited to inform you that <b>Intel AI</b> has successfully staked to <b>Moola Market</b>. 
            Your trust and participation in our platform are truly appreciated.
          </p>
          <p style="font-size: 16px; color: #555;">
            By staking, you contribute to a <b>secure</b> and <b>thriving ecosystem</b> while gaining exclusive 
            benefits within the Moola Market community.
          </p>
          <p style="font-size: 16px; color: #555;">
            Thank you for being a part of this journey with us.
          </p>
          <p style="font-size: 16px; color: #555;">
            Best regards,  
            <br>
            <strong>Intel AI Team</strong>
          </p>
        </div>
      `;

      await sendEmail(email, subject, text, html);
      console.log(`Email sent to ${email}`);
    }

    console.log("Emails sent to all staked users.");
  } catch (error) {
    console.log(error);
  }
}

//tells the user that the amount has been received successfully
export async function sendConfirmationEmail(userId: number, amount: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (user) {
      const email = user.email;
      const subject = "Your Transfer to Intel AI Wallet Was Successful!";

      const text = `Dear Valued User,
      
      We're pleased to confirm that your recent transfer of ${amount} cUSD to your Intel AI wallet was successful.
      
      The amount you sent has been securely received and is now ready for Intel AI to begin intelligent staking on your behalf.
      
      Thank you for trusting Intel to manage your assets smartly and efficiently.
      
      Best regards,  
      Intel AI Team`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2c3e50;">Your Transfer to Intel AI Wallet Was Successful!</h2>
          <p style="font-size: 16px; color: #555;">
            Dear Valued User,
          </p>
          <p style="font-size: 16px; color: #555;">
            We're pleased to confirm that your recent transfer to your <strong>Intel AI wallet</strong> was successful.
          </p>
          <p style="font-size: 16px; color: #555;">
            The amount has been securely received and is now ready for our AI agent to begin <strong>smart, automated staking</strong> on your behalf.
          </p>
          <p style="font-size: 16px; color: #555;">
            Thank you for choosing Intel — where staking is smarter and simpler.
          </p>
          <p style="font-size: 16px; color: #555;">
            Best regards,  
            <br>
            <strong>Intel AI Team</strong>
          </p>
        </div>
      `;

      await sendEmail(email, subject, text, html);
      console.log(`Email sent to ${email}`);
    }

    console.log("Confirmatory email sent to the user..");
  } catch (error) {
    console.log(error);
  }
}

// tells the user that te AI has staked.
export async function sendStakingEmail(email: string) {
  try {
    const subject = "Intel AI Has Successfully Staked to Moola Market!";

    const text = `Dear Valued User,
      
      We are excited to inform you that Intel AI has successfully staked to Moola Market. 
      Your trust and participation in our platform are truly appreciated.
      
      By staking, you contribute to a secure and thriving ecosystem while gaining exclusive 
      benefits within the Moola Market staking Pool.
      
      Thank you for being a part of this journey with us.
      
      Best regards,  
      Intel AI Team`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2c3e50;">Intel AI Has Successfully Staked to Moola Market!</h2>
          <p style="font-size: 16px; color: #555;">
            Dear Valued User,  
          </p>
          <p style="font-size: 16px; color: #555;">
            We are excited to inform you that <b>Intel AI</b> has successfully staked to <b>Moola Market</b>. 
            Your trust and participation in our platform are truly appreciated.
          </p>
          <p style="font-size: 16px; color: #555;">
            By staking, you contribute to a <b>secure</b> and <b>thriving ecosystem</b> while gaining exclusive 
            benefits within the Moola Market community.
          </p>
          <p style="font-size: 16px; color: #555;">
            Thank you for being a part of this journey with us.
          </p>
          <p style="font-size: 16px; color: #555;">
            Best regards,  
            <br>
            <strong>Intel AI Team</strong>
          </p>
        </div>
      `;

    await sendEmail(email, subject, text, html);
    await updateUserEmailedStatus(email);
    console.log(`Email sent to ${email}`);
    console.log("Staking email sent to the user.");
  } catch (error) {
    console.log(error);
  }
}

//funtion to return only the emails of users who are not emailed frm an array of user addressses
export async function getUnemailedUsers(userAddresses: string[]) {
  const unemailedUsers = await prisma.user.findMany({
    where: { address: { in: userAddresses }, emailed: false },
    select: { email: true },
  });
  return unemailedUsers.map((user) => user.email);
}
