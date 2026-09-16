import { describe, it, expect } from 'vitest';
import sharedDataReducer, {
  setActiveDataset,
  clearActiveDataset,
  switchActiveSheet,
  dismissDatasetForTool,
  resetDismissedTool,
  type ActiveDataset,
} from './sharedDataSlice';

describe('sharedDataSlice', () => {
  const sampleDataset: ActiveDataset = {
    id: 'ds-1',
    fileName: 'test_rates.xlsx',
    fileType: 'xlsx',
    uploadedAt: '2026-09-16T12:00:00Z',
    sheetNames: ['Rates', 'Summary'],
    activeSheet: 'Rates',
    sheets: {
      Rates: {
        sheetName: 'Rates',
        columns: ['SKU', 'Rate'],
        rows: [{ SKU: 'A1', Rate: 100 }],
        totalRowCount: 1,
        nullColumns: [],
      },
      Summary: {
        sheetName: 'Summary',
        columns: ['Total'],
        rows: [{ Total: 100 }],
        totalRowCount: 1,
        nullColumns: [],
      },
    },
    sourceTool: 'Tabular Viewer',
  };

  it('should initialize with null activeDataset', () => {
    const state = sharedDataReducer(undefined, { type: 'unknown' });
    expect(state.activeDataset).toBeNull();
    expect(state.history).toEqual([]);
    expect(state.dismissedTools).toEqual({});
  });

  it('should set active dataset and update history', () => {
    const state = sharedDataReducer(undefined, setActiveDataset(sampleDataset));
    expect(state.activeDataset?.fileName).toBe('test_rates.xlsx');
    expect(state.history.length).toBe(1);
    expect(state.history[0].fileName).toBe('test_rates.xlsx');
    expect(state.history[0].rowCount).toBe(2);
  });

  it('should switch active sheet', () => {
    let state = sharedDataReducer(undefined, setActiveDataset(sampleDataset));
    state = sharedDataReducer(state, switchActiveSheet('Summary'));
    expect(state.activeDataset?.activeSheet).toBe('Summary');
  });

  it('should track dismissed tools and allow reset', () => {
    let state = sharedDataReducer(undefined, setActiveDataset(sampleDataset));
    state = sharedDataReducer(
      state,
      dismissDatasetForTool({ toolId: 'excel.column-extractor', datasetId: 'ds-1' })
    );
    expect(state.dismissedTools['excel.column-extractor']).toBe('ds-1');

    state = sharedDataReducer(state, resetDismissedTool('excel.column-extractor'));
    expect(state.dismissedTools['excel.column-extractor']).toBeUndefined();
  });

  it('should clear active dataset', () => {
    let state = sharedDataReducer(undefined, setActiveDataset(sampleDataset));
    state = sharedDataReducer(state, clearActiveDataset());
    expect(state.activeDataset).toBeNull();
  });
});
