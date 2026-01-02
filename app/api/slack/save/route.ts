import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { webhookUrl } = await request.json();

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "webhookUrl required" },
        { status: 400 }
      );
    }

    // Salva in profile
    await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        slack_webhook_url: webhookUrl,
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving Slack webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

