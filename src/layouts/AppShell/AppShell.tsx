import React from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { Header } from '../Header/Header';
import { Sidebar } from '../Sidebar/Sidebar';
import { Breadcrumbs } from '../Breadcrumbs/Breadcrumbs';
import { CommandPalette } from '../CommandPalette/CommandPalette';
import { AuditDrawer } from '../AuditDrawer/AuditDrawer';
import { FeatureErrorBoundary } from '@shared/components/ErrorBoundary/FeatureErrorBoundary';
import { useAppDispatch, useAppSelector } from '@app/store';
import { hideToast } from '@app/store/slices/uiSlice';

export const AppShell: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeToast = useAppSelector((state) => state.ui.activeToast);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}
    >
      {/* Top Application Header */}
      <Header />

      {/* Body Area: Sidebar + Scrollable Main Content */}
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar />

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            p: { xs: 2, sm: 3, md: 4 },
            maxWidth: '1600px',
            mx: 'auto',
            width: '100%',
          }}
        >
          <Breadcrumbs />
          <FeatureErrorBoundary>
            <Outlet />
          </FeatureErrorBoundary>
        </Box>
      </Box>

      {/* Global Command Palette */}
      <CommandPalette />

      {/* Audit Log Drawer */}
      <AuditDrawer />

      {/* Toast Notification Center */}
      {activeToast && (
        <Snackbar
          open={Boolean(activeToast)}
          autoHideDuration={activeToast.duration}
          onClose={() => dispatch(hideToast())}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => dispatch(hideToast())}
            severity={activeToast.severity}
            variant="filled"
            sx={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          >
            {activeToast.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};
