import { describe, it, expect } from 'vitest';
import { antigravityUtil } from './antigravityUtil.js';
import { registeredUtilities, generateSystemPromptFromRegistry } from './registry.js';

describe('antigravityUtil', () => {
  it('should have complete meta schema with id, triggers, and parameter constraints', () => {
    expect(antigravityUtil.meta.id).toBe('antigravity');
    expect(antigravityUtil.meta.triggers).toContain('float');
    expect(antigravityUtil.meta.triggers).toContain('zero-g');
    expect(antigravityUtil.meta.parameters.intensity.default).toBe(50);
    expect(antigravityUtil.meta.parameters.duration.default).toBe(5);
    expect(antigravityUtil.meta.parameters.selector.default).toBe('.chatbot-container');
  });

  it('should safely handle execution when running in non-browser environment', () => {
    const result = antigravityUtil.execute({
      intensity: 75,
      duration: 3,
      selector: '.chatbot-container',
    });
    expect(typeof result).toBe('string');
  });

  it('should execute simulation when mock DOM is provided', () => {
    const mockElement = {
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => true,
      },
      style: {
        setProperty: () => {},
        removeProperty: () => {},
      },
    };

    const originalDoc = globalThis.document;
    globalThis.document = {
      getElementById: () => null,
      createElement: () => ({ id: '', textContent: '' }),
      head: { appendChild: () => {} },
      querySelectorAll: (sel) => (sel === '.chatbot-container' ? [mockElement] : []),
    };

    try {
      const result = antigravityUtil.execute({
        intensity: 80,
        duration: 4,
        selector: '.chatbot-container',
      });
      expect(result).toContain('Zero-G Physics Activated');
      expect(result).toContain('80% intensity');
    } finally {
      globalThis.document = originalDoc;
    }
  });
});

describe('Discovery Engine & Registry', () => {
  it('should include antigravityUtil and other registered utilities', () => {
    const ids = registeredUtilities.map((u) => u.meta.id);
    expect(ids).toContain('antigravity');
    expect(ids).toContain('string_encoder');
    expect(ids).toContain('localstorage_cleaner');
  });

  it('should generate a meta-programmed system prompt containing parameter schemas', () => {
    const prompt = generateSystemPromptFromRegistry();
    expect(prompt).toContain('Autonomous Command Router');
    expect(prompt).toContain('"antigravity"');
    expect(prompt).toContain('"intensity"');
    expect(prompt).toContain('"duration"');
    expect(prompt).toContain('"string_encoder"');
    expect(prompt).toContain('CRITICAL INSTRUCTIONS & SCHEMA ENFORCEMENT');
  });
});
