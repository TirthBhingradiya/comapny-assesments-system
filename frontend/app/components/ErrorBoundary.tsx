'use client'

import { Component, ReactNode } from 'react'
import ErrorMessage from './ErrorMessage'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <ErrorMessage 
            message="Something went wrong. Please try refreshing the page." 
            onRetry={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }} 
          />
        </div>
      )
    }

    return this.props.children
  }
} 