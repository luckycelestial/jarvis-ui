"use server";

export async function getJarvisStatus() {
  const HEAD_IP = "34.69.30.127";
  const HEAD_URL = `http://${HEAD_IP}:8000/status`;

  try {
    const res = await fetch(HEAD_URL, { 
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    if (!res.ok) throw new Error("Gateway error");
    return await res.ok ? await res.json() : null;
  } catch (error) {
    console.error("Status fetch failed:", error);
    return null;
  }
}

export async function startBrain() {
  const HEAD_IP = "34.69.30.127";
  const HEAD_URL = `http://${HEAD_IP}:8000/start_brain`;

  try {
    const res = await fetch(HEAD_URL, { 
      method: "POST",
      cache: 'no-store'
    });
    return res.ok;
  } catch (error) {
    console.error("Brain activation failed:", error);
    return false;
  }
}
