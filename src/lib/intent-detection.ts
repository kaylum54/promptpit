/**
 * Intent Detection System
 * Categorizes prompts into task types for routing to the best AI model
 */

export type IntentCategory = 'writing' | 'code' | 'research' | 'analysis' | 'general';

// Pattern definitions for each category
const categoryPatterns: Record<IntentCategory, RegExp[]> = {
  writing: [
    // Direct writing requests
    /\b(write|draft|compose|create)\b.*\b(email|letter|post|article|blog|copy|content|message|script|story|essay|report|proposal|speech|bio|caption|headline|tagline|slogan)\b/i,
    /\b(email|letter|post|article|blog)\b.*\b(about|for|to)\b/i,
    /^write\b/i,
    /^draft\b/i,
    /^compose\b/i,
    /\b(rewrite|rephrase|paraphrase|edit|proofread|improve)\b.*\b(this|my|the)\b/i,
    /\b(make|help).*(sound|read|flow)\b.*\b(better|professional|casual|formal)\b/i,
    /\b(tone|voice|style)\b.*\b(change|adjust|modify)\b/i,
    /\b(marketing|sales|cold)\b.*\b(copy|email|outreach)\b/i,
    /\b(linkedin|twitter|instagram|social media)\b.*\b(post|content|bio)\b/i,
  ],
  code: [
    // Programming keywords
    /\b(code|implement|function|class|method|script|algorithm|program)\b/i,
    /\b(debug|fix|error|bug|issue|crash|exception)\b.*\b(code|function|script|program|app)\b/i,
    /\b(code|function|script|program|app)\b.*\b(debug|fix|error|bug|issue)\b/i,
    // Programming languages
    /\b(python|javascript|typescript|react|nextjs|vue|angular|sql|html|css|java|rust|go|golang|ruby|php|swift|kotlin|c\+\+|csharp|c#)\b/i,
    // Technical terms
    /\b(api|endpoint|database|query|schema|migration|orm|rest|graphql|webhook)\b/i,
    /\b(component|hook|state|props|context|reducer|middleware)\b/i,
    /\b(docker|kubernetes|aws|deployment|ci\/cd|devops)\b/i,
    /\b(regex|regular expression|pattern matching)\b/i,
    /\b(npm|yarn|pip|package|dependency|module|import)\b/i,
    // Code blocks in prompt
    /```[\s\S]*```/,
    /`[^`]+`/,
    // Technical requests
    /\b(refactor|optimize|performance|test|unit test|integration)\b/i,
    /\b(build|create|set up|configure)\b.*\b(app|application|server|backend|frontend)\b/i,
  ],
  research: [
    // Question patterns
    /^what (is|are|was|were|does|do|did)\b/i,
    /^who (is|are|was|were)\b/i,
    /^when (did|was|is|are|will)\b/i,
    /^where (is|are|was|were|can|do)\b/i,
    /^why (is|are|was|were|do|does|did)\b/i,
    /^how (does|do|did|is|are|was|were|can|to)\b/i,
    // Research verbs
    /\b(research|find out|look up|search for|learn about)\b/i,
    /\b(explain|summarize|summary|overview|breakdown|primer)\b/i,
    /\b(tell me about|what do you know about|information on|facts about)\b/i,
    /\b(history of|background on|origin of)\b/i,
    /\b(define|definition|meaning of)\b/i,
    /\b(list|enumerate|name)\b.*\b(types|kinds|examples|categories)\b/i,
  ],
  analysis: [
    // Analysis verbs
    /\b(analyze|analyse|evaluate|assess|review|critique|examine)\b/i,
    // Comparison and decision
    /\b(pros and cons|trade-offs|tradeoffs|advantages|disadvantages|benefits|drawbacks)\b/i,
    /\b(should I|would you recommend|what do you think|what's your opinion|which is better)\b/i,
    /\b(compare|comparison|versus|vs\.?|between)\b/i,
    /\b(decision|choose|pick|select|decide)\b.*\b(between|which|what)\b/i,
    /\b(help me decide|help me choose)\b/i,
    // Strategic thinking
    /\b(strategy|approach|plan|roadmap)\b.*\b(for|to)\b/i,
    /\b(evaluate|assess)\b.*\b(risk|opportunity|option|possibility)\b/i,
    /\b(break down|breakdown|dissect)\b.*\b(problem|issue|situation)\b/i,
    /\b(feedback on|thoughts on|opinion on|take on)\b/i,
  ],
  general: [], // Fallback - no patterns needed
};

// Keyword scoring for additional confidence
const categoryKeywords: Record<IntentCategory, string[]> = {
  writing: ['write', 'draft', 'compose', 'email', 'blog', 'article', 'copy', 'content', 'message', 'letter', 'story', 'essay', 'tone', 'voice'],
  code: ['code', 'function', 'bug', 'error', 'api', 'database', 'implement', 'debug', 'script', 'programming', 'developer', 'software'],
  research: ['what', 'explain', 'research', 'learn', 'find', 'tell me', 'how does', 'why', 'history', 'define', 'meaning'],
  analysis: ['analyze', 'compare', 'evaluate', 'pros', 'cons', 'should', 'decide', 'choose', 'better', 'versus', 'opinion', 'recommend'],
  general: [],
};

/**
 * Detects the intent/category of a prompt
 * Returns the most likely category based on pattern matching and keyword scoring
 */
export function detectIntent(prompt: string): IntentCategory {
  const normalizedPrompt = prompt.toLowerCase().trim();

  // Track scores for each category
  const scores: Record<IntentCategory, number> = {
    writing: 0,
    code: 0,
    research: 0,
    analysis: 0,
    general: 0,
  };

  // Check pattern matches (high confidence)
  for (const [category, patterns] of Object.entries(categoryPatterns) as [IntentCategory, RegExp[]][]) {
    for (const pattern of patterns) {
      if (pattern.test(prompt)) {
        scores[category] += 10;
      }
    }
  }

  // Check keyword presence (lower confidence)
  for (const [category, keywords] of Object.entries(categoryKeywords) as [IntentCategory, string[]][]) {
    for (const keyword of keywords) {
      if (normalizedPrompt.includes(keyword.toLowerCase())) {
        scores[category] += 2;
      }
    }
  }

  // Find the category with the highest score
  let maxScore = 0;
  let detectedCategory: IntentCategory = 'general';

  for (const [category, score] of Object.entries(scores) as [IntentCategory, number][]) {
    if (score > maxScore) {
      maxScore = score;
      detectedCategory = category;
    }
  }

  // Only return a specific category if we have enough confidence
  // Otherwise fall back to general
  if (maxScore < 5) {
    return 'general';
  }

  return detectedCategory;
}

/**
 * Gets a human-readable label for a category
 */
export function getCategoryLabel(category: IntentCategory): string {
  const labels: Record<IntentCategory, string> = {
    writing: 'Writing',
    code: 'Code',
    research: 'Research',
    analysis: 'Analysis',
    general: 'General',
  };
  return labels[category];
}

/**
 * Gets an icon/emoji for a category
 */
export function getCategoryIcon(category: IntentCategory): string {
  const icons: Record<IntentCategory, string> = {
    writing: '✍️',
    code: '💻',
    research: '🔍',
    analysis: '📊',
    general: '💬',
  };
  return icons[category];
}
