import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: "Gemini API Key not configured" }, { status: 500 });
    }

    try {
        const { text } = await req.json();
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

        // Clean up markdown code blocks if present
        const jsonStr = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        const eventData = JSON.parse(jsonStr);

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
