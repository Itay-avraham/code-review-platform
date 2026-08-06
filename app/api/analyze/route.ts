import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    const { codeSnippet } = await req.json();
    if (!codeSnippet) {
      return NextResponse.json({ error: "Code snippet is required" }, { status: 400 });
    }

    // 2. Ensure user exists in Supabase
    await prisma.user.upsert({
      where: { id: userId },
      update: { email },
      create: { id: userId, email },
    });

    // 3. Generate AI Analysis
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
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
    const cleanJson = responseText.replace(/```json/gi, "").replace(/```/gi, "").trim();
    const parsedData = JSON.parse(cleanJson);

    // 4. Save Scan & Report to Supabase via Prisma
    const scan = await prisma.scan.create({
      data: {
        userId,
        originalCode: codeSnippet,
        report: {
          create: {
            analysisData: parsedData,
            vulnerabilityCount: parsedData.vulnerabilities?.length || 0,
          },
        },
      },
      include: {
        report: true,
      },
    });

    return NextResponse.json({ success: true, data: parsedData, scanId: scan.id });
  } catch (error) {
    console.error("AI Analysis / Database Error:", error);
    return NextResponse.json({ error: "Failed to analyze code or save record" }, { status: 500 });
  }
}