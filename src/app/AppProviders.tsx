import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store, useAppSelector } from './store';
import { createAppTheme } from '@theme/mui/createAppTheme';
import { GlobalErrorBoundary } from '@shared/components/ErrorBoundary/GlobalErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

interface ThemeWrapperProps {
  children: React.ReactNode;
}

const DynamicThemeBridge: React.FC<ThemeWrapperProps> = ({ children }) => {
  const currentThemeMode = useAppSelector((state) => state.preferences.themeMode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentThemeMode);
  }, [currentThemeMode]);

  const muiTheme = React.useMemo(() => createAppTheme(currentThemeMode), [currentThemeMode]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <GlobalErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <DynamicThemeBridge>{children}</DynamicThemeBridge>
        </QueryClientProvider>
      </Provider>
    </GlobalErrorBoundary>
  );
};
