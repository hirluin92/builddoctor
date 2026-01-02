import { NextRequest, NextResponse } from "next/server";
import { sendTestMessage } from "@/lib/slack";

export async function POST(request: NextRequest) {
  try {
    const { webhookUrl } = await request.json();

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "webhookUrl required" },
        { status: 400 }
      );
    }

    const success = await sendTestMessage(webhookUrl);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Failed to send test message" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error testing Slack:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

