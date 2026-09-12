import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@layouts/AppShell/AppShell';
import { ProtectedFeatureRoute } from './RouteGuards';
import { featureRegistry } from '@registry/featureRegistry';
import { AppErrorState } from '@shared/components/AppErrorState/AppErrorState';

export const AppRouter: React.FC = () => {
  const registeredFeatures = featureRegistry.getAll();

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<AppShell />}>
          {/* Default redirect to Dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Configuration-driven Dynamic Feature Routes */}
          {registeredFeatures.map((feat) => {
            // Strip leading slash for nested route path
            const cleanPath = feat.route.startsWith('/') ? feat.route.substring(1) : feat.route;
            return (
              <Route
                key={feat.id}
                path={cleanPath}
                element={<ProtectedFeatureRoute feature={feat} />}
              />
            );
          })}

          {/* 404 Route */}
          <Route
            path="*"
            element={
              <AppErrorState
                variant="notfound"
                title="Page Not Found"
                message="The requested route does not match any registered utility in the platform."
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
