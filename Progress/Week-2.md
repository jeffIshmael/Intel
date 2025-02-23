# Week 2 Progress Report 

### Date: [17 Feb 2025] - [23 Feb 2025]

## **Goals for the Week**  
- Enable users to manually stake cUSD into chosen liquidity pools.  
- Start designing the AI agent to evaluate and stake funds automatically. 
- Implement authentication for secure user access.   
- Improve the frontend UI/UX based on user testing.  

## **Achievements**  
✅ Implemented manual staking functionality.   
✅ Defined core AI logic for automated staking pool selection. 
✅ Implemented user authentication. 
✅ Improved frontend design and responsiveness. 

## **Challenges & Solutions**

- ***Challenge:*** After connecting their wallet, users were unable to stake in some pools. 
  *Explanation:* Uniswap V3 pools operate differently from Uniswap V2, requiring NFT-based liquidity positions instead of direct token staking. 
  ***Solution:*** For Uniswap V3 pools, we provide users with a direct link to stake through the Uniswap platform, while Uniswap V2 pools remain accessible directly through Intel.

- ***Challenge:*** The AI agent needs permission to stake and manage funds autonomously.  
  ***Solution:*** We introduced an authentication mechanism where users are assigned a dedicated wallet. This allows the AI agent to execute staking transactions securely using a private key.

- ***Challenge:*** Choosing the most secure and scalable authentication method.  
  ***Solution:***  Implemented NextAuth.js, which offers a seamless and secure authentication experience while being easy to integrate.  

## **Next Steps**  
- Implement AI agent for automated staking.  
- Enable AI to unstake from underperforming pools and reallocate funds.  
