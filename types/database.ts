export type BuildStatus = "pending" | "analyzing" | "completed" | "failed";
export type BuildResult = "succeeded" | "failed";

export interface Profile {
  id: string;
  email: string | null;
  azure_devops_org: string | null;
  azure_devops_pat: string | null;
  slack_webhook_url: string | null;
  created_at: string;
}

export interface Pipeline {
  id: string;
  user_id: string;
  azure_project_id: string;
  azure_project_name: string;
  azure_pipeline_id: string;
  azure_pipeline_name: string;
  webhook_secret: string;
  is_active: boolean;
  created_at: string;
}

export interface Build {
  id: string;
  pipeline_id: string;
  azure_build_id: string;
  azure_build_number: string | null;
  status: BuildStatus;
  result: BuildResult;
  created_at: string;
}

export interface Diagnosis {
  id: string;
  build_id: string;
  error_category: string | null;
  root_cause: string | null;
  explanation: string | null;
  suggested_fix: string | null;
  relevant_logs: string | null;
  confidence: number | null;
  created_at: string;
}

