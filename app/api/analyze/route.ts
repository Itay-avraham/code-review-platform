import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { codeSnippet } = await req.json();

    if (!codeSnippet) {
      return NextResponse.json({ error: "Code snippet is required" }, { status: 400 });
    }

    // Initialize the fast, free tier model
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    // Enforce strict JSON formatting in the prompt
    const prompt = `
      Analyze the following code snippet for security vulnerabilities and clean code principles.
      You must respond ONLY with a valid JSON object. Do not include markdown formatting like \`\`\`json.
      Use this exact JSON structure:
      {
        "vulnerabilities": [
          { "issue": "string", "severity": "High|Medium|Low", "description": "string" }
        ],
        "quality": [
          { "issue": "string", "suggestion": "string" }
        ]
      }

      Code to analyze:
      ${codeSnippet}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Strip markdown formatting if the AI ignores the instruction
    const cleanJson = responseText.replace(/```json/gi, "").replace(/```/gi, "").trim();
    const parsedData = JSON.parse(cleanJson);

    // Note: We will add the Prisma database insertion here later once authentication is set up.

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json({ error: "Failed to analyze code" }, { status: 500 });
  }
}