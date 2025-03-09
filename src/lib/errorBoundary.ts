import { Component, ErrorInfo } from 'react';
import { supabase } from './supabase';

interface ErrorState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<{ children: React.ReactNode }, ErrorState> {
  public state: ErrorState = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): ErrorState {
    return { hasError: true, error };
  }

  public async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);

    try {
      // Log error to Supabase
      await supabase
        .from('error_logs')
        .insert({
          error_message: error.message,
          error_stack: error.stack,
          component_stack: errorInfo.componentStack,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  private resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-purple flex items-center justify-center p-4">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg shadow-lg purple-glow p-8 max-w-md w-full metallic-border">
            <h1 className="text-2xl font-bold metallic-text text-center mb-4">
              Something went wrong
            </h1>
            <p className="text-light-purple/80 text-center mb-6">
              We've logged the error and will fix it as soon as possible.
            </p>
            <button
              onClick={this.resetError}
              className="w-full bg-light-purple/20 text-light-purple py-3 px-4 rounded-lg hover:bg-light-purple/30 transition-colors border border-light-purple/20"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}