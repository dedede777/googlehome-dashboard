import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { title, content } = await req.json();

        const groqApiKey = process.env.GROQ_API_KEY;

        if (!groqApiKey) {
            console.error("GROQ_API_KEY is not set");
            return NextResponse.json(
                { error: "GROQ_API_KEY not configured" },
                { status: 500 }
            );
        }

        const prompt = `以下の記事を日本語で要約してください。

【ルール】
- 必ず日本語で回答すること
- 箇条書き3つで要約すること
- 各行は「・」で始めること
- 各項目は1行で簡潔に

【記事タイトル】
${title}

${content ? `【記事内容】\n${content.slice(0, 2000)}` : ""}

【要約】`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${groqApiKey}`
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "user", content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Groq API error:", response.status, errorText);
            return NextResponse.json(
                { error: `Groq API error: ${response.status}`, summary: "" },
                { status: 200 }
            );
        }

        const data = await response.json();
        const summary = data.choices[0]?.message?.content || "";

        return NextResponse.json({ summary });
    } catch (error) {
        console.error("Summarize error:", error);
        return NextResponse.json(
            { error: "Failed to summarize", summary: "" },
            { status: 200 }
        );
    }
}
