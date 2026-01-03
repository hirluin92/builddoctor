import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBuildLogs } from "@/lib/azure-devops";
import { diagnoseBuild } from "@/lib/ai";
import { sendDiagnosis } from "@/lib/slack";
import { mockDevOpsData } from "@/lib/mocks/devops.mock";

export async function POST(request: NextRequest) {
  const isMock = process.env.DEVOPS_MODE === "mock";

  // Mock mode: ritorna dati finti
  if (isMock) {
    try {
      const { buildId } = await request.json();

      // Simula diagnosi AI con dati mock
      const diagnosis = await diagnoseBuild(mockDevOpsData.logs);

      // In mock mode, salva comunque nel DB se possibile (opzionale)
      const supabase = await createClient();
      if (buildId) {
        try {
          await supabase.from("diagnoses").insert({
            build_id: buildId,
            error_category: diagnosis.category,
            root_cause: diagnosis.rootCause,
            explanation: diagnosis.explanation,
            suggested_fix: diagnosis.suggestedFix,
            relevant_logs: diagnosis.relevantLines,
            confidence: diagnosis.confidence,
          });

          await supabase
            .from("builds")
            .update({ status: "completed" })
            .eq("id", buildId);
        } catch (error) {
          // Ignora errori DB in mock mode
          console.log("Mock mode: skipping DB operations");
        }
      }

      return NextResponse.json({
        success: true,
        mode: "mock",
        diagnosis: {
          category: diagnosis.category,
          rootCause: diagnosis.rootCause,
          explanation: diagnosis.explanation,
          suggestedFix: diagnosis.suggestedFix,
          confidence: diagnosis.confidence,
        },
      });
    } catch (error) {
      return NextResponse.json({
        success: true,
        mode: "mock",
        diagnosis: {
          category: "compilation",
          rootCause: "Mock error: Database connection failed",
          explanation: "This is a mock diagnosis for development purposes",
          suggestedFix: "Check database connection settings",
          confidence: 0.85,
        },
      });
    }
  }

  // Real mode: flusso normale
  try {
    const { buildId } = await request.json();

    if (!buildId) {
      return NextResponse.json(
        { error: "buildId required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Recupera build
    const { data: build, error: buildError } = await supabase
      .from("builds")
      .select(
        `
        *,
        pipeline:pipelines(*)
      `
      )
      .eq("id", buildId)
      .single();

    if (buildError || !build) {
      return NextResponse.json(
        { error: "Build not found" },
        { status: 404 }
      );
    }

    const pipeline = build.pipeline as any;

    if (!pipeline) {
      return NextResponse.json(
        { error: "Pipeline not found" },
        { status: 404 }
      );
    }

    // Recupera profile separatamente
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", pipeline.user_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Aggiorna status a analyzing
    await supabase
      .from("builds")
      .update({ status: "analyzing" })
      .eq("id", buildId);

    try {
      // Fetch logs da Azure DevOps
      const logs = await getBuildLogs(
        profile.azure_devops_org,
        pipeline.azure_project_id,
        build.azure_build_id,
        profile.azure_devops_pat
      );

      // Valida che i log non siano vuoti
      if (!logs || logs.trim().length === 0) {
        throw new Error("Build logs are empty or unavailable");
      }

      // Diagnosi AI
      const diagnosis = await diagnoseBuild(logs);

      // Salva diagnosis
      const { data: savedDiagnosis, error: diagnosisError } = await supabase
        .from("diagnoses")
        .insert({
          build_id: buildId,
          error_category: diagnosis.category,
          root_cause: diagnosis.rootCause,
          explanation: diagnosis.explanation,
          suggested_fix: diagnosis.suggestedFix,
          relevant_logs: diagnosis.relevantLines,
          confidence: diagnosis.confidence,
        })
        .select()
        .single();

      if (diagnosisError) {
        console.error("Error saving diagnosis:", diagnosisError);
      }

      // Aggiorna build status
      await supabase
        .from("builds")
        .update({ status: "completed" })
        .eq("id", buildId);

      // Invia notifica Slack se configurato
      if (profile.slack_webhook_url && savedDiagnosis) {
        await sendDiagnosis(
          profile.slack_webhook_url,
          {
            rootCause: diagnosis.rootCause,
            explanation: diagnosis.explanation,
            suggestedFix: diagnosis.suggestedFix,
            errorCategory: diagnosis.category,
          },
          {
            buildNumber: build.azure_build_number || "Unknown",
            pipelineName: pipeline.azure_pipeline_name,
          }
        );
      }

      return NextResponse.json({
        success: true,
        diagnosisId: savedDiagnosis?.id,
      });
    } catch (error) {
      console.error("Error during diagnosis:", error);

      // Aggiorna build status a failed
      await supabase
        .from("builds")
        .update({ status: "failed" })
        .eq("id", buildId);

      // Salva diagnosis fallback
      await supabase.from("diagnoses").insert({
        build_id: buildId,
        error_category: "unknown",
        root_cause: "Failed to analyze build logs",
        explanation: "An error occurred during the diagnosis process",
        suggested_fix: "Please review the build logs manually",
        confidence: 0.0,
      });

      return NextResponse.json(
        { error: "Diagnosis failed", success: false },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in diagnose endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

