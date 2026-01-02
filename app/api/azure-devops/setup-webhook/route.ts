import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceHook } from "@/lib/azure-devops";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, projectName, pipelineId, pipelineName } =
      await request.json();

    if (!projectId || !pipelineId) {
      return NextResponse.json(
        { error: "Project and pipeline required" },
        { status: 400 }
      );
    }

    // Recupera org e pat dal profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("azure_devops_org, azure_devops_pat")
      .eq("id", user.id)
      .single();

    if (!profile?.azure_devops_org || !profile?.azure_devops_pat) {
      return NextResponse.json(
        { error: "Azure DevOps not configured" },
        { status: 400 }
      );
    }

    // Genera webhook secret
    const webhookSecret = randomBytes(32).toString("hex");

    // Crea webhook su Azure DevOps
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/azure-devops`;
    const hookId = await createServiceHook(
      profile.azure_devops_org,
      projectId,
      pipelineId,
      webhookUrl,
      webhookSecret,
      profile.azure_devops_pat
    );

    // Salva pipeline nel DB
    const { error: dbError } = await supabase.from("pipelines").insert({
      user_id: user.id,
      azure_project_id: projectId,
      azure_project_name: projectName,
      azure_pipeline_id: pipelineId,
      azure_pipeline_name: pipelineName,
      webhook_secret: webhookSecret,
      is_active: true,
    });

    if (dbError) {
      console.error("Error saving pipeline:", dbError);
      return NextResponse.json(
        { error: "Failed to save pipeline" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, hookId });
  } catch (error) {
    console.error("Error setting up webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

