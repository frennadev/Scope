// API Route: /api/chat
// Handles LLM requests server-side for better security

import { NextRequest, NextResponse } from 'next/server'
import { llmService } from '@/lib/llm-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, sessionId = 'default', context } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      )
    }

    // Generate response using LLM service
    const response = await llmService.generateResponse(query, sessionId, context)

    return NextResponse.json({
      success: true,
      data: response
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 