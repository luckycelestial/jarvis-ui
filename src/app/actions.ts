"use server";

const JARVIS_SECRET = process.env.JARVIS_SECRET || "stark-neural-link-alpha-99";
const HEAD_DOMAIN = process.env.HEAD_DOMAIN || "head.cyberlabs.systems";
const BODY_DOMAIN = process.env.BODY_DOMAIN || "body.cyberlabs.systems";

export async function getJarvisStatus() {
  const cacheBuster = Date.now();
  const HEAD_URL = `https://${HEAD_DOMAIN}/status?t=${cacheBuster}`;

  let headData = null;

  // Ping Head
  try {
    const res = await fetch(HEAD_URL, { 
      headers: { "X-API-KEY": JARVIS_SECRET },
      cache: 'no-store',
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      headData = await res.json();
    } else {
      console.warn(`Head Gateway returned status: ${res.status}`);
    }
  } catch {
    console.error("Head status fetch failed (unreachable):", HEAD_DOMAIN);
  }

  // Note: We no longer ping Body directly from Vercel as it is internal (10.160.0.9)
  // The Head node handles the internal proxying.
  
  if (headData) {
    return headData;
  }

  // Fallback if Head is completely unreachable
  return {
    head_status: "OFFLINE",
    body_status: "OFFLINE",
    systems_nominal: false,
    body_live: false,
    vm_state: "OFFLINE",
    last_updated: new Date().toISOString()
  };
}

export async function startBody() {
  const HEAD_URL = `https://${HEAD_DOMAIN}/start_body`;

  try {
    const res = await fetch(HEAD_URL, { 
      method: "POST",
      headers: { "X-API-KEY": JARVIS_SECRET },
      cache: 'no-store'
    });
    return res.ok;
  } catch (error) {
    console.error("Body activation failed:", error);
    return false;
  }
}

export async function chatWithJarvis(prompt: string, sessionId?: string | null) {
  const HEAD_URL = `https://${HEAD_DOMAIN}/chat`;

  try {
    const res = await fetch(HEAD_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-API-KEY": JARVIS_SECRET
      },
      body: JSON.stringify({ prompt, session_id: sessionId }),
      cache: 'no-store'
    });
    return await res.json();
  } catch (error) {
    console.error("Chat failed:", error);
    return { response: "Sir, the neural link to the Head Gateway is unstable.", status: "error" };
  }
}

export async function runVMScript() {
  const BODY_URL = `https://${BODY_DOMAIN}/run_script`;

  try {
    const res = await fetch(BODY_URL, {
      method: "POST",
      headers: { "X-API-KEY": JARVIS_SECRET },
      cache: 'no-store'
    });
    return await res.json();
  } catch {
    return { success: false, error: "Neural link timeout." };
  }
}
export async function getChatSessions() {
  const BODY_URL = `https://${BODY_DOMAIN}/sessions`;
  try {
    const res = await fetch(BODY_URL, {
      headers: { "X-API-KEY": JARVIS_SECRET },
      cache: 'no-store'
    });
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return [];
  }
}

export async function getChatMessages(sessionId: string) {
  const BODY_URL = `https://${BODY_DOMAIN}/messages/${sessionId}`;
  try {
    const res = await fetch(BODY_URL, {
      headers: { "X-API-KEY": JARVIS_SECRET },
      cache: 'no-store'
    });
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return [];
  }
}
