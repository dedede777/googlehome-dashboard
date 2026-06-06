import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface CalendarDateTime {
    dateTime: string;
}

interface ParsedCalendarEvent {
    summary: string;
    start: CalendarDateTime;
    end: CalendarDateTime;
}

interface InvalidCalendarEvent {
    error: string;
}

type CalendarParseResult = ParsedCalendarEvent | InvalidCalendarEvent;

interface GroqCompletion {
    choices?: Array<{
        message?: {
            content?: string;
        };
    }>;
}

function errorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isParsedCalendarEvent(value: unknown): value is ParsedCalendarEvent {
    if (!isObject(value)) return false;
    if (typeof value.summary !== "string") return false;
    if (!isObject(value.start) || typeof value.start.dateTime !== "string") return false;
    if (!isObject(value.end) || typeof value.end.dateTime !== "string") return false;
    return true;
}

function normalizeParseResult(value: unknown): CalendarParseResult {
    if (isObject(value) && typeof value.error === "string") {
        return { error: value.error };
    }
    if (isParsedCalendarEvent(value)) {
        return value;
    }
    return { error: "Could not parse a valid calendar event" };
}

function parseJsonResponse(textResponse: string): CalendarParseResult {
    const jsonStr = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    return normalizeParseResult(JSON.parse(jsonStr) as unknown);
}

async function parseEventWithGemini(text: string): Promise<CalendarParseResult> {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY not configured");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are a calendar assistant. Parse the following text into a JSON object for a Google Calendar event.
      Text: "${text}"
      Current Date and Time: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
      Timezone: Asia/Tokyo
      
      Return ONLY the JSON object with the following fields:
      - summary: string (the event title/description)
      - start: { dateTime: string (ISO 8601 format with timezone, e.g., 2024-12-09T15:00:00+09:00) }
      - end: { dateTime: string (ISO 8601 format with timezone, e.g., 2024-12-09T16:00:00+09:00) }
      
      IMPORTANT: 
      - Always include the +09:00 timezone offset for Japan.
      - If no duration is specified, assume 1 hour.
      - "明日" means tomorrow, "今日" means today.
      - Use 24-hour format.
      If the text is not a valid event, return { error: "Invalid event" }.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    return parseJsonResponse(textResponse);
}

async function parseEventWithGroq(text: string, model: string = "llama-3.1-8b-instant"): Promise<CalendarParseResult> {
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
        throw new Error("GROQ_API_KEY not configured");
    }

    const prompt = `You are a calendar assistant. Parse the following text into a JSON object for a Google Calendar event.
Text: "${text}"
Current Date and Time: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
Timezone: Asia/Tokyo

Return ONLY the JSON object with the following fields:
- summary: string (the event title/description)
- start: { dateTime: string (ISO 8601 format with timezone, e.g., 2024-12-09T15:00:00+09:00) }
- end: { dateTime: string (ISO 8601 format with timezone, e.g., 2024-12-09T16:00:00+09:00) }

IMPORTANT:
- Always include the +09:00 timezone offset for Japan.
- If no duration is specified, assume 1 hour.
- "明日" means tomorrow, "今日" means today.
- Use 24-hour format.
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

    const data = await response.json() as GroqCompletion;
    const textResponse = data.choices?.[0]?.message?.content || "";

    return parseJsonResponse(textResponse);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json() as Record<string, unknown>;
        const text = typeof body.text === "string" ? body.text.trim() : "";
        const provider = body.provider === "gemini" ? "gemini" : "groq";
        const model = typeof body.model === "string" ? body.model : undefined;

        if (!text) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 });
        }

        let eventData: CalendarParseResult;

        if (provider === "gemini") {
            // Try Gemini first
            try {
                eventData = await parseEventWithGemini(text);
            } catch (error: unknown) {
                console.error("Gemini failed, falling back to Groq:", error);
                try {
                    eventData = await parseEventWithGroq(text, model);
                } catch (fallbackError: unknown) {
                    throw new Error(`Gemini: ${errorMessage(error)}. Groq: ${errorMessage(fallbackError)}`);
                }
            }
        } else {
            // Use Groq (default)
            try {
                eventData = await parseEventWithGroq(text, model);
            } catch (error: unknown) {
                console.error("Groq failed, trying Gemini:", error);
                try {
                    eventData = await parseEventWithGemini(text);
                } catch (fallbackError: unknown) {
                    throw new Error(`Groq: ${errorMessage(error)}. Gemini: ${errorMessage(fallbackError)}`);
                }
            }
        }

        if ("error" in eventData) {
            return NextResponse.json({ error: eventData.error }, { status: 400 });
        }

        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: session.accessToken });

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        const insertRes = await calendar.events.insert({
            calendarId: "primary",
            requestBody: {
                summary: eventData.summary,
                start: {
                    dateTime: eventData.start.dateTime,
                    timeZone: "Asia/Tokyo",
                },
                end: {
                    dateTime: eventData.end.dateTime,
                    timeZone: "Asia/Tokyo",
                },
            },
        });

        return NextResponse.json(insertRes.data);
    } catch (error: unknown) {
        console.error("Calendar Add Error:", error);
        return NextResponse.json({ error: `Failed to add event: ${errorMessage(error)}` }, { status: 500 });
    }
}
