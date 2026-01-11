import { type ArenaMode, ARENA_MODES } from './modes';

// Base judge system prompt
const BASE_JUDGE_PROMPT = `You are the Judge in PromptPit, an AI arena. Your job is to fairly evaluate responses from multiple AI models on the same prompt.

You MUST use the provided tools to score each response before rendering your verdict. Call each scoring tool for each model, then call generate_verdict.

IMPORTANT for rationales:
- Write rationales as short, punchy phrases (5-15 words) that capture the essence of why you gave that score
- Be specific and reference actual content from the response
- Use varied, engaging language - avoid robotic phrases like "demonstrates good" or "shows adequate"
- Examples of good rationales:
  - "Nailed the core argument with surgical precision"
  - "Meandering logic that loses the thread halfway"
  - "Crystal clear but lacks the punch to persuade"
  - "Built a compelling case brick by brick"

Be fair, specific, and entertaining in your analysis. Make the judging feel like sports commentary, not a dry evaluation.`;

// Mode-specific judge prompt additions
const MODE_JUDGE_ADDITIONS: Record<ArenaMode, string> = {
  debate: `\n\nFor DEBATE mode, focus on:
- Quality of argumentation and reasoning
- How well they address the topic
- Persuasive power of their response`,

  code: `\n\nFor CODE ARENA mode, focus on:
- Does the code actually solve the problem correctly?
- Is the code clean, readable, and well-structured?
- Is it efficient in terms of time/space complexity?
- Are edge cases handled?`,

  creative: `\n\nFor CREATIVE WRITING mode, focus on:
- Originality and fresh perspectives
- Quality of prose, imagery, and language
- Emotional resonance and impact
- How well it fits the creative brief`,
};

// Get the judge system prompt for a specific mode
export function getJudgeSystemPrompt(mode: ArenaMode = 'debate'): string {
  const modeAddition = MODE_JUDGE_ADDITIONS[mode] || MODE_JUDGE_ADDITIONS.debate;
  return BASE_JUDGE_PROMPT + modeAddition;
}

// Legacy export for backwards compatibility
export const JUDGE_SYSTEM_PROMPT = getJudgeSystemPrompt('debate');

// Scoring tool definitions by mode
const DEBATE_TOOLS = [
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
          rationale: { type: "string", description: "A punchy 5-15 word phrase explaining the score, like sports commentary" }
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
          rationale: { type: "string", description: "A punchy 5-15 word phrase explaining the score, like sports commentary" }
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
          rationale: { type: "string", description: "A punchy 5-15 word phrase explaining the score, like sports commentary" }
        },
        required: ["model", "score", "rationale"]
      }
    }
  },
];

const CODE_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "score_correctness",
      description: "Evaluate if the code correctly solves the problem. Does it produce the expected output? Does it handle inputs properly?",
      parameters: {
        type: "object",
        properties: {
          model: { type: "string", description: "Model name being scored" },
          score: { type: "number", description: "Score from 1-10" },
          rationale: { type: "string", description: "A punchy 5-15 word phrase explaining the score" }
        },
        required: ["model", "score", "rationale"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "score_code_quality",
      description: "Evaluate code quality: readability, structure, naming conventions, documentation, and best practices.",
      parameters: {
        type: "object",
        properties: {
          model: { type: "string", description: "Model name being scored" },
          score: { type: "number", description: "Score from 1-10" },
          rationale: { type: "string", description: "A punchy 5-15 word phrase explaining the score" }
        },
        required: ["model", "score", "rationale"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "score_efficiency",
      description: "Evaluate the efficiency of the solution: time complexity, space complexity, and algorithmic approach.",
      parameters: {
        type: "object",
        properties: {
          model: { type: "string", description: "Model name being scored" },
          score: { type: "number", description: "Score from 1-10" },
          rationale: { type: "string", description: "A punchy 5-15 word phrase explaining the score" }
        },
        required: ["model", "score", "rationale"]
      }
    }
  },
];

const CREATIVE_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "score_originality",
      description: "Evaluate originality and creativity. Is it fresh, unique, and inventive? Does it offer a new perspective?",
      parameters: {
        type: "object",
        properties: {
          model: { type: "string", description: "Model name being scored" },
          score: { type: "number", description: "Score from 1-10" },
          rationale: { type: "string", description: "A punchy 5-15 word phrase explaining the score" }
        },
        required: ["model", "score", "rationale"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "score_craft",
      description: "Evaluate the quality of prose, imagery, language use, and literary technique.",
      parameters: {
        type: "object",
        properties: {
          model: { type: "string", description: "Model name being scored" },
          score: { type: "number", description: "Score from 1-10" },
          rationale: { type: "string", description: "A punchy 5-15 word phrase explaining the score" }
        },
        required: ["model", "score", "rationale"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "score_emotional_impact",
      description: "Evaluate emotional resonance. Does it evoke feelings? Does it connect with the reader?",
      parameters: {
        type: "object",
        properties: {
          model: { type: "string", description: "Model name being scored" },
          score: { type: "number", description: "Score from 1-10" },
          rationale: { type: "string", description: "A punchy 5-15 word phrase explaining the score" }
        },
        required: ["model", "score", "rationale"]
      }
    }
  },
];

const VERDICT_TOOL = {
  type: "function" as const,
  function: {
    name: "generate_verdict",
    description: "Generate the final verdict after all scores are complete. Declare a winner and summarise the competition.",
    parameters: {
      type: "object",
      properties: {
        winner: { type: "string", description: "Name of the winning model" },
        verdict: { type: "string", description: "2-3 sentence entertaining verdict" },
        highlight: { type: "string", description: "Best moment or quote from the responses" }
      },
      required: ["winner", "verdict", "highlight"]
    }
  }
};

// Get tools for a specific mode
export function getJudgeTools(mode: ArenaMode = 'debate') {
  let scoringTools;
  switch (mode) {
    case 'code':
      scoringTools = CODE_TOOLS;
      break;
    case 'creative':
      scoringTools = CREATIVE_TOOLS;
      break;
    default:
      scoringTools = DEBATE_TOOLS;
  }
  return [...scoringTools, VERDICT_TOOL];
}

// Legacy export for backwards compatibility
export const judgeTools = getJudgeTools('debate');

// Helper to build the judge prompt with all responses
export function buildJudgePrompt(prompt: string, responses: Record<string, string>, mode: ArenaMode = 'debate'): string {
  const modeConfig = ARENA_MODES[mode];
  const modeTitle = modeConfig?.name || 'Debate Arena';

  let content = `# ${modeTitle} Challenge\n${prompt}\n\n# Model Responses\n\n`;

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

// Get scoring categories for a mode (used by UI to display scores)
export function getScoringCategories(mode: ArenaMode = 'debate'): string[] {
  switch (mode) {
    case 'code':
      return ['correctness', 'code_quality', 'efficiency'];
    case 'creative':
      return ['originality', 'craft', 'emotional_impact'];
    default:
      return ['reasoning', 'clarity', 'persuasiveness'];
  }
}
