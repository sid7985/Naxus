import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('NEXUS Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex items-center justify-center nebula-bg">
          <div className="glass-elevated p-10 text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-status-error/10 border border-status-error/20 flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm text-text-secondary mb-4">
              NEXUS encountered an unexpected error. This has been logged.
            </p>
            {this.state.error && (
              <div className="text-left bg-void/50 rounded-xl p-4 mb-5 max-h-32 overflow-auto">
                <code className="text-xs font-mono text-status-error/80 leading-relaxed break-all">
                  {this.state.error.message}
                </code>
              </div>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-agent-manager to-agent-coder text-white text-sm font-medium hover:brightness-110 transition-all"
            >
              Restart NEXUS
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
