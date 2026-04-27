"use server";

const JARVIS_SECRET = process.env.JARVIS_SECRET || "stark-neural-link-alpha-99";
const HEAD_DOMAIN = process.env.HEAD_DOMAIN || "head.cyberlabs.systems";
const BODY_DOMAIN = process.env.BODY_DOMAIN || "body.cyberlabs.systems";

export async function getJarvisStatus() {
  const cacheBuster = Date.now();
  const HEAD_URL = `https://${HEAD_DOMAIN}/status?t=${cacheBuster}`;
  const BODY_URL = `https://${BODY_DOMAIN}/status?t=${cacheBuster}`;

  let headData = null;
  let bodyLive = false;

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
  } catch (error) {
    console.error("Head status fetch failed (unreachable):", HEAD_DOMAIN);
  }

  // Ping Body directly from Vercel
  try {
    const res = await fetch(BODY_URL, { 
      headers: { "X-API-KEY": JARVIS_SECRET },
      cache: 'no-store',
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) bodyLive = true;
  } catch (error) {
    // console.log("Body node not yet reachable via public tunnel.");
  }

  // If Head couldn't reach Body but Vercel can, override the status!
  if (headData) {
    if (bodyLive) {
      headData.body_live = true;
      headData.body_status = "RUNNING";
      headData.systems_nominal = true;
    }
    return headData;
  }

  // Fallback if Head is completely unreachable
  return {
    head_status: "OFFLINE",
    body_status: bodyLive ? "RUNNING" : "OFFLINE",
    systems_nominal: bodyLive,
    body_live: bodyLive,
    vm_state: bodyLive ? "RUNNING" : "OFFLINE",
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

export async function chatWithJarvis(prompt: string) {
  const BODY_URL = `https://${BODY_DOMAIN}/query`;

  try {
    const res = await fetch(BODY_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-API-KEY": JARVIS_SECRET
      },
      body: JSON.stringify({ prompt }),
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
  } catch (error) {
    console.error("Script execution failed:", error);
    return { success: false, error: "Neural link timeout." };
  }
}

