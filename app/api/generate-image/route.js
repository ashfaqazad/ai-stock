import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request) {
  try {
    // API key check
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_groq_api_key_here") {
      return Response.json(
        { success: false, error: "GROQ_API_KEY not set! Please add your real Groq API key in .env.local file." },
        { status: 500 }
      );
    }

    const { prompt, category, style } = await request.json();

    // Step 1: Groq se enhanced image prompt banao
    const promptEnhancement = await groq.chat.completions.create({
      // model: "llama3-8b-8192",
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content: `You are an expert AI image prompt engineer specializing in stock photography.
Your job is to convert a simple user description into a highly detailed, specific image generation prompt.
Rules:
- Be very specific about lighting, composition, colors, mood
- Include camera settings style (e.g. 85mm lens, shallow depth of field)
- Mention specific details that make it look professional
- Keep it under 200 words
- Return ONLY the enhanced prompt, nothing else, no explanations`,
        },
        {
          role: "user",
          content: `Create a detailed image generation prompt for this stock photo:
Category: ${category}
Style: ${style}
Description: ${prompt}

Enhanced prompt:`,
        },
      ],
      temperature: 0.8,
      max_tokens: 300,
    });

    const enhancedPrompt = promptEnhancement.choices[0].message.content.trim();

    // Step 2: Pollinations ko enhanced prompt bhejo
    const seed = Math.floor(Math.random() * 999999);
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=800&seed=${seed}&nologo=true&model=flux`;

    // Step 3: Metadata bhi Groq se generate karo
    const metadataCompletion = await groq.chat.completions.create({
      // model: "llama3-8b-8192",
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content: `You are a professional stock photography metadata expert.
Generate SEO-optimized metadata for stock images.
Always respond with valid JSON only, no extra text, no markdown backticks.`,
        },
        {
          role: "user",
          content: `Generate stock photo metadata for:
Category: ${category}
Description: ${prompt}
Style: ${style}

Return ONLY this JSON:
{
  "title": "Professional stock photo title (max 100 chars)",
  "description": "Detailed description for stock sites (150-200 chars)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8", "keyword9", "keyword10", "keyword11", "keyword12"]
}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const metaContent = metadataCompletion.choices[0].message.content;
    const jsonMatch = metaContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid metadata JSON");

    const metadata = JSON.parse(jsonMatch[0]);

    return Response.json({
      success: true,
      imageUrl,
      enhancedPrompt,
      metadata,
    });
  } catch (error) {
    console.error("Generate Image Error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}





















// import Groq from "groq-sdk";

// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY,
// });

// export async function POST(request) {
//   try {
//     // API key check
//     if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_groq_api_key_here") {
//       return Response.json(
//         { success: false, error: "GROQ_API_KEY not set! Please add your real Groq API key in .env.local file." },
//         { status: 500 }
//       );
//     }

//     const { prompt, category, style } = await request.json();

//     // Step 1: Groq se enhanced image prompt banao
//     const promptEnhancement = await groq.chat.completions.create({
//       model: "llama3-8b-8192",
//       messages: [
//         {
//           role: "system",
//           content: `You are an expert AI image prompt engineer specializing in stock photography.
// Your job is to convert a simple user description into a highly detailed, specific image generation prompt.
// Rules:
// - Be very specific about lighting, composition, colors, mood
// - Include camera settings style (e.g. 85mm lens, shallow depth of field)
// - Mention specific details that make it look professional
// - Keep it under 200 words
// - Return ONLY the enhanced prompt, nothing else, no explanations`,
//         },
//         {
//           role: "user",
//           content: `Create a detailed image generation prompt for this stock photo:
// Category: ${category}
// Style: ${style}
// Description: ${prompt}

// Enhanced prompt:`,
//         },
//       ],
//       temperature: 0.8,
//       max_tokens: 300,
//     });

//     const enhancedPrompt = promptEnhancement.choices[0].message.content.trim();

//     // Step 2: Pollinations ko enhanced prompt bhejo
//     const seed = Math.floor(Math.random() * 999999);
//     const encodedPrompt = encodeURIComponent(enhancedPrompt);
//     const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=800&seed=${seed}&nologo=true&model=flux`;

//     // Step 3: Metadata bhi Groq se generate karo
//     const metadataCompletion = await groq.chat.completions.create({
//       model: "llama3-8b-8192",
//       messages: [
//         {
//           role: "system",
//           content: `You are a professional stock photography metadata expert.
// Generate SEO-optimized metadata for stock images.
// Always respond with valid JSON only, no extra text, no markdown backticks.`,
//         },
//         {
//           role: "user",
//           content: `Generate stock photo metadata for:
// Category: ${category}
// Description: ${prompt}
// Style: ${style}

// Return ONLY this JSON:
// {
//   "title": "Professional stock photo title (max 100 chars)",
//   "description": "Detailed description for stock sites (150-200 chars)",
//   "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8", "keyword9", "keyword10", "keyword11", "keyword12"]
// }`,
//         },
//       ],
//       temperature: 0.7,
//       max_tokens: 500,
//     });

//     const metaContent = metadataCompletion.choices[0].message.content;
//     const jsonMatch = metaContent.match(/\{[\s\S]*\}/);
//     if (!jsonMatch) throw new Error("Invalid metadata JSON");

//     const metadata = JSON.parse(jsonMatch[0]);

//     return Response.json({
//       success: true,
//       imageUrl,
//       enhancedPrompt,
//       metadata,
//     });
//   } catch (error) {
//     console.error("Generate Image Error:", error);
//     return Response.json(
//       { success: false, error: error.message },
//       { status: 500 }
//     );
//   }
// }
