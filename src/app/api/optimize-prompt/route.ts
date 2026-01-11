/**
 * Prompt Optimizer API
 * Uses AI to improve user prompts before debating
 */

import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Use a fast, cheap model for optimization
    const response = await fetch(OPENROUTER_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'PromptPit',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001', // Fast and cheap
        messages: [
          {
            role: 'system',
            content: `You are a prompt optimization expert. Your job is to improve debate prompts to be clearer, more specific, and more likely to generate insightful AI responses.

Rules:
- Keep the core topic/question intact
- Make it more specific and debatable
- Add context if helpful
- Keep it concise (1-2 sentences max)
- Don't add your own opinion
- Return ONLY the improved prompt, nothing else`
          },
          {
            role: 'user',
            content: `Improve this debate prompt: "${prompt.trim()}"`
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', errorText);
      return NextResponse.json({ error: 'Failed to optimize prompt' }, { status: 500 });
    }

    const data = await response.json();
    const optimizedPrompt = data.choices?.[0]?.message?.content?.trim() || prompt;

    // Clean up the response (remove quotes if wrapped)
    let cleaned = optimizedPrompt;
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1);
    }
    if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
      cleaned = cleaned.slice(1, -1);
    }

    return NextResponse.json({
      original: prompt.trim(),
      optimized: cleaned,
    });
  } catch (error) {
    console.error('Prompt optimization error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
