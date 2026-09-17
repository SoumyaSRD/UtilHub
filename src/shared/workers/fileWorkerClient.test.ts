import { describe, it, expect } from 'vitest';
import { fileWorkerClient } from './fileWorkerClient';

describe('fileWorkerClient', () => {
  it('should clean text with sortAsc, sortDesc, and dedupe', async () => {
    const text = 'banana\napple\ncherry\napple';

    const sortedAsc = await fileWorkerClient.cleanText(text, 'sortAsc');
    expect(sortedAsc).toBe('apple\napple\nbanana\ncherry');

    const deduped = await fileWorkerClient.cleanText(text, 'dedupe');
    expect(deduped).toBe('banana\napple\ncherry');
  });

  it('should filter rows by query', async () => {
    const rows = [
      { id: 1, name: 'Alpha', category: 'Tech' },
      { id: 2, name: 'Beta', category: 'Health' },
      { id: 3, name: 'Gamma', category: 'Tech' },
    ];

    const filtered = await fileWorkerClient.filterRows(rows, ['name', 'category'], 'tech');
    expect(filtered).toHaveLength(2);
    expect(filtered[0].name).toBe('Alpha');
    expect(filtered[1].name).toBe('Gamma');
  });

  it('should export spreadsheet to JSON and CSV formats', async () => {
    const sheets = [
      {
        sheetName: 'Items',
        columns: ['id', 'label'],
        rows: [
          { id: '1', label: 'First' },
          { id: '2', label: 'Second' },
        ],
      },
    ];

    const jsonExport = await fileWorkerClient.exportSpreadsheet(sheets, 'json', 'test.json');
    expect(jsonExport.text).toContain('First');
    expect(jsonExport.fileName).toBe('test.json');

    const csvExport = await fileWorkerClient.exportSpreadsheet(sheets, 'csv', 'test.csv');
    expect(csvExport.text).toContain('id,label');
    expect(csvExport.fileName).toBe('test.csv');
  });
});
