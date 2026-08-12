export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured on Vercel."
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-5-mini",
          instructions:
            "You are Simmi, a friendly voice assistant. Answer clearly and briefly. If the user speaks Hindi or Hinglish, reply in the same language.",
          input: message,
          max_output_tokens: 500
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);

      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI request failed."
      });
    }

    const answer =
      data.output_text ||
      data.output?.flatMap(item =>
        item.content || []
      )
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("") ||
      "Sorry, I could not generate a response.";

    return res.status(200).json({
      reply: answer
    });

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: "Something went wrong on the server."
    });
  }
}
