import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createHmac } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("X-Hub-Signature");

    // Parse payload
    const payload = JSON.parse(body);

    // Verifica che sia un evento build.complete
    if (payload.eventType !== "build.complete") {
      return NextResponse.json({ received: true });
    }

    const resource = payload.resource;
    if (!resource || resource.result !== "failed") {
      // Solo processiamo build fallite
      return NextResponse.json({ received: true });
    }

    const buildId = resource.id?.toString();
    const buildNumber = resource.buildNumber;
    const projectId = resource.project?.id;
    const projectName = resource.project?.name;
    const pipelineId = resource.definition?.id?.toString();
    const pipelineName = resource.definition?.name;

    if (!buildId || !pipelineId) {
      return NextResponse.json({ received: true });
    }

    const supabase = await createClient();

    // Trova pipeline da azure_pipeline_id
    const { data: pipeline } = await supabase
      .from("pipelines")
      .select("id, webhook_secret, user_id")
      .eq("azure_pipeline_id", pipelineId)
      .eq("is_active", true)
      .single();

    if (!pipeline) {
      console.log("Pipeline not found for build:", pipelineId);
      return NextResponse.json({ received: true });
    }

    // Valida signature HMAC se presente
    if (signature && pipeline.webhook_secret) {
      try {
        const expectedSignature = createHmac("sha256", pipeline.webhook_secret)
          .update(body)
          .digest("hex");
        const providedSignature = signature.replace("sha256=", "");

        if (expectedSignature !== providedSignature) {
          console.error("Invalid webhook signature");
          return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }
      } catch (error) {
        console.error("Error validating signature:", error);
        // In caso di errore, continuiamo (per retrocompatibilità)
      }
    }

    // Crea build record
    const { data: build, error: buildError } = await supabase
      .from("builds")
      .insert({
        pipeline_id: pipeline.id,
        azure_build_id: buildId,
        azure_build_number: buildNumber,
        status: "pending",
        result: "failed",
      })
      .select()
      .single();

    if (buildError || !build) {
      console.error("Error creating build:", buildError);
      return NextResponse.json({ received: true });
    }

    // Trigger diagnosis in background (fire and forget)
    // Usa l'URL interno se disponibile, altrimenti quello pubblico
    const diagnoseUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/diagnose`
      : `http://localhost:3000/api/diagnose`;

    fetch(diagnoseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ buildId: build.id }),
    }).catch((error) => {
      console.error("Error triggering diagnosis:", error);
    });

    // Return 200 immediatamente
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    // Sempre return 200 per non far riprovare Azure DevOps
    return NextResponse.json({ received: true });
  }
}

