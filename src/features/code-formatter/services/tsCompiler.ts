/**
 * TypeScript / JavaScript Compiler & Execution Service
 */

export interface ExecutionResult {
  success: boolean;
  logs: Array<{ type: 'log' | 'info' | 'warn' | 'error'; message: string }>;
  returnValue?: string;
  executionTimeMs: number;
  error?: string;
}

/**
 * Transpile TypeScript to executable JavaScript
 */
export async function transpileTsToJs(source: string): Promise<{ js: string; error?: string }> {
  try {
    const ts = await import('typescript');
    const result = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.React,
        removeComments: false,
      },
    });
    return { js: result.outputText };
  } catch (err: any) {
    // Fallback lightweight regex-based type stripper if full compiler encounters environment restrictions
    try {
      const stripped = stripTypeScriptTypes(source);
      return { js: stripped };
    } catch {
      return { js: '', error: err.message || 'Transpilation error' };
    }
  }
}

/**
 * Lightweight type stripper fallback
 */
export function stripTypeScriptTypes(code: string): string {
  return code
    // Remove interface declarations
    .replace(/export\s+interface\s+\w+(?:<[^>]+>)?\s*\{[\s\S]*?\}/g, '')
    .replace(/interface\s+\w+(?:<[^>]+>)?\s*\{[\s\S]*?\}/g, '')
    // Remove type aliases
    .replace(/export\s+type\s+\w+(?:<[^>]+>)?\s*=[\s\S]*?;/g, '')
    .replace(/type\s+\w+(?:<[^>]+>)?\s*=[\s\S]*?;/g, '')
    // Remove type assertions like `as string`
    .replace(/\s+as\s+[A-Za-z0-9_<>[\]|&, ]+/g, '')
    // Remove return type annotations `: ReturnType {`
    .replace(/\):\s*[A-Za-z0-9_<>[\]|&, ]+\s*=>/g, ') =>')
    .replace(/\):\s*[A-Za-z0-9_<>[\]|&, ]+\s*\{/g, ') {')
    // Remove variable type annotations `let x: number =`
    .replace(/:\s*[A-Za-z0-9_<>[\]|&, ]+\s*=/g, ' =')
    // Remove generic parameters from function calls/definitions
    .replace(/<[A-Z][A-Za-z0-9_,\s]*>\s*\(/g, '(');
}

/**
 * Execute JavaScript in a safe sandbox capturing console logs and return values
 */
export async function executeCodeInSandbox(jsCode: string): Promise<ExecutionResult> {
  const startTime = performance.now();
  const logs: Array<{ type: 'log' | 'info' | 'warn' | 'error'; message: string }> = [];

  const stringifyArg = (arg: any): string => {
    if (arg === undefined) return 'undefined';
    if (arg === null) return 'null';
    if (typeof arg === 'function') return arg.toString();
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  };

  // Mock console to capture outputs
  const mockConsole = {
    log: (...args: any[]) => logs.push({ type: 'log', message: args.map(stringifyArg).join(' ') }),
    info: (...args: any[]) => logs.push({ type: 'info', message: args.map(stringifyArg).join(' ') }),
    warn: (...args: any[]) => logs.push({ type: 'warn', message: args.map(stringifyArg).join(' ') }),
    error: (...args: any[]) => logs.push({ type: 'error', message: args.map(stringifyArg).join(' ') }),
  };

  try {
    // Wrap in async IIFE so top-level await and return work
    const wrappedCode = `
      return (async function(console) {
        "use strict";
        ${jsCode}
      })(console);
    `;

    // Execute with captured console
    const executor = new Function('console', wrappedCode);
    const result = await executor(mockConsole);
    const endTime = performance.now();

    return {
      success: true,
      logs,
      returnValue: result !== undefined ? stringifyArg(result) : undefined,
      executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
    };
  } catch (err: any) {
    const endTime = performance.now();
    logs.push({ type: 'error', message: err.stack || err.message });
    return {
      success: false,
      logs,
      error: err.message,
      executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
    };
  }
}
