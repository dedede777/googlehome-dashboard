import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

function errorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json() as Record<string, unknown>;
        const eventId = typeof body.eventId === "string" ? body.eventId : "";

        if (!eventId) {
            return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
        }

        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: session.accessToken });

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        await calendar.events.delete({
            calendarId: "primary",
            eventId: eventId,
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Calendar Delete Error:", error);
        return NextResponse.json({ error: `Failed to delete event: ${errorMessage(error)}` }, { status: 500 });
    }
}
