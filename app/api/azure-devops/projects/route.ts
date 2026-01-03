import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProjects } from "@/lib/azure-devops";
import { mockProjects } from "@/lib/mocks/devops.mock";

export async function GET() {
  const isMock = process.env.DEVOPS_MODE === "mock";

  // Mock mode: ritorna progetti mock
  if (isMock) {
    return NextResponse.json({ projects: mockProjects, mode: "mock" });
  }

  // Real mode: flusso normale
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const projects = await getProjects(
      profile.azure_devops_org,
      profile.azure_devops_pat
    );

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

