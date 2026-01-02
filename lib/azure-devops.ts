export interface Project {
  id: string;
  name: string;
}

export interface Pipeline {
  id: number;
  name: string;
}

const API_VERSION = "7.0";

function getAuthHeader(pat: string): string {
  return `Basic ${Buffer.from(`:${pat}`).toString("base64")}`;
}

export async function testConnection(
  org: string,
  pat: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://dev.azure.com/${org}/_apis/projects?api-version=${API_VERSION}`,
      {
        headers: {
          Authorization: getAuthHeader(pat),
        },
      }
    );

    return response.ok;
  } catch {
    return false;
  }
}

export async function getProjects(
  org: string,
  pat: string
): Promise<Project[]> {
  const response = await fetch(
    `https://dev.azure.com/${org}/_apis/projects?api-version=${API_VERSION}`,
    {
      headers: {
        Authorization: getAuthHeader(pat),
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }

  const data = await response.json();
  return data.value.map((p: any) => ({
    id: p.id,
    name: p.name,
  }));
}

export async function getPipelines(
  org: string,
  project: string,
  pat: string
): Promise<Pipeline[]> {
  const response = await fetch(
    `https://dev.azure.com/${org}/${project}/_apis/pipelines?api-version=${API_VERSION}`,
    {
      headers: {
        Authorization: getAuthHeader(pat),
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch pipelines");
  }

  const data = await response.json();
  return data.value.map((p: any) => ({
    id: p.id,
    name: p.name,
  }));
}

export async function getBuildLogs(
  org: string,
  project: string,
  buildId: string,
  pat: string
): Promise<string> {
  // Prima otteniamo la lista dei log
  const logsResponse = await fetch(
    `https://dev.azure.com/${org}/${project}/_apis/build/builds/${buildId}/logs?api-version=${API_VERSION}`,
    {
      headers: {
        Authorization: getAuthHeader(pat),
      },
    }
  );

  if (!logsResponse.ok) {
    throw new Error("Failed to fetch build logs");
  }

  const logsData = await logsResponse.json();
  const logIds = logsData.value.map((log: any) => log.id);

  // Scarichiamo ogni log e li concateniamo
  const logContents = await Promise.all(
    logIds.map(async (logId: number) => {
      const logResponse = await fetch(
        `https://dev.azure.com/${org}/${project}/_apis/build/builds/${buildId}/logs/${logId}?api-version=${API_VERSION}`,
        {
          headers: {
            Authorization: getAuthHeader(pat),
          },
        }
      );

      if (logResponse.ok) {
        return await logResponse.text();
      }
      return "";
    })
  );

  return logContents.join("\n");
}

export async function createServiceHook(
  org: string,
  projectId: string,
  pipelineId: string,
  webhookUrl: string,
  secret: string,
  pat: string
): Promise<string> {
  const subscription = {
    publisherId: "tfs",
    eventType: "build.complete",
    resourceVersion: "1.0",
    consumerId: "webHooks",
    consumerActionId: "httpRequest",
    consumerInputs: {
      url: webhookUrl,
      // Nota: Azure DevOps non calcola automaticamente HMAC.
      // Il secret viene passato come header per riferimento, ma la validazione HMAC
      // viene fatta nel webhook receiver usando il secret dal database.
      httpHeaders: JSON.stringify({
        "X-Hub-Signature": secret,
      }),
    },
    publisherInputs: {
      projectId: projectId,
      definitionId: pipelineId,
    },
  };

  const response = await fetch(
    `https://dev.azure.com/${org}/_apis/hooks/subscriptions?api-version=${API_VERSION}`,
    {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(pat),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create webhook: ${error}`);
  }

  const data = await response.json();
  return data.id;
}

