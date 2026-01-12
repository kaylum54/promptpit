/**
 * Judge Configuration Index
 * Exports all judge personas and utility functions
 */

import { arbiter } from './arbiter';
import { architect } from './architect';
import { editor } from './editor';

// Re-export individual judges
export { arbiter } from './arbiter';
export { architect } from './architect';
export { editor } from './editor';

// Type definitions
export type ArenaType = 'debate' | 'code' | 'writing';

export interface ScoringCategory {
  id: string;
  name: string;
  description: string;
}

export interface JudgeConfig {
  name: string;
  title: string;
  systemPrompt: string;
  scoringCategories: readonly ScoringCategory[];
}

// Map arenas to their judges
const judgeMap: Record<ArenaType, JudgeConfig> = {
  debate: arbiter,
  code: architect,
  writing: editor,
};

/**
 * Get the judge configuration for a specific arena
 * @param arena - The arena type ('debate', 'code', or 'writing')
 * @returns The judge configuration for that arena
 */
export function getJudgeConfig(arena: ArenaType): JudgeConfig {
  const judge = judgeMap[arena];
  if (!judge) {
    throw new Error(`Unknown arena type: ${arena}`);
  }
  return judge;
}

/**
 * Get all available judges
 * @returns Array of all judge configurations
 */
export function getAllJudges(): JudgeConfig[] {
  return [arbiter, architect, editor];
}

/**
 * Get scoring categories for a specific arena
 * @param arena - The arena type
 * @returns Array of scoring categories
 */
export function getScoringCategories(arena: ArenaType): readonly ScoringCategory[] {
  return getJudgeConfig(arena).scoringCategories;
}

/**
 * Get category IDs for a specific arena (useful for validation)
 * @param arena - The arena type
 * @returns Array of category ID strings
 */
export function getCategoryIds(arena: ArenaType): string[] {
  return getJudgeConfig(arena).scoringCategories.map(cat => cat.id);
}
