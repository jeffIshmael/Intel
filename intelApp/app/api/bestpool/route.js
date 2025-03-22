// import { getBestPool } from "@/scripts/Nebula.mjs";

// Handle POST requests
export async function POST(request) {
  try {
    const { stablecoinPools } = await request.json();

    if (!stablecoinPools || !Array.isArray(stablecoinPools)) {
      return new Response(JSON.stringify({ error: "Invalid input: stablecoinPools is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // const data = await getBestPool(stablecoinPools);
    const data = stablecoinPools;
    const match = data.match(/^(.+?) \[(.+?)\]\n(.+)$/);
    console.log(match);

    if (!match) {
      return NextResponse.json(
        { error: "Invalid AI response format", rawResponse: textData },
        { status: 500 }
      );
    }

    const bestPool = {
      name: match[1].trim(),
      id: match[2].trim(),
      reason: match[3].trim(),
    };
    console.log(bestPool);
    return new Response(JSON.stringify(bestPool), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching best pool:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Handle GET requests (optional)
export async function GET() {
  return new Response(JSON.stringify({ message: "Use POST to fetch the best pool" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}