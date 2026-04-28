import { NextRequest } from "next/server";

const JARVIS_SECRET = process.env.JARVIS_SECRET || "stark-neural-link-alpha-99";
const BODY_DOMAIN = process.env.BODY_DOMAIN || "body.cyberlabs.systems";

export async function POST(req: NextRequest) {
  const { prompt, session_id } = await req.json();

  if (!prompt) {
    return new Response("Missing prompt", { status: 400 });
  }

  // Stream directly from Body VM
  const BODY_URL = `https://${BODY_DOMAIN}/api/chat/stream`;

  try {
    const response = await fetch(BODY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": JARVIS_SECRET,
      },
      body: JSON.stringify({ prompt, session_id }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        return new Response(`Body Gateway Error: ${errorText}`, { status: response.status });
    }

    // Return the stream directly to the client
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Streaming Proxy Error:", error);
    return new Response(`Sir, the neural link is unstable: ${error.message}`, { status: 500 });
  }
}
