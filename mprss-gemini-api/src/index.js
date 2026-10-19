
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Use POST to analyze a motorcycle." }, 405);
    }

    if (!env.GEMINI_API_KEY) {
      return jsonResponse({ error: "Gemini API key is not configured." }, 500);
    }

    try {
      const { mode, motorcycle, goal, notes, selectedParts, inventory } =
        await request.json();

      if (!motorcycle || !mode) {
        return jsonResponse(
          { error: "Motorcycle and analysis mode are required." },
          400
        );
      }

      const prompt = `
You are the motorcycle compatibility and safety assistant for MPRSS.
Give practical, cautious advice. Never claim a modification is safe without
sufficient specifications. Flag uncertain compatibility and recommend
professional inspection when needed.

Analysis mode: ${mode}
Motorcycle: ${JSON.stringify(motorcycle)}
Goal: ${goal || "Not specified"}
Notes: ${notes || "None"}
Selected parts: ${JSON.stringify(selectedParts || [])}
Available inventory: ${JSON.stringify(inventory || [])}

Return ONLY valid JSON in this structure:
{
  "type": "recommendation",
  "status": "Safe, Warning, or Dangerous",
  "riskLevel": "safe, warning, or dangerous",
  "compatibility": "Short compatibility assessment",
  "summary": "Brief explanation",
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}

Be specific to the supplied motorcycle and parts. Do not invent specifications.
If information is missing, state what must be verified.
`;

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return jsonResponse(
          { error: "Gemini request failed.", details: result.error?.message },
          response.status
        );
      }

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        return jsonResponse({ error: "Gemini returned an empty response." }, 502);
      }

      return jsonResponse(JSON.parse(text));
    } catch (error) {
      return jsonResponse(
        { error: "Unable to analyze the motorcycle.", details: error.message },
        500
      );
    }
  },
};
