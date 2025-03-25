<p align="center">
  <img src="./intelLogo.png" alt="Intel Logo" width="100" style="border-radius: 50%;">
  <h1 align="center">Intel: AI-Optimized DeFi Staking Protocol</h1>
  <p align="center">Maximize your cUSD yields with intelligent, automated liquidity pool allocation</p>
</p>

## Introduction
Intel is an advanced AI-driven staking protocol that automatically allocates cUSD into optimal liquidity pools within the Celo ecosystem.

## Problem Statement

In the world of decentralized finance (DeFi), users often face challenges when trying to optimize their staking and liquidity pool allocations. These challenges include:
- **Complexity**: Manually identifying the best liquidity pools and adjusting stakes requires significant time and expertise.
- **Risk**: Without proper analysis, users may allocate funds to suboptimal pools, leading to lower returns or increased risks.
- **Lack of Automation**: Most existing solutions require constant manual intervention, which can be cumbersome and error-prone.

Intel addresses these issues by providing an automated, AI-driven solution that simplifies the process of staking and optimizing yields.

---

## Solution

Intel introduces an **AI-powered yield optimization protocol** specifically designed for the Celo ecosystem. The key features of Intel include:
- **Automated Allocation**: An intelligent algorithm continuously monitors market conditions and reallocates cUSD across liquidity pools to maximize returns.
- **Risk Management**: Advanced risk assessment ensures that funds are allocated only to low-risk, high-performance pools.
- **Real-Time Adjustments**: The AI agent dynamically adjusts allocations based on real-time data, ensuring optimal performance at all times.
- **User-Friendly Interface**: A simple and intuitive dashboard allows users to track their investments, earnings, and portfolio health effortlessly.

---

## Objectives

The primary objectives of Intel are:
1. **Maximize Returns**: Ensure users earn the highest possible yields on their cUSD stakes.
2. **Minimize Risk**: Protect user assets by avoiding volatile or underperforming liquidity pools.
3. **Simplify Staking**: Provide an easy-to-use platform that eliminates the need for manual intervention.
4. **Promote Accessibility**: Make advanced yield optimization tools accessible to everyone, regardless of technical expertise.

---

## Technologies Used

 1. **Frontend:** Nextjs, Tailwind CSS
 2. **Blockchain:** Celo
 3. **Blockchain integration:** ThirdWeb, Ethers.Js
 4. **ORM:** Prisma
 5. **API integration:** DeFiLlama API
 6. **Nebula AI:** To determine the best pool to stake to.

## Workflow

1. Using the DeFiLlama API, the platform fetchs all Celo-based liquidity pools that support cUSD.
2. Nebula AI analyzes and identifies the most profitable pool from the fetched data, optimizing returns.
3. User sends cUSD to the AI wallet. (Technically, this is sending to Intel smartContract address).
4. Intel AI agent sends funds from the smart contract to the best satking pool address.
5. When user withdraws(i.e Unstake) the ai agent withdraws from the staking pool, goes to the contract address then to the user.

## How Intel works

1. **Data Fetching** – The platform uses the DeFiLlama API to fetch all Celo-based liquidity pools supporting cUSD.

2. **AI Optimization** – Nebula AI analyzes the pools and selects the most profitable one.

3. **User Deposit** – Users deposit cUSD into their Intel wallet (Smart Contract Address).

4. **AI Staking** – The AI agent automatically stakes funds in the best available pool.

5. **Withdrawals** – When a user requests a withdrawal, the AI unstakes, routes funds back to the contract, and sends them to the user.

## Architecture visualization

%%{init: {'theme': 'forest', 'fontFamily': 'Arial', 'gantt': {'barHeight': 20}}}%%
flowchart TD
    A[DeFiLlama API] -->|1. Fetch Pool Data| B[Intel Backend]
    B -->|2. Analyze Metrics| C[Nebula AI Engine]
    C -->|3. Select Optimal Pool| D[Smart Contract]
    E[User Wallet] -->|4. Deposit cUSD| D
    D -->|5. Stake Funds| F[Best Liquidity Pool]
    F -->|6. Accumulate Yield| D
    D -->|7. Withdraw Funds| E
    
    subgraph Intel System
        B
        C
        D
    end
    
    style A fill:#6b46c1,color:white
    style E fill:#3182ce,color:white
    style F fill:#38a169,color:white
    style Intel System fill:#1a202c,color:white,stroke:#4a5568


## ✅ Successfully implemented Features

**=>** DeFiLlama API Integration – Fetches live liquidity pool data.
**=>** AI driven optimization - Using Nebula AI to determine the best pool.
**=>** Smart Contract deployment – Manages the staking to staking pools.
**=>** Real-Time Email Notifications – Keeps users updated on staking activities.
**=>** User-Friendly Dashboard – Allows users to see their portfolio.

## 🚧 Features under implementation

**AI-Driven Smart Contract Integration**
- Developing a smart account on Thirdweb, which will serve as the AI wallet. This will facilitate seamless fund transfers between the smart contract and staking pools, ensuring automated staking with zero friction.

**Intelligent Unstaking & Fund Reallocation**
- Implementing a cron job to continuously monitor liquidity pools for the most optimal staking opportunities. If a better pool is identified, the AI agent will dynamically unstake and reallocate funds to maximize returns.

**Enhanced UI/UX for a Superior User Experience**
- Refining the platform’s interface and interactions to deliver a more intuitive and engaging experience, ensuring smooth navigation and improved accessibility for all users



## Demo
1. To create your Intel account, visit our live website: [https://intel-mocha.vercel.app/](https://intel-mocha.vercel.app).
2. Watch our video demo here: [Video Link](https://www.loom.com/share/6deb4d5e09334255a1e5d154655fe437?sid=5685e50a-627d-4667-86a5-d4b8a57ebede).

---

## Getting Started

### Prerequisites
Before running the project locally, ensure you have the following installed:

- **Node.js**: Version 16 or higher.
- **npm**: Node Package Manager (comes with Node.js).

### Steps to Run Locally
1. Clone the repository to your machine:

   ```bash
   git clone https://github.com/jeffIshmael/Intel.git  

     ```
2. navigate into the project directory.

    ```bash 
     cd Intel/intelApp

     ```

3. Install the dependencies.

    ```bash  
     npm install 

     ```

4. Run the development server.

    ```bash 
     npm run dev 

     ```
---

## Contact
For any questions or feedback, feel free to reach out to us:

Email: [inteldevs@gmail.com](jeffianmuchiri24@gmail.com).