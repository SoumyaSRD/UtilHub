import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AppErrorState } from '../AppErrorState/AppErrorState';
import { logger } from '@shared/telemetry/logger';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('GlobalErrorBoundary', error.message, { errorInfo, stack: error.stack });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <AppErrorState
          title={this.props.fallbackTitle || 'Platform Application Crash'}
          message="An unhandled exception occurred in the UtilityHub shell. You can reload the page or review technical diagnostics below."
          error={this.state.error}
          onRetry={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
