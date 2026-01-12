/**
 * Arena-specific judge tools for PromptPit
 *
 * Each arena type has its own set of scoring tools tailored to evaluate
 * responses in that specific domain. Tools follow the Anthropic tool format.
 */

// Tool type definition following Anthropic's format
export interface ToolProperty {
  type: string;
  description: string;
  items?: {
    type: string;
    description?: string;
    properties?: Record<string, { type: string; description: string }>;
    required?: string[];
  };
}

export interface Tool {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, ToolProperty>;
    required: string[];
  };
}

// ============================================================================
// DEBATE ARENA TOOLS
// ============================================================================

export const debateTools: Tool[] = [
  {
    name: "score_reasoning",
    description: "Evaluate the logical reasoning quality of a model's response. Consider argument structure, evidence usage, logical coherence, and how well conclusions follow from premises.",
    input_schema: {
      type: "object",
      properties: {
        model: { type: "string", description: "The model name being scored (e.g., 'GPT-4', 'Claude')" },
        score: { type: "number", description: "Score from 1-10 where 1 is poor reasoning and 10 is flawless logic" },
        rationale: { type: "string", description: "A punchy 5-15 word phrase explaining the score, like sports commentary" }
      },
      required: ["model", "score", "rationale"]
    }
  },
  {
    name: "score_clarity",
    description: "Evaluate how clearly the model communicated its points. Consider structure, readability, conciseness, and how easy it is to follow the argument.",
    input_schema: {
      type: "object",
      properties: {
        model: { type: "string", description: "The model name being scored" },
        score: { type: "number", description: "Score from 1-10 where 1 is confusing and 10 is crystal clear" },
        rationale: { type: "string", description: "A punchy 5-15 word phrase explaining the score, like sports commentary" }
      },
      required: ["model", "score", "rationale"]
    }
  },
  {
    name: "score_persuasiveness",
    description: "Evaluate how persuasive and compelling the response is. Consider rhetorical effectiveness, engagement, and ability to convince the reader.",
    input_schema: {
      type: "object",
      properties: {
        model: { type: "string", description: "The model name being scored" },
        score: { type: "number", description: "Score from 1-10 where 1 is unconvincing and 10 is highly persuasive" },
        rationale: { type: "string", description: "A punchy 5-15 word phrase explaining the score, like sports commentary" }
      },
      required: ["model", "score", "rationale"]
    }
  },
  {
    name: "score_depth",
    description: "Evaluate the depth and thoroughness of the response. Consider how comprehensively the topic is covered, nuance shown, and substance provided.",
    input_schema: {
      type: "object",
      properties: {
        model: { type: "string", description: "The model name being scored" },
        score: { type: "number", description: "Score from 1-10 where 1 is shallow and 10 is deeply comprehensive" },
        rationale: { type: "string", description: "A punchy 5-15 word phrase explaining the score, like sports commentary" }
      },
      required: ["model", "score", "rationale"]
    }
  },
  {
    name: "write_model_analysis",
    description: "Write a detailed analysis of a model's overall performance in this debate.",
    input_schema: {
      type: "object",
      properties: {
        model: { type: "string", description: "The model name being analyzed" },
        analysis: { type: "string", description: "2-4 sentence analysis of the model's overall performance" },
        strongest_moment: { type: "string", description: "Quote or description of the model's best moment" },
        weakness: { type: "string", description: "Brief description of the model's main weakness" }
      },
      required: ["model", "analysis", "strongest_moment", "weakness"]
    }
  },
  {
    name: "write_head_to_head",
    description: "Write a direct comparison between the competing models.",
    input_schema: {
      type: "object",
      properties: {
        comparison: { type: "string", description: "2-4 sentence head-to-head comparison of how the models matched up" }
      },
      required: ["comparison"]
    }
  },
  {
    name: "write_opening_remarks",
    description: "Write entertaining opening remarks to set up the judging, like a sports announcer.",
    input_schema: {
      type: "object",
      properties: {
        remarks: { type: "string", description: "1-3 sentences of engaging opening commentary about this matchup" }
      },
      required: ["remarks"]
    }
  },
  {
    name: "generate_verdict",
    description: "Generate the final verdict after all scores are complete. Declare a winner and deliver a memorable conclusion.",
    input_schema: {
      type: "object",
      properties: {
        winner: { type: "string", description: "Name of the winning model" },
        verdict: { type: "string", description: "2-3 sentence entertaining verdict explaining the decision" },
        quotable_line: { type: "string", description: "A punchy, memorable one-liner summarizing the outcome" }
      },
      required: ["winner", "verdict", "quotable_line"]
    }
  }
];

// ============================================================================
// CODE ARENA TOOLS
// ============================================================================

export const codeTools: Tool[] = [
  {
    name: "score_correctness",
    description: "Evaluate if the code correctly solves the problem. Does it produce expected output? Handle edge cases? Contain bugs?",
    input_schema: {
      type: "object",
      properties: {
        model: { type: "string", description: "The model name being scored" },
        score: { type: "number", description: "Score from 1-10 where 1 is completely broken and 10 is perfectly correct" },
        rationale: { type: "string", description: "A punchy 5-15 word phrase explaining the score" },
        bugs_found: {
          type: "array",
          description: "List of bugs or issues found in the code",
          items: { type: "string", description: "Description of a specific bug or issue" }
        }
      },
      required: ["model", "score", "rationale", "bugs_found"]
    }
  },
  {
    name: "score_efficiency",
    description: "Evaluate the efficiency of the solution in terms of time and space complexity.",
    input_schema: {
      type: "object",
      properties: {
        model: { type: "string", description: "The model name being scored" },
        score: { type: "number", description: "Score from 1-10 where 1 is highly inefficient and 10 is optimally efficient" },
        rationale: { type: "string", description: "A punchy 5-15 word phrase explaining the score" },
        complexity: { type: "string", description: "Big-O notation for time/space complexity (e.g., 'O(n log n) time, O(n) space')" }
      },
      required: ["model", "score", "rationale", "complexity"]
    }
  },
  {
    name: "score_readability",
    description: "Evaluate code readability including naming conventions, comments, and structure.",
    input_schema: {
      type: "object",
      properties: {
        model: { type: "string", description: "The model name being scored" },
        score: { type: "number", description: "Score from 1-10 where 1 is unreadable and 10 is beautifully clear" },
        rationale: { type: "string", description: "A punchy 5-15 word phrase explaining the score" }
      },
      required: ["model", "score", "rationale"]
    }
  },
  {
    name: "score_best_practices",
    description: "Evaluate adherence to coding best practices, patterns, and conventions for the language used.",
    input_schema: {
      type: "object",
      properties: {
        model: { type: "string", description: "The model name being scored" },
        score: { type: "number", description: "Score from 1-10 where 1 ignores best practices and 10 is exemplary" },
        rationale: { type: "string", description: "A punchy 5-15 word phrase explaining the score" }
      },
      required: ["model", "score", "rationale"]
    }
  },
  {
    name: "score_elegance",
    description: "Evaluate the elegance and cleverness of the solution. Is it simple yet powerful? Creative approach?",
    input_schema: {
      type: "object",
      properties: {
        model: { type: "string", description: "The model name being scored" },
        score: { type: "number", description: "Score from 1-10 where 1 is clunky and 10 is elegantly brilliant" },
        rationale: { type: "string", description: "A punchy 5-15 word phrase explaining the score" }
      },
      required: ["model", "score", "rationale"]
    }
  },
  {
    name: "write_model_analysis",
    description: "Write a detailed analysis of a model's code submission.",
    input_schema: {
      type: "object",
      properties: {
        model: { type: "string", description: "The model name being analyzed" },
        analysis: { type: "string", description: "2-4 sentence analysis of the model's overall coding performance" },
        strongest_moment: { type: "string", description: "The best part of the code or approach" },
        weakness: { type: "string", description: "The main weakness or area for improvement" },
        code_snippet: { type: "string", description: "Optional: A notable code snippet to highlight (good or bad)" }
      },
      required: ["model", "analysis", "strongest_moment", "weakness"]
    }
  },
  {
    name: "write_head_to_head",
    description: "Write a direct comparison of how the code solutions matched up.",
    input_schema: {
      type: "object",
      properties: {
        comparison: { type: "string", description: "2-4 sentence comparison of the approaches and results" }
      },
      required: ["comparison"]
    }
  },
  {
    name: "write_opening_remarks",
    description: "Write entertaining opening remarks for this coding challenge, like a tech conference MC.",
    input_schema: {
      type: "object",
      properties: {
        remarks: { type: "string", description: "1-3 sentences of engaging opening commentary about this coding matchup" }
      },
      required: ["remarks"]
    }
  },
  {
    name: "generate_verdict",
    description: "Generate the final verdict for this coding challenge. Declare a winner based on the code quality.",
    input_schema: {
      type: "object",
      properties: {
        winner: { type: "string", description: "Name of the winning model" },
        verdict: { type: "string", description: "2-3 sentence verdict explaining why this code won" },
        quotable_line: { type: "string", description: "A punchy, memorable one-liner about the code battle" }
      },
      required: ["winner", "verdict", "quotable_line"]
    }
  }
];

// ============================================================================
// WRITING ARENA TOOLS
// ============================================================================

export const writingTools: Tool[] = [
  {
    name: "score_creativity",
    description: "Evaluate the creativity and originality of the writing. Fresh ideas, unique perspectives, inventive approaches.",
    input_schema: {
      type: "object",
      properties: {
        model: { type: "string", description: "The model name being scored" },
        score: { type: "number", description: "Score from 1-10 where 1 is generic and 10 is brilliantly original" },
        rationale: { type: "string", description: "A punchy 5-15 word phrase explaining the score" }
      },
      required: ["model", "score", "rationale"]
    }
  },
  {
    name: "score_style",
    description: "Evaluate the prose style, voice, and literary quality. Word choice, rhythm, imagery, and tone.",
    input_schema: {
      type: "object",
      properties: {
        model: { type: "string", description: "The model name being scored" },
        score: { type: "number", description: "Score from 1-10 where 1 is flat prose and 10 is masterful style" },
        rationale: { type: "string", description: "A punchy 5-15 word phrase explaining the score" }
      },
      required: ["model", "score", "rationale"]
    }
  },
  {
    name: "score_structure",
    description: "Evaluate the structure and organization of the piece. Pacing, flow, narrative arc, and coherence.",
    input_schema: {
      type: "object",
      properties: {
        model: { type: "string", description: "The model name being scored" },
        score: { type: "number", description: "Score from 1-10 where 1 is disorganized and 10 is perfectly structured" },
        rationale: { type: "string", description: "A punchy 5-15 word phrase explaining the score" }
      },
      required: ["model", "score", "rationale"]
    }
  },
  {
    name: "score_engagement",
    description: "Evaluate how engaging and compelling the writing is. Does it hook the reader and maintain interest?",
    input_schema: {
      type: "object",
      properties: {
        model: { type: "string", description: "The model name being scored" },
        score: { type: "number", description: "Score from 1-10 where 1 is boring and 10 is unputdownable" },
        rationale: { type: "string", description: "A punchy 5-15 word phrase explaining the score" }
      },
      required: ["model", "score", "rationale"]
    }
  },
  {
    name: "score_technical",
    description: "Evaluate technical writing quality. Grammar, spelling, punctuation, and language mechanics.",
    input_schema: {
      type: "object",
      properties: {
        model: { type: "string", description: "The model name being scored" },
        score: { type: "number", description: "Score from 1-10 where 1 is error-ridden and 10 is technically flawless" },
        rationale: { type: "string", description: "A punchy 5-15 word phrase explaining the score" }
      },
      required: ["model", "score", "rationale"]
    }
  },
  {
    name: "highlight_passages",
    description: "Highlight notable passages from a model's writing, both good and bad.",
    input_schema: {
      type: "object",
      properties: {
        model: { type: "string", description: "The model name whose passages are being highlighted" },
        passages: {
          type: "array",
          description: "Array of notable passages with commentary",
          items: {
            type: "object",
            properties: {
              quote: { type: "string", description: "The quoted passage from the writing" },
              comment: { type: "string", description: "Brief commentary on why this passage is notable" }
            },
            required: ["quote", "comment"]
          }
        }
      },
      required: ["model", "passages"]
    }
  },
  {
    name: "write_model_analysis",
    description: "Write a detailed analysis of a model's creative writing submission.",
    input_schema: {
      type: "object",
      properties: {
        model: { type: "string", description: "The model name being analyzed" },
        analysis: { type: "string", description: "2-4 sentence analysis of the model's writing" },
        strongest_moment: { type: "string", description: "The best moment or passage in the writing" },
        weakness: { type: "string", description: "The main weakness or area that fell flat" }
      },
      required: ["model", "analysis", "strongest_moment", "weakness"]
    }
  },
  {
    name: "write_head_to_head",
    description: "Write a direct literary comparison between the competing pieces.",
    input_schema: {
      type: "object",
      properties: {
        comparison: { type: "string", description: "2-4 sentence comparison of the writing styles and approaches" }
      },
      required: ["comparison"]
    }
  },
  {
    name: "write_opening_remarks",
    description: "Write entertaining opening remarks for this writing challenge, like a literary awards host.",
    input_schema: {
      type: "object",
      properties: {
        remarks: { type: "string", description: "1-3 sentences of engaging opening commentary about this creative matchup" }
      },
      required: ["remarks"]
    }
  },
  {
    name: "generate_verdict",
    description: "Generate the final verdict for this writing challenge. Crown a literary winner.",
    input_schema: {
      type: "object",
      properties: {
        winner: { type: "string", description: "Name of the winning model" },
        verdict: { type: "string", description: "2-3 sentence verdict explaining why this writing won" },
        quotable_line: { type: "string", description: "A punchy, memorable one-liner about the writing battle" }
      },
      required: ["winner", "verdict", "quotable_line"]
    }
  }
];

// ============================================================================
// ARENA TYPE
// ============================================================================

export type ArenaType = 'debate' | 'code' | 'writing';

// ============================================================================
// HELPER FUNCTION
// ============================================================================

/**
 * Get the appropriate tools array for a given arena type
 * @param arena - The arena type ('debate', 'code', or 'writing')
 * @returns The tools array for the specified arena
 */
export function getToolsForArena(arena: ArenaType): Tool[] {
  switch (arena) {
    case 'debate':
      return debateTools;
    case 'code':
      return codeTools;
    case 'writing':
      return writingTools;
    default:
      // TypeScript exhaustive check
      const _exhaustive: never = arena;
      throw new Error(`Unknown arena type: ${_exhaustive}`);
  }
}

/**
 * Get the scoring tool names for a given arena (excludes analysis/verdict tools)
 * @param arena - The arena type
 * @returns Array of scoring tool names
 */
export function getScoringToolNames(arena: ArenaType): string[] {
  switch (arena) {
    case 'debate':
      return ['score_reasoning', 'score_clarity', 'score_persuasiveness', 'score_depth'];
    case 'code':
      return ['score_correctness', 'score_efficiency', 'score_readability', 'score_best_practices', 'score_elegance'];
    case 'writing':
      return ['score_creativity', 'score_style', 'score_structure', 'score_engagement', 'score_technical'];
    default:
      return [];
  }
}

/**
 * Get display-friendly names for scoring categories
 * @param arena - The arena type
 * @returns Map of tool name to display name
 */
export function getScoringDisplayNames(arena: ArenaType): Record<string, string> {
  switch (arena) {
    case 'debate':
      return {
        score_reasoning: 'Reasoning',
        score_clarity: 'Clarity',
        score_persuasiveness: 'Persuasiveness',
        score_depth: 'Depth'
      };
    case 'code':
      return {
        score_correctness: 'Correctness',
        score_efficiency: 'Efficiency',
        score_readability: 'Readability',
        score_best_practices: 'Best Practices',
        score_elegance: 'Elegance'
      };
    case 'writing':
      return {
        score_creativity: 'Creativity',
        score_style: 'Style',
        score_structure: 'Structure',
        score_engagement: 'Engagement',
        score_technical: 'Technical'
      };
    default:
      return {};
  }
}
