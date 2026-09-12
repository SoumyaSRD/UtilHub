import React, { useEffect } from 'react';
import { AppProviders } from './AppProviders';
import { AppRouter } from './router/AppRouter';
import { registerAllFeatures } from '@registry/registerAllFeatures';
import '@theme/styles/index.scss';

// Initialize platform feature registry
registerAllFeatures();

export const App: React.FC = () => {
  useEffect(() => {
    // Global unhandled promise rejection trap
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason);
    };
    window.addEventListener('unhandledrejection', handleRejection);
    return () => window.removeEventListener('unhandledrejection', handleRejection);
  }, []);

  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
};

export default App;
