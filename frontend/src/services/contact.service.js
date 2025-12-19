const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const submitContact = async (payload) => {
  try {
    const response = await fetch(`${API_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMsg = "Failed to submit message";

      try {
        const err = await response.json();
        errorMsg = err?.message || errorMsg;
      } catch {
        // Ignore JSON parsing errors
      }

      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (err) {
    console.error("❌ Contact API fetch failed:", err);
    throw new Error(err.message || "Backend not reachable");
  }
};
