import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPipelines } from "@/lib/azure-devops";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const project = searchParams.get("project");

    if (!project) {
      return NextResponse.json(
        { error: "Project parameter required" },
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

    const pipelines = await getPipelines(
      profile.azure_devops_org,
      project,
      profile.azure_devops_pat
    );

    return NextResponse.json({ pipelines });
  } catch (error) {
    console.error("Error fetching pipelines:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

