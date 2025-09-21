// netlify/functions/ai.js
export async function handler(event, context) {
  try {
    const body = JSON.parse(event.body);

    // Gọi API Gemini (hoặc Google AI Studio)
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GENAI_API_KEY}` // Lấy từ Environment Variables
        },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
