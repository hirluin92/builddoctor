export interface DiagnosisData {
  rootCause: string;
  explanation: string;
  suggestedFix: string;
  errorCategory: string;
}

export interface BuildData {
  buildNumber: string;
  pipelineName: string;
}

export async function sendDiagnosis(
  webhookUrl: string,
  diagnosis: DiagnosisData,
  build: BuildData
): Promise<boolean> {
  try {
    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `🔴 Build #${build.buildNumber} Failed — ${build.pipelineName}`,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Category:*\n${diagnosis.errorCategory}`,
          },
          {
            type: "mrkdwn",
            text: `*Root Cause:*\n${diagnosis.rootCause}`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Explanation:*\n${diagnosis.explanation}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Suggested Fix:*\n\`\`\`${diagnosis.suggestedFix}\`\`\``,
        },
      },
    ];

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        blocks,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error sending Slack notification:", error);
    return false;
  }
}

export async function sendTestMessage(webhookUrl: string): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: "✅ BuildDoctor connected!",
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error sending test message:", error);
    return false;
  }
}

