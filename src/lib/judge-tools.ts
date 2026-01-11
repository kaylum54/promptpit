// Judge system prompt
export const JUDGE_SYSTEM_PROMPT = `You are the Judge in PromptPit, an AI debate arena. Your job is to fairly evaluate responses from multiple AI models on the same prompt.

You MUST use the provided tools to score each response before rendering your verdict. Call each scoring tool for each model, then call generate_verdict.

Be fair, specific, and entertaining in your analysis. Reference concrete examples from the responses.`;

// Tool definitions for OpenRouter/Claude tool use
export const judgeTools = [
  {
    type: "function" as const,
    function: {
      name: "score_reasoning",
      description: "Evaluate the logical reasoning quality of a model's response. Consider argument structure, evidence usage, and logical coherence.",
      parameters: {
        type: "object",
        properties: {
          model: { type: "string", description: "Model name being scored" },
          score: { type: "number", description: "Score from 1-10" },
          rationale: { type: "string", description: "Brief explanation for score" }
        },
        required: ["model", "score", "rationale"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "score_clarity",
      description: "Evaluate how clearly the model communicated its points. Consider structure, readability, and conciseness.",
      parameters: {
        type: "object",
        properties: {
          model: { type: "string", description: "Model name being scored" },
          score: { type: "number", description: "Score from 1-10" },
          rationale: { type: "string", description: "Brief explanation for score" }
        },
        required: ["model", "score", "rationale"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "score_persuasiveness",
      description: "Evaluate how persuasive and compelling the response is. Consider rhetorical effectiveness and engagement.",
      parameters: {
        type: "object",
        properties: {
          model: { type: "string", description: "Model name being scored" },
          score: { type: "number", description: "Score from 1-10" },
          rationale: { type: "string", description: "Brief explanation for score" }
        },
        required: ["model", "score", "rationale"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "generate_verdict",
      description: "Generate the final verdict after all scores are complete. Declare a winner and summarise the debate.",
      parameters: {
        type: "object",
        properties: {
          winner: { type: "string", description: "Name of the winning model" },
          verdict: { type: "string", description: "2-3 sentence entertaining verdict" },
          highlight: { type: "string", description: "Best moment or quote from the debate" }
        },
        required: ["winner", "verdict", "highlight"]
      }
    }
  }
];

// Helper to build the judge prompt with all responses
export function buildJudgePrompt(prompt: string, responses: Record<string, string>): string {
  let content = `# Debate Topic\n${prompt}\n\n# Model Responses\n\n`;

  for (const [model, response] of Object.entries(responses)) {
    content += `## ${model}\n${response}\n\n`;
  }

  content += `\nPlease evaluate each model's response using the scoring tools, then generate your final verdict.`;

  return content;
}

// Type for parsed tool call results
export interface ToolCallResult {
  tool: string;
  input: {
    model?: string;
    score?: number;
    rationale?: string;
    winner?: string;
    verdict?: string;
    highlight?: string;
  };
}
