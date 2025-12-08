import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function parseEventWithGemini(text: string): Promise<any> {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY not configured");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      You are a calendar assistant. Parse the following text into a JSON object for a Google Calendar event.
      Text: "${text}"
      Current Date: ${new Date().toISOString()}
      
      Return ONLY the JSON object with the following fields:
      - summary: string
      - start: { dateTime: string (ISO 8601) }
      - end: { dateTime: string (ISO 8601) }
      
      If no duration is specified, assume 1 hour.
      If the text is not a valid event, return { error: "Invalid event" }.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    const jsonStr = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
}

async function parseEventWithGroq(text: string, model: string = "llama-3.1-70b-versatile"): Promise<any> {
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
        throw new Error("GROQ_API_KEY not configured");
    }

    const prompt = `You are a calendar assistant. Parse the following text into a JSON object for a Google Calendar event.
Text: "${text}"
Current Date: ${new Date().toISOString()}

Return ONLY the JSON object with the following fields:
- summary: string
- start: { dateTime: string (ISO 8601) }
- end: { dateTime: string (ISO 8601) }

If no duration is specified, assume 1 hour.
If the text is not a valid event, return { error: "Invalid event" }.`;

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 500
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const textResponse = data.choices[0]?.message?.content || "";

    const jsonStr = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { text, provider = "groq", model } = await req.json();

        let eventData: any;

        if (provider === "gemini") {
            // Try Gemini first
            try {
                eventData = await parseEventWithGemini(text);
            } catch (error) {
                console.error("Gemini failed, falling back to Groq:", error);
                try {
                    eventData = await parseEventWithGroq(text, model);
                } catch (fallbackError) {
                    throw new Error(`Gemini failed. Groq fallback also failed.`);
                }
            }
        } else {
            // Use Groq (default)
            try {
                eventData = await parseEventWithGroq(text, model);
            } catch (error) {
                console.error("Groq failed, trying Gemini:", error);
                try {
                    eventData = await parseEventWithGemini(text);
                } catch (fallbackError) {
                    throw new Error(`Groq failed. Gemini fallback also failed.`);
                }
            }
        }

        if (eventData.error) {
            return NextResponse.json({ error: eventData.error }, { status: 400 });
        }

        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: session.accessToken });

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        const insertRes = await calendar.events.insert({
            calendarId: "primary",
            requestBody: {
                summary: eventData.summary,
                start: eventData.start,
                end: eventData.end,
            },
        });

        return NextResponse.json(insertRes.data);
    } catch (error: any) {
        console.error("Calendar Add Error:", error);
        return NextResponse.json({ error: `Failed to add event: ${error.message || error}` }, { status: 500 });
    }
}
