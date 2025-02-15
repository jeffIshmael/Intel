import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { ethers } from "ethers";

const prisma = new PrismaClient();

export const POST = async (req: Request) => {
  try {
    const body = await req.json(); // Parse request body
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const randomWallet = ethers.Wallet.createRandom();

    // Create new user
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        address: randomWallet.address,
        privateKey: randomWallet.signingKey.privateKey,
        passPhrase: randomWallet.mnemonic?.phrase ?? "",
      },
    });

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
};
