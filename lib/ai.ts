import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface Classification {
  category: string;
  relevantLines: string;
  confidence: number;
  primaryError: string;
}

export interface Diagnosis {
  rootCause: string;
  explanation: string;
  suggestedFix: string;
  confidence: number;
}

export interface FullDiagnosis extends Classification, Diagnosis {}

const CLASSIFICATION_PROMPT = `You are an expert CI/CD engineer specialized in Azure DevOps and .NET.

Analyze this build log and:
1. Identify the PRIMARY error category
2. Extract the 20-50 most relevant lines containing the actual error
3. Rate your confidence (0-1)

Categories: compilation, dependency, test, deployment, configuration, permission, timeout, unknown

BUILD LOG:
{logs}

Respond in JSON only:
{"category": "string", "relevantLines": "string", "confidence": 0.0, "primaryError": "one-line summary"}`;

const DIAGNOSIS_PROMPT = `You are an expert .NET/Azure DevOps engineer. A {category} error occurred.

ERROR CONTEXT:
{relevantLines}

Provide:
1. Root Cause: What specifically caused this (1-2 sentences, be specific)
2. Explanation: Why this happened (2-3 sentences, simple terms)
3. Suggested Fix: Exact commands or code to fix it (copy-paste ready)

Respond in JSON only:
{"rootCause": "string", "explanation": "string", "suggestedFix": "string", "confidence": 0.0}`;

// Limita i log a 50000 caratteri per evitare token limit
function truncateLogs(logs: string, maxLength: number = 50000): string {
  if (logs.length <= maxLength) return logs;
  return logs.substring(0, maxLength) + "\n\n... (logs truncated)";
}

export async function classifyError(logs: string): Promise<Classification> {
  const truncatedLogs = truncateLogs(logs);
  const prompt = CLASSIFICATION_PROMPT.replace("{logs}", truncatedLogs);

  const message = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }

  try {
    const result = JSON.parse(content.text);
    return {
      category: result.category || "unknown",
      relevantLines: result.relevantLines || "",
      confidence: result.confidence || 0.5,
      primaryError: result.primaryError || "Unknown error",
    };
  } catch (error) {
    // Fallback se il JSON non è valido
    return {
      category: "unknown",
      relevantLines: logs.substring(0, 500),
      confidence: 0.3,
      primaryError: "Failed to parse error",
    };
  }
}

export async function generateDiagnosis(
  category: string,
  relevantLines: string
): Promise<Diagnosis> {
  const prompt = DIAGNOSIS_PROMPT.replace("{category}", category).replace(
    "{relevantLines}",
    relevantLines
  );

  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }

  try {
    const result = JSON.parse(content.text);
    return {
      rootCause: result.rootCause || "Unable to determine root cause",
      explanation: result.explanation || "Error analysis failed",
      suggestedFix: result.suggestedFix || "Please check the logs manually",
      confidence: result.confidence || 0.5,
    };
  } catch (error) {
    // Fallback se il JSON non è valido
    return {
      rootCause: "Unable to parse diagnosis",
      explanation: "The AI response could not be parsed",
      suggestedFix: "Please review the build logs manually",
      confidence: 0.2,
    };
  }
}

export async function diagnoseBuild(logs: string): Promise<FullDiagnosis> {
  // Pass 1: Classification
  const classification = await classifyError(logs);

  // Pass 2: Diagnosis
  const diagnosis = await generateDiagnosis(
    classification.category,
    classification.relevantLines
  );

  return {
    ...classification,
    ...diagnosis,
  };
}

