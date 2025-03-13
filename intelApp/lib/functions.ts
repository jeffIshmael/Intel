"use server";

//This file contains all the functions that involve use of ORM i.e Prisma
import prisma from "./db";

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
        aiBalance: true,
        privateKey: true,
        pools: {  // Include pools
          select: {
            id: true,
            name: true,
            poolSpec: true,
            amountStaked: true,
            createdAt: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.log("Error fetching user:", error);
    return null;
  }
}

//function to get the current staked pool
export async function getCurrentStakedPool(userId: number) {
  const pool = await prisma.pool.findFirst({
    where: { stakerId: userId },
    select: {
      name: true,
      amountStaked: true,
      poolSpec:true,
    },
  });

  return pool;
}

//function to create/update a staked pool
export async function updateStakedPool(
  userId: number,
  poolIdentifier: string,
  amount: bigint
) {
  // Check if the user has an existing pool with the same identifier
  const existingPool = await prisma.pool.findFirst({
    where: {
      stakerId: userId,
      poolSpec: poolIdentifier, // Pool Identifier (Unique)
    },
  });

  if (existingPool) {
    console.log(
      `Current Pool: ${existingPool.name}, Amount Staked: ${existingPool.amountStaked}`
    );

    // Update the existing pool's amountStaked by adding the new amount
    await prisma.pool.update({
      where: { id: existingPool.id },
      data: {
        amountStaked: existingPool.amountStaked + amount,
      },
    });

    console.log(
      `Updated Pool: ${existingPool.name}, New Amount Staked: ${
        existingPool.amountStaked + amount
      }`
    );
  } else {
    console.log(
      "User has no active staked pool with this identifier. Creating a new one..."
    );

    await prisma.pool.create({
      data: {
        name: "New AI Staking Pool",
        poolSpec: poolIdentifier, // Use the provided unique identifier
        amountStaked: amount,
        stakerId: userId,
      },
    });
    await prisma.user.update({
      where: { id: userId },
      data: {
        staked: true,
      },
    })

    console.log("New pool staked successfully.");
  }
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

//function to update ai wallet balance
export async function updateAIBalance(
  userId: number,
  amount: bigint,
  withdraw: boolean
) {
  try {
    let user;
    if (withdraw) {
      const result = await prisma.user.update({
        where: { id: userId },
        data: {
          aiBalance: {
            decrement: amount, // Add amount to existing balance
          },
        },
      });
      user = result;
    } else {
      const result = await prisma.user.update({
        where: { id: userId },
        data: {
          aiBalance: {
            increment: amount, // Add amount to existing balance
          },
        },
      });
      user = result;
    }

    console.log(`AI Balance updated: ${user.aiBalance}`);
    return user;
  } catch (error) {
    console.error("Error updating AI Balance:", error);
    throw error;
  }
}

//function to handle unstaking
export async function updateUnstaking(userId:number){
  try{
    //update user details
    const existingUser = await prisma.user.findUnique({
      where:{
        id:userId
      }
    })
    if(existingUser){
      await prisma.user.update({
        where:{
          id: existingUser.id
        },
        data:{
        staked: false,       
        }
      })
    }else{
      console.log("User not found.")
    }

  }catch(error){
    console.log(error);
  }
}
