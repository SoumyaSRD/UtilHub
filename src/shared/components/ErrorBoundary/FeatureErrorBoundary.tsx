import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AppErrorState } from '../AppErrorState/AppErrorState';
import { logger } from '@shared/telemetry/logger';

interface Props {
  children: ReactNode;
  featureName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class FeatureErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error(`FeatureBoundary:${this.props.featureName || 'Unknown'}`, error.message, {
      errorInfo,
      stack: error.stack,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <AppErrorState
          title={`Error in ${this.props.featureName || 'Tool'}`}
          message="An unhandled exception occurred within this specific utility module. The rest of the platform remains unaffected."
          error={this.state.error}
          onRetry={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
