import 'dotenv/config'; // Load environment variables from .env file

const API_BASE_URL = "https://nebula-api.thirdweb.com";
const SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;

if (!SECRET_KEY) {
  console.warn("⚠️ THIRDWEB_SECRET_KEY is missing. Some features may not work.");
} else {
  console.log("Secret Key: Loaded successfully");
}

console.log("Secret Key: Loaded successfully");


async function apiRequest(endpoint, method, body = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-secret-key": SECRET_KEY,
    },
    body: Object.keys(body).length ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Response Error:", errorText);
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// Rest of your functions remain unchanged...

// Create a new Session
async function createSession(title = "Smart Contract Explorer") {
  const response = await apiRequest("/session", "POST", { title });
  const sessionId = response.result.id;

  return sessionId; // Return the session ID
}

// Query the smart contract
async function getBestPool(pools) {
  // Dynamically create the message for the query
  const formattedPools = pools
    .map(
      (pool) => `- ${pool.pool} (${pool.project}) [${pool.poolMeta || "No ID"}]`
    )
    .join("\n");
  console.log(formattedPools);
  const message = `Here are the pools I retrieved:\n\n${formattedPools}\n\nFrom the above pools, which pool is the best to stake on? Give just the name with the unique identifier in brackets. Then a reason on the next line.`;

  const requestBody = {
    message,
  };

  console.log("Query Contract Request Body:", requestBody);

  // Make the API request
  const response = await apiRequest("/chat", "POST", requestBody);

  console.log("Query Contract Response:", response);

  return response.message; // Return the structured response from Nebula
}

// Handle user messages (follow-up questions)
async function handleUserMessage(
  userMessage,
  sessionId,
  chainId,
  contractAddress
) {
  const response = await apiRequest("/chat", "POST", {
    message: userMessage,
    session_id: sessionId,
    context_filter: {
      chain_ids: [chainId.toString()], // Chain ID must be a string
      contract_addresses: [contractAddress],
    },
  });

  return response.message; // Nebula's reply
}

async function updateSession(sessionId, title, isPublic) {
  const requestBody = {
    title,
    is_public: isPublic,
  };

  const response = await apiRequest(
    `/session/${sessionId}`,
    "PUT",
    requestBody
  );

  console.log(`Session ${sessionId} updated:`, response);
  return response; // Returns the updated session details
}

async function clearSession(sessionId) {
  const response = await apiRequest(`/session/${sessionId}/clear`, "POST");

  console.log(`Session ${sessionId} cleared.`);
  return response; // Returns a confirmation or updated session status
}

async function deleteSession(sessionId) {
  const response = await apiRequest(`/session/${sessionId}`, "DELETE");

  console.log(`Session ${sessionId} deleted.`);
  return response; // Returns a confirmation
}

// Function to execute transaction

async function executeCommand(
  message,
  signerWalletAddress,
  userId = "default-user",
  stream = false,
  chainId,
  contractAddress,
  sessionId
) {
  const requestBody = {
    message,
    user_id: userId,
    stream,
    session_id: sessionId,
    execute_config: {
      mode: "client", // Only client mode is supported
      signer_wallet_address: signerWalletAddress,
    },
    context_filter: {
      chain_ids: [chainId.toString()], // Chain ID must be a string
      contract_addresses: [contractAddress],
    },
  };

  console.log("Execute Command Request Body:", requestBody);

  const response = await apiRequest("/execute", "POST", requestBody);

  console.log("Execute Command Response:", response);

  return response; // Return the full response including message and actions
}

export {
  createSession,
  getBestPool,
  handleUserMessage,
  updateSession,
  clearSession,
  deleteSession,
  executeCommand,
};
