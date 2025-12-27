import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ClaudeResponse } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { promptText, typedResponse, spokenTranscript } = await req.json();

    if (!spokenTranscript && !typedResponse) {
      return NextResponse.json(
        { error: 'No response provided' },
        { status: 400 }
      );
    }

    const prompt = `You are helping a parent understand their 10-year-old autistic son, Tristan.

Context:
- Tristan can pronounce words well when prompted
- He struggles with spontaneous conversation
- He's more comfortable writing than speaking
- He has sensory sensitivities (prefers calm, quiet)

Prompt shown to Tristan: "${promptText}"
What Tristan typed: "${typedResponse || 'nothing - went straight to speaking'}"
What Tristan said (transcription): "${spokenTranscript}"

Your task:
1. Interpret what Tristan is trying to communicate
2. Assess his engagement level
3. Provide gentle, encouraging feedback for Tristan (1 sentence, simple)
4. Give parent insight into Tristan's thoughts
5. Suggest a good follow-up question for parent to use later

Respond in JSON format:
{
  "interpretation": "Tristan is saying that...",
  "engagement": "engaged" | "neutral" | "disengaged",
  "feedbackForChild": "Great job! You told me about...",
  "insightForParent": "Tristan seems interested in...",
  "suggestedFollowUp": "What kind of videos do you like?",
  "clarity": "clear" | "partial" | "unclear"
}

Rules for feedback:
- Always start with encouragement
- Use simple language (3rd grade reading level)
- Keep it brief (under 20 words)
- Never use negative words like "wrong" or "bad"
- Be specific about what Tristan communicated

IMPORTANT: Return ONLY valid JSON, no other text.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    // Extract text content
    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Parse JSON response
    let interpretation: ClaudeResponse;
    try {
      interpretation = JSON.parse(textContent.text);
    } catch {
      // If JSON parsing fails, create a fallback response
      console.error('Failed to parse Claude response:', textContent.text);
      interpretation = {
        interpretation: spokenTranscript,
        engagement: 'neutral',
        feedbackForChild: 'Great job speaking!',
        insightForParent: 'Tristan provided a response.',
        suggestedFollowUp: 'Tell me more about that.',
        clarity: 'partial',
      };
    }

    return NextResponse.json(interpretation);
  } catch (error) {
    console.error('Interpretation error:', error);

    // Fallback response on error
    const fallback: ClaudeResponse = {
      interpretation: 'Unable to interpret',
      engagement: 'neutral',
      feedbackForChild: 'Great job speaking!',
      insightForParent: 'API error occurred during interpretation.',
      suggestedFollowUp: 'Try asking about something else.',
      clarity: 'partial',
    };

    return NextResponse.json(fallback);
  }
}
