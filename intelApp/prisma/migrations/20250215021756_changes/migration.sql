-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "address" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "passPhrase" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "aiBalance" BIGINT NOT NULL DEFAULT 0,
    "staked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "receiverId" INTEGER NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "txHash" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "senderId" INTEGER NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pool" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "poolSpec" TEXT NOT NULL,
    "amountStaked" BIGINT NOT NULL DEFAULT 0,
    "stakerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pool" ADD CONSTRAINT "Pool_stakerId_fkey" FOREIGN KEY ("stakerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
