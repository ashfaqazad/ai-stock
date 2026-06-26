import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request) {
  try {
    const { prompt, category } = await request.json();

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: `You are a professional stock photography metadata expert. 
          Generate SEO-optimized metadata for stock images.
          Always respond with valid JSON only, no extra text.`,
        },
        {
          role: "user",
          content: `Generate stock photo metadata for this image:
Category: ${category}
Description: ${prompt}

Return ONLY this JSON format:
{
  "title": "Professional stock photo title (max 100 chars)",
  "description": "Detailed description for stock sites (150-200 chars)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8", "keyword9", "keyword10"]
}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0].message.content;

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid JSON response from AI");
    }

    const metadata = JSON.parse(jsonMatch[0]);

    return Response.json({ success: true, metadata });
  } catch (error) {
    console.error("Groq API Error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
