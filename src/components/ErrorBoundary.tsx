import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Check if it's a chunk load error (common with lazy loading and cache)
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      console.log('ChunkLoadError detected. Suggesting reload...');
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[var(--bg-primary)] text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Ops! Algo deu errado.</h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md">
            Ocorreu um erro inesperado. Isso pode ser causado por arquivos em cache antigos.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[var(--accent-primary)] text-[var(--accent-contrast)] rounded-lg font-bold hover:opacity-90 transition-all"
          >
            Recarregar Aplicativo
          </button>
          {this.state.error && (
            <pre className="mt-8 p-4 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-xs text-left overflow-auto max-w-full text-[var(--text-muted)]">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
