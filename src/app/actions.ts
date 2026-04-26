"use server";

const JARVIS_SECRET = process.env.JARVIS_SECRET || "stark-neural-link-alpha-99";
const HEAD_DOMAIN = process.env.HEAD_DOMAIN || "head.cyberlabs.systems";
const BODY_DOMAIN = process.env.BODY_DOMAIN || "body.cyberlabs.systems";

export async function getJarvisStatus() {
  const HEAD_URL = `https://${HEAD_DOMAIN}/status`;

  try {
    const res = await fetch(HEAD_URL, { 
      headers: { "X-API-KEY": JARVIS_SECRET },
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    if (!res.ok) throw new Error("Gateway error");
    return await res.json();
  } catch (error) {
    console.error("Status fetch failed:", error);
    return null;
  }
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

