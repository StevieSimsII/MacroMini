import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database, SubscriptionTier } from '@/lib/types';

/**
 * POST /api/analyze
 * Accepts { imageUrl } and returns structured nutrition JSON.
 *
 * Implementation: calls OpenAI GPT-4 Vision (or any LLM with vision).
 * Falls back to a mock response if no API key is configured.
 */
export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, imageUrl, userId } = await req.json();

    if (!imageBase64 && !imageUrl) {
      return NextResponse.json({ error: 'imageBase64 or imageUrl is required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Check usage limits
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's profile to check subscription and usage
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, analyses_count, analyses_reset_at')
      .eq('id', userId)
      .single() as any;

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Check if usage period has expired and needs reset
    const resetDate = new Date(profile.analyses_reset_at);
    const now = new Date();
    if (now > resetDate) {
      // Reset the counter
      await supabase
        .from('profiles')
        .update({
          analyses_count: 0,
          analyses_reset_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
        })
        .eq('id', userId);
      profile.analyses_count = 0;
    }

    // Check limits for free tier
    const FREE_TIER_LIMIT = 10;
    if (profile.subscription_tier === 'free' && profile.analyses_count >= FREE_TIER_LIMIT) {
      return NextResponse.json(
        {
          error: 'Free tier limit reached',
          message: `You've used all ${FREE_TIER_LIMIT} free analyses this month. Upgrade to Pro for unlimited analyses.`,
          limit_reached: true,
        },
        { status: 402 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // If no API key, return mock data for development
    if (!apiKey) {
      return NextResponse.json(getMockAnalysis());
    }

    // Build the image content — prefer base64 (no download needed by OpenAI)
    const imageContent = imageBase64
      ? { type: 'image_url' as const, image_url: { url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}` } }
      : { type: 'image_url' as const, image_url: { url: imageUrl } };

    // Call OpenAI GPT-4 Vision
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a nutrition analysis assistant. Analyze the food in the image and return ONLY valid JSON with this exact structure:
{
  "name": "string — food item name",
  "brand": "string or null",
  "serving_size": "string — e.g. '1 cup (240g)'",
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "fiber_g": number,
  "sugar_g": number,
  "sodium_mg": number,
  "ingredients": "string or null — comma-separated if visible",
  "allergens": "string or null — comma-separated",
  "health_notes": "string or null — brief health observations",
  "confidence": number between 0 and 1
}
Be accurate. If unsure, estimate conservatively and lower confidence.`,
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this food item for nutritional information.' },
              imageContent,
            ],
          },
        ],
        max_tokens: 800,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI error:', err);
      return NextResponse.json({ error: 'AI analysis failed' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/```json\s*([\s\S]*?)```/) || content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;

    const result = JSON.parse(jsonStr.trim());

    // Increment usage counter
    await supabase
      .from('profiles')
      .update({
        analyses_count: profile.analyses_count + 1,
      })
      .eq('id', userId);

    // Log the analysis for tracking
    await supabase.from('analyses_log').insert({
      user_id: userId,
      tokens_used: data.usage?.total_tokens || 0,
      cost_cents: Math.ceil((data.usage?.total_tokens || 0) * 0.001), // rough estimate
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
  }
}

function getMockAnalysis() {
  return {
    name: 'Grilled Chicken Breast',
    brand: null,
    serving_size: '1 breast (174g)',
    calories: 284,
    protein_g: 53.4,
    carbs_g: 0,
    fat_g: 6.2,
    fiber_g: 0,
    sugar_g: 0,
    sodium_mg: 404,
    ingredients: null,
    allergens: null,
    health_notes: 'High protein, low carb. Good source of lean protein. Watch sodium if on restricted diet.',
    confidence: 0.72,
  };
}
