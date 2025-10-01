import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        response: 'I apologize, but I\'m having trouble connecting right now. Please try again later.',
        message: 'Chat service temporarily unavailable'
      },
      { status: 500 }
    );
  }
}
