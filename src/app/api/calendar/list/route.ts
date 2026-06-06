import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

function errorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
}

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const response = await calendar.events.list({
            calendarId: "primary",
            timeMin: startOfDay.toISOString(),
            maxResults: 20,
            singleEvents: true,
            orderBy: "startTime",
        });

        return NextResponse.json(response.data.items);
    } catch (error: unknown) {
        console.error("Calendar API Error:", error);
        return NextResponse.json({ error: `Failed to fetch events: ${errorMessage(error)}` }, { status: 500 });
    }
}
