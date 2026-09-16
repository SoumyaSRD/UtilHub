import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import DataObjectIcon from '@mui/icons-material/DataObject';
import DifferenceIcon from '@mui/icons-material/Difference';
import TableChartIcon from '@mui/icons-material/TableChart';
import { AppPageHeader } from '@shared/components/AppPageHeader/AppPageHeader';
import { JsonDiffViewer } from '../components/JsonDiffViewer';
import { TextDiffViewer } from '../components/TextDiffViewer';
import { ExcelComparePage } from '@features/excel-tools/excel-compare/pages/ExcelComparePage';

export const UniversalDiffPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'text' | 'json' | 'excel'>('json');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        toolId="text.universal-diff"
        title="Universal Diff & Comparison Studio"
        description="High-fidelity visual and structural comparison for JSON, source code, text notes, markdown, and Excel spreadsheets."
        iconName="Difference"
      />

      <Box sx={{ borderBottom: 1, borderColor: 'var(--color-surface-border)' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab
            icon={<DataObjectIcon />}
            iconPosition="start"
            label="JSON Deep Diff"
            value="json"
          />
          <Tab
            icon={<DifferenceIcon />}
            iconPosition="start"
            label="Text & Code Diff"
            value="text"
          />
          <Tab
            icon={<TableChartIcon />}
            iconPosition="start"
            label="Spreadsheet Diff"
            value="excel"
          />
        </Tabs>
      </Box>

      {activeTab === 'json' && <JsonDiffViewer />}
      {activeTab === 'text' && <TextDiffViewer />}
      {activeTab === 'excel' && <ExcelComparePage />}
    </Box>
  );
};

export default UniversalDiffPage;
