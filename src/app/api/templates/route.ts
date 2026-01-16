/**
 * Templates API Route
 * GET - Fetch available PRD templates
 */

import { NextRequest, NextResponse } from 'next/server';
import { prdTemplates, PRDTemplate } from '@/lib/prd-templates';

// Frontend-friendly template format
interface TemplateResponse {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  features: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  popular?: boolean;
  new?: boolean;
  pitfalls: string[];
  examplePrompts: string[];
}

// Map library categories to page categories
const categoryMap: Record<string, string> = {
  saas: 'saas',
  marketplace: 'ecommerce',
  social: 'saas',
  tool: 'internal',
  api: 'saas',
  extension: 'saas',
  ai: 'ai',
};

// Estimate difficulty based on feature count and complexity
function estimateDifficulty(template: PRDTemplate): 'beginner' | 'intermediate' | 'advanced' {
  const featureCount = template.default_features?.v1?.length || 0;
  const hasPayments = template.suggested_integrations?.some(i =>
    i.toLowerCase().includes('stripe') || i.toLowerCase().includes('payment')
  );
  const hasRealtime = template.suggested_integrations?.some(i =>
    i.toLowerCase().includes('pusher') || i.toLowerCase().includes('ably') || i.toLowerCase().includes('redis')
  );

  if (featureCount >= 5 || (hasPayments && hasRealtime)) return 'advanced';
  if (featureCount >= 4 || hasPayments) return 'intermediate';
  return 'beginner';
}

// Estimate time based on template complexity
function estimateTime(template: PRDTemplate): string {
  const difficulty = estimateDifficulty(template);
  switch (difficulty) {
    case 'beginner': return '1-2 weeks';
    case 'intermediate': return '2-4 weeks';
    case 'advanced': return '4-6 weeks';
    default: return '2-3 weeks';
  }
}

// Get feature names from template
function getFeatureNames(template: PRDTemplate): string[] {
  return template.default_features?.v1?.map(f => f.name) || [];
}

// GET - Fetch all templates
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    let templates = prdTemplates;

    // Filter by category if provided
    if (category && category !== 'all') {
      templates = templates.filter(t => categoryMap[t.category] === category || t.category === category);
    }

    // Transform to frontend format
    const formattedTemplates: TemplateResponse[] = templates.map((template, index) => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: categoryMap[template.category] || template.category,
      icon: template.icon,
      features: getFeatureNames(template),
      difficulty: estimateDifficulty(template),
      estimatedTime: estimateTime(template),
      popular: index < 2, // First two are popular
      new: template.category === 'ai', // AI templates are new
      pitfalls: template.common_pitfalls || [],
      examplePrompts: template.example_prompts || [],
    }));

    return NextResponse.json({
      templates: formattedTemplates,
      total: formattedTemplates.length,
    });
  } catch (error) {
    console.error('Templates GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
