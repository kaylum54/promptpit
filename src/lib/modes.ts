/**
 * Arena Modes for PromptPit
 * Different specialized modes for various types of AI competitions
 */

export type ArenaMode = 'debate' | 'code' | 'creative';

export interface ArenaModeConfig {
  id: ArenaMode;
  name: string;
  description: string;
  icon: string; // SVG path
  color: string;
  placeholder: string;
  examples: string[];
  systemPrompt: string;
  judgePrompt: string;
}

export const ARENA_MODES: Record<ArenaMode, ArenaModeConfig> = {
  debate: {
    id: 'debate',
    name: 'Debate Arena',
    description: 'AIs argue different perspectives on any topic',
    icon: 'M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155',
    color: '#3b82f6',
    placeholder: 'What should the AIs debate today?',
    examples: [
      'Is AI a threat to humanity?',
      'Should social media be regulated?',
      'Is remote work better than office work?',
    ],
    systemPrompt: `You are participating in a debate. Present a compelling argument for your assigned position. Be persuasive, use evidence and logic, and anticipate counterarguments. Keep your response focused and under 300 words.`,
    judgePrompt: `You are an impartial debate judge. Evaluate the arguments based on:
1. Logical coherence and reasoning
2. Evidence and examples provided
3. Persuasiveness and rhetoric
4. Addressing the core question
Declare a winner and explain your reasoning.`,
  },
  code: {
    id: 'code',
    name: 'Code Arena',
    description: 'AIs compete on programming challenges',
    icon: 'M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z',
    color: '#10b981',
    placeholder: 'Enter a coding challenge for the AIs...',
    examples: [
      'Write a function to find the longest palindromic substring',
      'Implement a debounce function in JavaScript',
      'Create a binary search tree with insert and search methods',
    ],
    systemPrompt: `You are competing in a coding challenge. Write clean, efficient, and well-documented code to solve the problem. Include:
1. Your solution code
2. Brief explanation of your approach
3. Time and space complexity analysis
Use markdown code blocks with appropriate language syntax highlighting.`,
    judgePrompt: `You are a senior software engineer judging a coding competition. Evaluate the solutions based on:
1. Correctness - Does the code solve the problem?
2. Code quality - Is it clean, readable, and well-structured?
3. Efficiency - Time and space complexity
4. Edge cases - Are edge cases handled?
5. Documentation - Is the code well explained?
Declare a winner and provide detailed feedback on each solution.`,
  },
  creative: {
    id: 'creative',
    name: 'Creative Writing',
    description: 'AIs craft stories, poems, and creative content',
    icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z',
    color: '#8b5cf6',
    placeholder: 'Give the AIs a creative writing prompt...',
    examples: [
      'Write a short story about a robot learning to love',
      'Compose a haiku about the beauty of code',
      'Create a dialogue between the sun and the moon',
    ],
    systemPrompt: `You are participating in a creative writing competition. Create an original, engaging, and well-crafted piece based on the prompt. Focus on:
1. Originality and creativity
2. Strong narrative or poetic voice
3. Vivid imagery and emotion
4. Proper structure and flow
Keep your response under 400 words unless the prompt specifies otherwise.`,
    judgePrompt: `You are a literary critic judging a creative writing competition. Evaluate the pieces based on:
1. Originality - Is it fresh and unique?
2. Craft - Quality of prose, imagery, and language
3. Emotional impact - Does it resonate?
4. Structure - Is it well-organized and purposeful?
5. Adherence to prompt - Does it fulfill the creative brief?
Declare a winner and provide thoughtful literary feedback.`,
  },
};

export function getModeConfig(mode: ArenaMode): ArenaModeConfig {
  return ARENA_MODES[mode];
}

export function getAllModes(): ArenaModeConfig[] {
  return Object.values(ARENA_MODES);
}
