"use server";

const JARVIS_SECRET = process.env.JARVIS_SECRET || "stark-neural-link-alpha-99";
const BODY_DOMAIN = process.env.BODY_DOMAIN || "body.cyberlabs.systems";
const HEAD_DOMAIN = process.env.HEAD_DOMAIN || "head.cyberlabs.systems";
const STATUS_TIMEOUT_MS = 12000;

export async function getJarvisStatus() {
  const cacheBuster = Date.now();

  // Try Body directly first (primary path — no Head Gateway needed)
  try {
    const bodyRes = await fetch(`https://${BODY_DOMAIN}/status?t=${cacheBuster}`, {
      headers: { "X-API-KEY": JARVIS_SECRET },
      cache: 'no-store',
      signal: AbortSignal.timeout(STATUS_TIMEOUT_MS),
    });
    if (bodyRes.ok) {
      const bodyData = await bodyRes.json();
      // Body returns { status, mode, connections, active_requests }
      // Normalize to the format the UI expects
      return {
        body_status: bodyData.status === "online" ? "RUNNING" : "OFFLINE",
        head_status: "STANDBY",
        systems_nominal: bodyData.status === "online",
        body_live: bodyData.status === "online",
        vm_state: bodyData.status === "online" ? "RUNNING" : "UNKNOWN",
      };
    }
  } catch {
    // Body unreachable
  }

  // Fallback: Try Head Gateway if Body is down
  try {
    const headRes = await fetch(`https://${HEAD_DOMAIN}/status?t=${cacheBuster}`, {
      headers: { "X-API-KEY": JARVIS_SECRET },
      cache: 'no-store',
      signal: AbortSignal.timeout(STATUS_TIMEOUT_MS),
    });
    if (headRes.ok) {
      return await headRes.json();
    }
  } catch {
    // Head also unreachable
  }

  // Both nodes unreachable
  return {
    body_status: "OFFLINE",
    head_status: "OFFLINE",
    systems_nominal: false,
  };
}

export async function startBody() {
  // Try Head Gateway to start Body VM (if Head is available)
  const HEAD_URL = `https://${HEAD_DOMAIN}/start_body`;
  try {
    const res = await fetch(HEAD_URL, {
      method: "POST",
      headers: { "X-API-KEY": JARVIS_SECRET },
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    return res.ok;
  } catch {
    console.error("Body activation failed: Head Gateway unreachable");
    return false;
  }
}

export async function chatWithJarvis(prompt: string, sessionId?: string | null) {
  // Talk directly to Body VM
  const BODY_URL = `https://${BODY_DOMAIN}/query`;

  try {
    const res = await fetch(BODY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": JARVIS_SECRET,
      },
      body: JSON.stringify({ prompt, session_id: sessionId }),
      cache: 'no-store',
      signal: AbortSignal.timeout(60000),
    });
    return await res.json();
  } catch (error) {
    console.error("Chat failed:", error);
    return {
      response: "Sir, the Body node is unreachable. The neural link may be offline.",
      status: "error",
    };
  }
}

export async function runVMScript() {
  const BODY_URL = `https://${BODY_DOMAIN}/run_script`;

  try {
    const res = await fetch(BODY_URL, {
      method: "POST",
      headers: { "X-API-KEY": JARVIS_SECRET },
      cache: 'no-store',
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
      cache: 'no-store',
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
      cache: 'no-store',
    });
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return [];
  }
}
