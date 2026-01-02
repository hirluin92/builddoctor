import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { CodeBlock } from "@/components/code-block";

export default async function DiagnosisPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch diagnosis con join a build e pipeline
  const { data: diagnosis, error } = await supabase
    .from("diagnoses")
    .select(
      `
      *,
      build:builds(
        *,
        pipeline:pipelines(*)
      )
    `
    )
    .eq("id", params.id)
    .single();

  if (error || !diagnosis) {
    notFound();
  }

  const build = diagnosis.build as any;
  const pipeline = build?.pipeline as any;

  if (!build || !pipeline) {
    notFound();
  }

  // Recupera org dal profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("azure_devops_org")
    .eq("id", user.id)
    .single();

  const org = profile?.azure_devops_org || "unknown";
  const azureUrl = `https://dev.azure.com/${org}/${pipeline.azure_project_name}/_build/results?buildId=${build.azure_build_id}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Diagnosis</h1>
          <p className="text-muted-foreground">
            {pipeline.azure_pipeline_name} — Build #{build.azure_build_number}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Main Diagnosis Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Root Cause</CardTitle>
                <CardDescription>
                  {new Date(diagnosis.created_at).toLocaleString()}
                </CardDescription>
              </div>
              <Badge variant="outline">{diagnosis.error_category}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Root Cause</h3>
              <p className="text-foreground">{diagnosis.root_cause}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Explanation</h3>
              <p className="text-muted-foreground">{diagnosis.explanation}</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Suggested Fix</h3>
                <CopyButton text={diagnosis.suggested_fix || ""} />
              </div>
              <CodeBlock
                code={diagnosis.suggested_fix || "No fix available"}
                language="bash"
              />
            </div>

            {diagnosis.confidence !== null && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Confidence</span>
                  <span className="text-sm text-muted-foreground">
                    {(diagnosis.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${diagnosis.confidence * 100}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Relevant Logs */}
        {diagnosis.relevant_logs && (
          <Card>
            <CardHeader>
              <CardTitle>Relevant Logs</CardTitle>
              <CardDescription>
                The most relevant error lines from the build log
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="logs">
                  <AccordionTrigger>View Logs</AccordionTrigger>
                  <AccordionContent>
                    <CodeBlock code={diagnosis.relevant_logs} language="text" />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={azureUrl} target="_blank">
              <Button variant="outline" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in Azure DevOps
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

