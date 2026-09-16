import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface DatasetSheet {
  sheetName: string;
  columns: string[];
  rows: Record<string, unknown>[];
  totalRowCount: number;
  nullColumns: string[];
}

export interface ActiveDataset {
  id: string;
  fileName: string;
  fileType: 'xlsx' | 'xls' | 'csv' | 'json';
  uploadedAt: string;
  sheetNames: string[];
  activeSheet: string;
  sheets: Record<string, DatasetSheet>;
  sourceTool: string;
}

export interface DatasetHistoryItem {
  id: string;
  fileName: string;
  rowCount: number;
  columnCount: number;
  sheetCount: number;
  uploadedAt: string;
  sourceTool: string;
}

export interface SharedDataState {
  activeDataset: ActiveDataset | null;
  history: DatasetHistoryItem[];
  dismissedTools: Record<string, string>; // toolId -> datasetId dismissed
}

const initialState: SharedDataState = {
  activeDataset: null,
  history: [],
  dismissedTools: {},
};

export const sharedDataSlice = createSlice({
  name: 'sharedData',
  initialState,
  reducers: {
    setActiveDataset: (state, action: PayloadAction<ActiveDataset>) => {
      state.activeDataset = action.payload;
      // Reset dismissed state for the new dataset
      state.dismissedTools = {};

      // Add to history if not present
      const totalRows = Object.values(action.payload.sheets).reduce((sum, s) => sum + s.totalRowCount, 0);
      const activeColumns = action.payload.sheets[action.payload.activeSheet]?.columns.length || 0;
      const historyItem: DatasetHistoryItem = {
        id: action.payload.id,
        fileName: action.payload.fileName,
        rowCount: totalRows,
        columnCount: activeColumns,
        sheetCount: action.payload.sheetNames.length,
        uploadedAt: action.payload.uploadedAt,
        sourceTool: action.payload.sourceTool,
      };

      const existingIndex = state.history.findIndex((h) => h.id === action.payload.id);
      if (existingIndex >= 0) {
        state.history.splice(existingIndex, 1);
      }
      state.history.unshift(historyItem);
      if (state.history.length > 8) {
        state.history.pop();
      }
    },

    clearActiveDataset: (state) => {
      state.activeDataset = null;
      state.dismissedTools = {};
    },

    switchActiveSheet: (state, action: PayloadAction<string>) => {
      if (state.activeDataset && state.activeDataset.sheets[action.payload]) {
        state.activeDataset.activeSheet = action.payload;
      }
    },

    dismissDatasetForTool: (state, action: PayloadAction<{ toolId: string; datasetId: string }>) => {
      state.dismissedTools[action.payload.toolId] = action.payload.datasetId;
    },

    resetDismissedTool: (state, action: PayloadAction<string>) => {
      delete state.dismissedTools[action.payload];
    },
  },
});

export const {
  setActiveDataset,
  clearActiveDataset,
  switchActiveSheet,
  dismissDatasetForTool,
  resetDismissedTool,
} = sharedDataSlice.actions;

export default sharedDataSlice.reducer;
