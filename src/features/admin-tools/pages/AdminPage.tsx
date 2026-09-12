import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import FlagIcon from '@mui/icons-material/Flag';
import SecurityIcon from '@mui/icons-material/Security';
import HistoryIcon from '@mui/icons-material/History';
import MemoryIcon from '@mui/icons-material/Memory';
import { AppPageHeader } from '@shared/components/AppPageHeader/AppPageHeader';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { useAppDispatch, useAppSelector } from '@app/store';
import { toggleFlag } from '@app/store/slices/featureFlagSlice';
import { ROLE_PERMISSIONS, type UserRole } from '@app/store/slices/authSlice';
import { auditService } from '@shared/telemetry/audit';
import { showToast } from '@app/store/slices/uiSlice';
import { featureRegistry } from '@registry/featureRegistry';
import { usePermissions } from '@registry/hooks/usePermissions';

export const AdminPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = usePermissions();
  const [tabIndex, setTabIndex] = useState(0);

  const flags = useAppSelector((state) => state.featureFlags.flags);
  const registeredFeatures = featureRegistry.getAll();
  const auditRecords = auditService.getRecords();

  const handleToggleFlag = (id: string, currentEnabled: boolean) => {
    dispatch(toggleFlag(id));
    auditService.record(
      'FEATURE_FLAG_TOGGLED',
      user.name,
      id,
      { previous: currentEnabled, now: !currentEnabled }
    );
    dispatch(
      showToast({
        message: `Feature "${id}" flag set to ${!currentEnabled ? 'ENABLED' : 'DISABLED'}`,
        severity: 'info',
      })
    );
  };

  const roles = Object.keys(ROLE_PERMISSIONS) as UserRole[];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        toolId="admin.hub"
        title="Enterprise Administration & Governance"
        description="Manage runtime feature flags, inspect role permissions matrices, and audit system activity logs."
        iconName="AdminPanelSettings"
      />

      <Box sx={{ borderBottom: 1, borderColor: 'var(--color-divider)' }}>
        <Tabs value={tabIndex} onChange={(_, idx) => setTabIndex(idx)}>
          <Tab icon={<FlagIcon fontSize="small" />} iconPosition="start" label="Feature Flags" />
          <Tab icon={<SecurityIcon fontSize="small" />} iconPosition="start" label="RBAC Roles & Matrix" />
          <Tab icon={<HistoryIcon fontSize="small" />} iconPosition="start" label="Audit Trail" />
          <Tab icon={<MemoryIcon fontSize="small" />} iconPosition="start" label="System Diagnostics" />
        </Tabs>
      </Box>

      {/* Tab 0: Feature Flags */}
      {tabIndex === 0 && (
        <AppCard
          title="Runtime Feature Flags"
          subtitle="Toggle utility availability live across the platform without redeploying code"
        >
          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid var(--color-border-subtle)' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Tool / Feature</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Required Permission</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Runtime Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {registeredFeatures.map((feat) => {
                  const isEnabled = flags[feat.id] !== false;
                  return (
                    <TableRow key={feat.id}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {feat.name}
                        <Typography variant="caption" sx={{ display: 'block', color: 'var(--color-text-secondary)' }}>
                          {feat.id}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{feat.category}</TableCell>
                      <TableCell>
                        {feat.permissions.length > 0 ? (
                          feat.permissions.map((p) => (
                            <Chip key={p} label={p} size="small" sx={{ fontSize: '0.65rem', mr: 0.5 }} />
                          ))
                        ) : (
                          <Chip label="Public" size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                        )}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          label={isEnabled ? 'Active' : 'Disabled'}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: isEnabled ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                            color: isEnabled ? 'var(--color-success)' : 'var(--color-error)',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Switch
                          checked={isEnabled}
                          onChange={() => handleToggleFlag(feat.id, isEnabled)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </AppCard>
      )}

      {/* Tab 1: RBAC Roles */}
      {tabIndex === 1 && (
        <AppCard
          title="Role-Based Access Control (RBAC)"
          subtitle="Granular permissions granted to each organizational persona"
        >
          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid var(--color-border-subtle)' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Role Persona</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Granted Capabilities & Permissions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role}>
                    <TableCell sx={{ fontWeight: 700, width: 160 }}>
                      <Chip label={role} size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {ROLE_PERMISSIONS[role].map((perm) => (
                          <Chip
                            key={perm}
                            label={perm}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', fontFamily: 'var(--font-family-mono)' }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AppCard>
      )}

      {/* Tab 2: Audit Logs */}
      {tabIndex === 2 && (
        <AppCard
          title="Platform Audit Events"
          subtitle="Chronological audit records of tool runs, role changes, and configuration actions"
        >
          <TableContainer component={Paper} sx={{ maxHeight: 400, boxShadow: 'none', border: '1px solid var(--color-border-subtle)' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: 'var(--color-surface-hover)', fontWeight: 700 }}>Timestamp</TableCell>
                  <TableCell sx={{ backgroundColor: 'var(--color-surface-hover)', fontWeight: 700 }}>Action</TableCell>
                  <TableCell sx={{ backgroundColor: 'var(--color-surface-hover)', fontWeight: 700 }}>Actor</TableCell>
                  <TableCell sx={{ backgroundColor: 'var(--color-surface-hover)', fontWeight: 700 }}>Target</TableCell>
                  <TableCell sx={{ backgroundColor: 'var(--color-surface-hover)', fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditRecords.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell sx={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                      {new Date(rec.timestamp).toLocaleTimeString()}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{rec.action}</TableCell>
                    <TableCell>{rec.actor}</TableCell>
                    <TableCell sx={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.8rem' }}>{rec.targetId}</TableCell>
                    <TableCell>
                      <Chip
                        label={rec.status}
                        size="small"
                        sx={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor: rec.status === 'SUCCESS' ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                          color: rec.status === 'SUCCESS' ? 'var(--color-success)' : 'var(--color-error)',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AppCard>
      )}

      {/* Tab 3: Diagnostics */}
      {tabIndex === 3 && (
        <AppCard title="System Environment & Engine Diagnostics">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ p: 2, borderRadius: '8px', border: '1px solid var(--color-border-subtle)', bgcolor: 'var(--color-surface-hover)' }}>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  Active Runtime Framework
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  React 19 + TypeScript (Strict) + Vite
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ p: 2, borderRadius: '8px', border: '1px solid var(--color-border-subtle)', bgcolor: 'var(--color-surface-hover)' }}>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  File Processing Engine
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  In-Memory Isolated Web Worker (Zero Exfiltration)
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </AppCard>
      )}
    </Box>
  );
};

export default AdminPage;
