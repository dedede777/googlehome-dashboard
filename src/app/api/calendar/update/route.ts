import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
        body = await req.json();
        console.log("Update Request Body:", JSON.stringify(body, null, 2));
        const { eventId, summary, start, end } = body;

        if (!eventId) {
            return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
        }

        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: session.accessToken });

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        const requestBody: any = {};
        if (summary) requestBody.summary = summary;
        if (start) requestBody.start = start;
        if (end) requestBody.end = end;

        const response = await calendar.events.patch({
            calendarId: "primary",
            eventId: eventId,
            requestBody: requestBody,
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error("Calendar Update Error:", error);
        return NextResponse.json({
            error: `Failed to update event: ${error.message || error}`,
            debug: body
        }, { status: 500 });
    }
}
