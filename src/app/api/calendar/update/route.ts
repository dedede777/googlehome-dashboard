import { calendar_v3, google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

function errorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function parseEventDate(value: unknown): calendar_v3.Schema$EventDateTime | undefined {
    if (!isObject(value)) return undefined;
    const dateTime = typeof value.dateTime === "string" ? value.dateTime : undefined;
    const date = typeof value.date === "string" ? value.date : undefined;
    const timeZone = typeof value.timeZone === "string" ? value.timeZone : undefined;

    if (!dateTime && !date) return undefined;
    return { dateTime, date, timeZone };
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json() as Record<string, unknown>;
        const { eventId, summary, start, end } = body;

        if (typeof eventId !== "string" || !eventId) {
            return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
        }

        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: session.accessToken });

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        const requestBody: calendar_v3.Schema$Event = {};
        if (typeof summary === "string") requestBody.summary = summary;

        const parsedStart = parseEventDate(start);
        const parsedEnd = parseEventDate(end);
        if (parsedStart) requestBody.start = parsedStart;
        if (parsedEnd) requestBody.end = parsedEnd;

        if (!requestBody.summary && !requestBody.start && !requestBody.end) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        const response = await calendar.events.patch({
            calendarId: "primary",
            eventId: eventId,
            requestBody: requestBody,
        });

        return NextResponse.json(response.data);
    } catch (error: unknown) {
        console.error("Calendar Update Error:", error);
        return NextResponse.json({
            error: `Failed to update event: ${errorMessage(error)}`,
        }, { status: 500 });
    }
}
