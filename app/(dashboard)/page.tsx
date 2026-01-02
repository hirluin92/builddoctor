import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DashboardRefresh } from "@/components/dashboard-refresh";
import { BuildStatusBadge } from "@/components/build-status-badge";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch builds con join a pipeline e diagnosis (solo build fallite)
  const { data: builds } = await supabase
    .from("builds")
    .select(
      `
      *,
      pipeline:pipelines(*),
      diagnosis:diagnoses(*)
    `
    )
    .eq("result", "failed")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <DashboardRefresh />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Recent Builds</h1>
        <Link href="/setup">
          <Button>Setup Pipeline</Button>
        </Link>
      </div>

      {!builds || builds.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No builds yet</CardTitle>
            <CardDescription>
              Set up your first pipeline to start monitoring builds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/setup">
              <Button>Get Started</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Build History</CardTitle>
            <CardDescription>Recent build failures and their diagnoses</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pipeline</TableHead>
                  <TableHead>Build #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {builds.map((build: any) => {
                  const pipeline = build.pipeline;
                  const diagnosis = build.diagnosis?.[0];

                  return (
                    <TableRow key={build.id}>
                      <TableCell>
                        {pipeline?.azure_pipeline_name || "Unknown"}
                      </TableCell>
                      <TableCell>{build.azure_build_number || "-"}</TableCell>
                      <TableCell>
                        <BuildStatusBadge status={build.status} />
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={build.result === "failed" ? "destructive" : "default"}
                        >
                          {build.result}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(build.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {build.result === "failed" && diagnosis ? (
                          <Link href={`/dashboard/diagnosis/${diagnosis.id}`}>
                            <Button variant="outline" size="sm">
                              View Diagnosis
                            </Button>
                          </Link>
                        ) : build.result === "failed" && build.status === "analyzing" ? (
                          <Badge variant="outline" className="bg-blue-500 text-white">
                            Analyzing...
                          </Badge>
                        ) : build.result === "failed" && build.status === "pending" ? (
                          <Badge variant="outline" className="bg-yellow-500 text-white">
                            Pending
                          </Badge>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

