import { NextRequest, NextResponse } from 'next/server';
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function GET() {
  try {
    console.log('Testing Gemini 2.0 Flash API...');
    
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'GOOGLE_GENERATIVE_AI_API_KEY is not configured'
      }, { status: 500 });
    }

    const model = google("gemini-2.0-flash-001");

    const result = await generateText({
      model: model,
      prompt: 'Say "Hello, I am working with Gemini 2.0 Flash!" and include the current date.',
    });
    
    console.log('Gemini test response:', result.text);

    return NextResponse.json({
      success: true,
      response: result.text
    }, { status: 200 });

  } catch (error) {
    console.error('Gemini API test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
