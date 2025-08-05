import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    
    // Try to connect to the backend
    const response = await fetch(`${apiUrl}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add a timeout to prevent hanging
      signal: AbortSignal.timeout(5000)
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        status: 'OK',
        frontend: 'Next.js App is running',
        backend: 'Connected',
        backendUrl: apiUrl,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      })
    } else {
      return NextResponse.json({
        status: 'WARNING',
        frontend: 'Next.js App is running',
        backend: 'Unreachable',
        backendUrl: apiUrl,
        error: `Backend responded with status: ${response.status}`,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }, { status: 200 })
    }
  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      frontend: 'Next.js App is running',
      backend: 'Connection failed',
      backendUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }, { status: 200 })
  }
} 