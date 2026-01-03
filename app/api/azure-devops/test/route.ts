import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { testConnection } from "@/lib/azure-devops";

export async function POST(request: NextRequest) {
  const isMock = process.env.DEVOPS_MODE === "mock";

  // Mock mode: ritorna sempre successo
  if (isMock) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { organization, pat } = await request.json();

      // Salva mock data in profile
      await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email,
          azure_devops_org: organization || "demo-org",
          azure_devops_pat: pat || "mock-pat-token",
        });

      return NextResponse.json({ success: true, mode: "mock" });
    } catch (error) {
      return NextResponse.json({ success: true, mode: "mock" });
    }
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

    const { organization, pat } = await request.json();

    if (!organization || !pat) {
      return NextResponse.json(
        { error: "Organization and PAT required" },
        { status: 400 }
      );
    }

    const success = await testConnection(organization, pat);

    if (success) {
      // Salva in profile
      await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email,
          azure_devops_org: organization,
          azure_devops_pat: pat, // In produzione, criptare questo
        });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Connection failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error testing connection:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const isMock = process.env.DEVOPS_MODE === "mock";

  // Mock mode: salva sempre
  if (isMock) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { organization, pat } = await request.json();

      await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          azure_devops_org: organization || "demo-org",
          azure_devops_pat: pat || "mock-pat-token",
        });

      return NextResponse.json({ success: true, mode: "mock" });
    } catch (error) {
      return NextResponse.json({ success: true, mode: "mock" });
    }
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

    const { organization, pat } = await request.json();

    // Salva in profile
    await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        azure_devops_org: organization,
        azure_devops_pat: pat, // In produzione, criptare questo
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving connection:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

