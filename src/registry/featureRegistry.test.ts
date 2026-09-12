import { describe, it, expect, beforeEach } from 'vitest';
import { featureRegistry } from './featureRegistry';
import { registerAllFeatures } from './registerAllFeatures';

describe('FeatureRegistry', () => {
  beforeEach(() => {
    registerAllFeatures();
  });

  it('should register and retrieve all enterprise tools', () => {
    const all = featureRegistry.getAll();
    expect(all.length).toBeGreaterThanOrEqual(15);
  });

  it('should find features by unique ID', () => {
    const extractor = featureRegistry.getById('excel.column-extractor');
    expect(extractor).toBeDefined();
    expect(extractor?.name).toBe('Column Extractor');
    expect(extractor?.category).toBe('excel');
  });

  it('should find features by route', () => {
    const feat = featureRegistry.getByRoute('/sql/in-clause');
    expect(feat).toBeDefined();
    expect(feat?.id).toBe('sql.in-clause');
  });

  it('should search features by keyword and tags', () => {
    const results = featureRegistry.search('jwt');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.id === 'api.jwt-decoder')).toBe(true);
  });

  it('should filter features based on RBAC permissions', () => {
    const devPerms = ['feature:sql.in-clause', 'category:text'];
    const flags = { 'sql.in-clause': true, 'text.json-formatter': true };

    const available = featureRegistry.getAvailable(devPerms, flags);
    const hasInClause = available.some((f) => f.id === 'sql.in-clause');
    const hasJsonFormatter = available.some((f) => f.id === 'text.json-formatter');
    const hasAdmin = available.some((f) => f.id === 'admin.hub');

    expect(hasInClause).toBe(true);
    expect(hasJsonFormatter).toBe(true);
    expect(hasAdmin).toBe(false);
  });

  it('should respect disabled feature flags', () => {
    const superAdminPerms = ['*'];
    const flagsWithDisabled = {
      'excel.column-extractor': false, // explicitly disabled
    };

    const available = featureRegistry.getAvailable(superAdminPerms, flagsWithDisabled);
    expect(available.some((f) => f.id === 'excel.column-extractor')).toBe(false);
  });
});
