import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        const { title, content } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY not configured" },
                { status: 500 }
            );
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

        const prompt = `以下の記事を日本語で要約してください。

【ルール】
- 必ず日本語で回答すること
- 箇条書き3つで要約すること
- 各行は「・」で始めること
- 各項目は1行で簡潔に

【記事タイトル】
${title}

${content ? `【記事内容】\n${content}` : ""}

【要約】`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();

        return NextResponse.json({ summary });
    } catch (error) {
        console.error("Summarize error:", error);
        return NextResponse.json(
            { error: "Failed to summarize" },
            { status: 500 }
        );
    }
}
