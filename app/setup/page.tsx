"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Project {
  id: string;
  name: string;
}

interface Pipeline {
  id: number;
  name: string;
}

export default function SetupPage() {
  const router = useRouter();
  const isMock = process.env.NEXT_PUBLIC_DEVOPS_MODE === "mock";
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // In mock mode, auto-completa setup e redirect
  useEffect(() => {
    if (isMock) {
      const autoSetup = async () => {
        try {
          // Carica progetti mock
          const projectsRes = await fetch("/api/azure-devops/projects");
          const projectsData = await projectsRes.json();
          if (projectsData.projects) {
            setProjects(projectsData.projects);
            if (projectsData.projects.length > 0) {
              setSelectedProject(projectsData.projects[0].id);
              // Carica pipeline mock
              const pipelinesRes = await fetch(`/api/azure-devops/pipelines?project=${projectsData.projects[0].id}`);
              const pipelinesData = await pipelinesRes.json();
              if (pipelinesData.pipelines && pipelinesData.pipelines.length > 0) {
                setPipelines(pipelinesData.pipelines);
                setSelectedPipeline(pipelinesData.pipelines[0].id.toString());
              }
            }
          }

          // Attiva monitoraggio mock
          if (projectsData.projects && projectsData.projects.length > 0) {
            const project = projectsData.projects[0];
            const pipelinesRes = await fetch(`/api/azure-devops/pipelines?project=${project.id}`);
            const pipelinesData = await pipelinesRes.json();
            if (pipelinesData.pipelines && pipelinesData.pipelines.length > 0) {
              const pipeline = pipelinesData.pipelines[0];
              await fetch("/api/azure-devops/setup-webhook", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  projectId: project.id,
                  projectName: project.name,
                  pipelineId: pipeline.id.toString(),
                  pipelineName: pipeline.name,
                }),
              });
            }
          }

          toast.success("Mock setup completato!");
          setTimeout(() => router.push("/dashboard"), 1000);
        } catch (error) {
          console.error("Error in auto-setup:", error);
          router.push("/dashboard");
        }
      };

      autoSetup();
    }
  }, [isMock, router]);

  // Step 1: Azure DevOps
  const [organization, setOrganization] = useState("");
  const [pat, setPat] = useState("");
  const [connectionTested, setConnectionTested] = useState(false);

  // Step 2: Pipeline
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState("");

  // Step 3: Slack
  const [slackWebhook, setSlackWebhook] = useState("");

  const testConnection = async () => {
    if (!organization || !pat) {
      toast.error("Inserisci organization e PAT");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/azure-devops/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organization, pat }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Connessione riuscita!");
        setConnectionTested(true);
        // Salva in profile
        await fetch("/api/azure-devops/test", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ organization, pat }),
        });
      } else {
        toast.error(data.error || "Connessione fallita");
      }
    } catch (error) {
      toast.error("Errore durante il test");
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    if (!connectionTested) return;

    setLoading(true);
    try {
      const res = await fetch("/api/azure-devops/projects");
      const data = await res.json();

      if (data.projects) {
        setProjects(data.projects);
      } else {
        toast.error(data.error || "Errore nel caricamento progetti");
      }
    } catch (error) {
      toast.error("Errore durante il caricamento");
    } finally {
      setLoading(false);
    }
  };

  const loadPipelines = async (projectId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/azure-devops/pipelines?project=${projectId}`);
      const data = await res.json();

      if (data.pipelines) {
        setPipelines(data.pipelines);
      } else {
        toast.error(data.error || "Errore nel caricamento pipeline");
      }
    } catch (error) {
      toast.error("Errore durante il caricamento");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId);
    setSelectedPipeline("");
    setPipelines([]);
    if (projectId) {
      loadPipelines(projectId);
    }
  };

  const activateMonitoring = async () => {
    if (!selectedProject || !selectedPipeline) {
      toast.error("Seleziona progetto e pipeline");
      return;
    }

    setLoading(true);
    try {
      const project = projects.find((p) => p.id === selectedProject);
      const pipeline = pipelines.find((p) => p.id.toString() === selectedPipeline);

      if (!project || !pipeline) {
        toast.error("Progetto o pipeline non trovati");
        return;
      }

      const res = await fetch("/api/azure-devops/setup-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          projectName: project.name,
          pipelineId: pipeline.id.toString(),
          pipelineName: pipeline.name,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Monitoraggio attivato!");
        setStep(3);
      } else {
        toast.error(data.error || "Errore nell'attivazione");
      }
    } catch (error) {
      toast.error("Errore durante l'attivazione");
    } finally {
      setLoading(false);
    }
  };

  const testSlack = async () => {
    if (!slackWebhook) {
      toast.error("Inserisci webhook URL");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/slack/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl: slackWebhook }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Test Slack riuscito!");
      } else {
        toast.error(data.error || "Test Slack fallito");
      }
    } catch (error) {
      toast.error("Errore durante il test");
    } finally {
      setLoading(false);
    }
  };

  const finishSetup = async () => {
    setLoading(true);
    try {
      if (slackWebhook) {
        await fetch("/api/slack/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ webhookUrl: slackWebhook }),
        });
      }

      toast.success("Setup completato!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Errore durante il salvataggio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Setup BuildDoctor</h1>
        <p className="text-muted-foreground">
          Configura la tua prima pipeline in 3 semplici passaggi
        </p>
      </div>

      {/* Step 1: Azure DevOps */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Connetti Azure DevOps</CardTitle>
            <CardDescription>
              Inserisci le credenziali per connettere Azure DevOps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organization">Organization Name</Label>
              <Input
                id="organization"
                placeholder="my-organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pat">Personal Access Token</Label>
              <Input
                id="pat"
                type="password"
                placeholder="••••••••"
                value={pat}
                onChange={(e) => setPat(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={testConnection}
                disabled={loading || !organization || !pat}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>
              {connectionTested && (
                <Button onClick={() => {
                  loadProjects();
                  setStep(2);
                }}>
                  Next Step
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Pipeline */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Seleziona Pipeline</CardTitle>
            <CardDescription>
              Scegli il progetto e la pipeline da monitorare
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project">Progetto</Label>
              <select
                id="project"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedProject}
                onChange={(e) => handleProjectChange(e.target.value)}
                disabled={loading || projects.length === 0}
              >
                <option value="">Seleziona progetto...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedProject && (
              <div className="space-y-2">
                <Label htmlFor="pipeline">Pipeline</Label>
                <select
                  id="pipeline"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedPipeline}
                  onChange={(e) => setSelectedPipeline(e.target.value)}
                  disabled={loading || pipelines.length === 0}
                >
                  <option value="">Seleziona pipeline...</option>
                  {pipelines.map((pipeline) => (
                    <option key={pipeline.id} value={pipeline.id.toString()}>
                      {pipeline.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={activateMonitoring}
                disabled={loading || !selectedProject || !selectedPipeline}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Attivando...
                  </>
                ) : (
                  "Attiva Monitoraggio"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Slack */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Configura Slack (Opzionale)</CardTitle>
            <CardDescription>
              Ricevi notifiche su Slack quando una build fallisce
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slack">Slack Webhook URL</Label>
              <Input
                id="slack"
                type="url"
                placeholder="https://hooks.slack.com/services/..."
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              {slackWebhook && (
                <Button onClick={testSlack} disabled={loading} variant="outline">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    "Test"
                  )}
                </Button>
              )}
              <Button onClick={finishSetup} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  "Skip / Finish"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

