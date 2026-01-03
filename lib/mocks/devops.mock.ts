export const mockDevOpsData = {
  project: {
    name: "BuildDoctor Demo Project",
    organization: "demo-org",
  },
  pipeline: {
    id: 42,
    name: "CI Pipeline",
    status: "failed",
    lastRun: "2026-01-01T10:15:00Z",
  },
  tests: [
    {
      name: "Login should succeed",
      status: "passed",
    },
    {
      name: "Booking creation",
      status: "failed",
      error: "Expected 200 but got 500",
    },
    {
      name: "Webhook handler",
      status: "failed",
      error: "Timeout after 30s",
    },
  ],
  logs: `Error: Database connection failed
at createBooking (/app/api/bookings/route.ts:42)
at processRequest (node:internal)
`,
};

export const mockBuilds = [
  {
    id: "1",
    buildNumber: "2026.1.42",
    status: "failed",
    result: "failed",
    createdAt: new Date("2026-01-15T10:30:00Z").toISOString(),
    pipeline: {
      name: "CI Pipeline",
      azure_project_name: "BuildDoctor Demo Project",
    },
    diagnosis: {
      category: "compilation",
      rootCause: "Missing dependency: @types/node version mismatch",
      explanation: "The project requires @types/node@^18 but version 20 is installed",
      suggestedFix: "npm install --save-dev @types/node@^18",
      confidence: 0.95,
    },
  },
  {
    id: "2",
    buildNumber: "2026.1.41",
    status: "failed",
    result: "failed",
    createdAt: new Date("2026-01-15T09:15:00Z").toISOString(),
    pipeline: {
      name: "CI Pipeline",
      azure_project_name: "BuildDoctor Demo Project",
    },
    diagnosis: {
      category: "test",
      rootCause: "Test timeout in integration test suite",
      explanation: "The test suite exceeded the 30s timeout limit due to slow database queries",
      suggestedFix: "Increase test timeout or optimize database queries",
      confidence: 0.88,
    },
  },
  {
    id: "3",
    buildNumber: "2026.1.40",
    status: "failed",
    result: "failed",
    createdAt: new Date("2026-01-14T16:45:00Z").toISOString(),
    pipeline: {
      name: "CI Pipeline",
      azure_project_name: "BuildDoctor Demo Project",
    },
    diagnosis: {
      category: "dependency",
      rootCause: "Package lock file out of sync with package.json",
      explanation: "npm ci failed because package-lock.json doesn't match package.json",
      suggestedFix: "Delete package-lock.json and run npm install",
      confidence: 0.92,
    },
  },
];

export const mockProjects = [
  {
    id: "demo-project-1",
    name: "BuildDoctor Demo Project",
  },
];

export const mockPipelines = [
  {
    id: 42,
    name: "CI Pipeline",
    folder: "\\",
  },
  {
    id: 43,
    name: "Deploy Pipeline",
    folder: "\\",
  },
];

