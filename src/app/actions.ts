"use server";

const JARVIS_SECRET = process.env.JARVIS_SECRET || "stark-neural-link-alpha-99";
const HEAD_IP = process.env.HEAD_IP || "34.69.30.127";
const BODY_IP = process.env.BODY_IP || "34.93.105.44";

export async function getJarvisStatus() {
  const HEAD_URL = `http://${HEAD_IP}:8000/status`;

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
  const HEAD_URL = `http://${HEAD_IP}:8000/start_body`;

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
  const BODY_URL = `http://${BODY_IP}:8001/query`;

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
  const BODY_URL = `http://${BODY_IP}:8001/run_script`;

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

