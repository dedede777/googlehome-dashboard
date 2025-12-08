import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Groq API endpoint
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface ChatMessage {
    role: string;
    content: string;
}

async function callGemini(message: string, history: ChatMessage[]) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY not configured");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Convert history to Gemini format
    const chatHistory = history?.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
    })) || [];

    const chat = model.startChat({
        history: chatHistory,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
}

async function callGroq(message: string, history: ChatMessage[], model: string = "llama-3.1-8b-instant") {
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
        throw new Error("GROQ_API_KEY not configured");
    }

    // Convert history to OpenAI format
    const messages = [
        ...history.map((msg) => ({
            role: msg.role === "assistant" ? "assistant" : "user",
            content: msg.content,
        })),
        { role: "user", content: message }
    ];

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: 0.7,
            max_tokens: 2000
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
}

export async function POST(request: NextRequest) {
    try {
        const { message, history, provider = "groq", model } = await request.json();

        let text: string;

        if (provider === "gemini") {
            // Try Gemini first
            try {
                text = await callGemini(message, history || []);
            } catch (error) {
                console.error("Gemini failed, falling back to Groq:", error);
                // Fallback to Groq if Gemini fails
                try {
                    text = await callGroq(message, history || [], model);
                } catch (fallbackError) {
                    throw new Error(`Gemini failed: ${error}. Groq fallback also failed: ${fallbackError}`);
                }
            }
        } else {
            // Use Groq (default)
            try {
                text = await callGroq(message, history || [], model);
            } catch (error) {
                console.error("Groq failed, trying Gemini:", error);
                // Fallback to Gemini if Groq fails
                try {
                    text = await callGemini(message, history || []);
                } catch (fallbackError) {
                    throw new Error(`Groq failed: ${error}. Gemini fallback also failed: ${fallbackError}`);
                }
            }
        }

        return NextResponse.json({ response: text });
    } catch (error) {
        console.error("Chat API error:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Check for common issues
        let hint = "";
        if (errorMessage.includes("GROQ_API_KEY not configured")) {
            hint = " (GROQ_API_KEY が .env.local に設定されていません)";
        } else if (errorMessage.includes("GEMINI_API_KEY not configured")) {
            hint = " (GEMINI_API_KEY が .env.local に設定されていません)";
        } else if (errorMessage.includes("401")) {
            hint = " (APIキーが無効です)";
        } else if (errorMessage.includes("429")) {
            hint = " (レート制限に達しました。しばらく待ってください)";
        }

        return NextResponse.json(
            { error: `AI接続エラー${hint}`, details: errorMessage },
            { status: 500 }
        );
    }
}

