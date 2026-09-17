/**
 * JavaScript & TypeScript Code Formatter & Beautifier
 */

export interface JsTsFormatOptions {
  indentSize?: 2 | 4 | '\t';
  insertSemicolons?: boolean;
  quoteType?: 'single' | 'double' | 'preserve';
  spaceAroundOperators?: boolean;
}

/**
 * Robust Programmatic JavaScript & TypeScript Formatter
 */
export function formatJsTs(source: string, options: JsTsFormatOptions = {}): string {
  const {
    indentSize = 2,
    insertSemicolons = true,
    quoteType = 'preserve',
    spaceAroundOperators = true,
  } = options;

  const indentStr = indentSize === '\t' ? '\t' : ' '.repeat(Number(indentSize));

  // Extract strings, template literals, and comments to protect them from formatting
  const tokens: string[] = [];
  let tokenCounter = 0;
  const tokenPrefix = `__JSTS_TOKEN_${Date.now()}_`;

  let protectedCode = source.replace(
    /(`[\s\S]*?`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\*[\s\S]*?\*\/|\/\/[^\n]*)/g,
    (match) => {
      const id = `${tokenPrefix}${tokenCounter++}__`;
      tokens.push(match);
      return id;
    }
  );

  // Normalize newlines and clean redundant spaces
  protectedCode = protectedCode.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ');

  // Spacing around commas
  protectedCode = protectedCode.replace(/,\s*/g, ', ');

  // Space before opening brace {
  protectedCode = protectedCode.replace(/([^\s{\n])\{/g, '$1 {');

  // Spacing around control keywords
  const controlKeywords = [
    'if',
    'for',
    'while',
    'switch',
    'catch',
    'function',
    'class',
    'interface',
    'type',
    'import',
    'export',
    'return',
    'case',
  ];
  controlKeywords.forEach((kw) => {
    const reg = new RegExp(`\\b${kw}\\s*\\(`, 'g');
    protectedCode = protectedCode.replace(reg, `${kw} (`);
  });

  // Space around arrow functions =>
  protectedCode = protectedCode.replace(/\s*=>\s*/g, ' => ');

  // Spaces around operators if requested
  if (spaceAroundOperators) {
    protectedCode = protectedCode.replace(/\s*(===|!==|==|!=)\s*/g, ' $1 ');
    protectedCode = protectedCode.replace(/([a-zA-Z0-9_$\]])\s*=\s*([a-zA-Z0-9_$['"`({])/g, '$1 = $2');
    protectedCode = protectedCode.replace(/\s*(&&|\|\||\?\?)\s*/g, ' $1 ');
    protectedCode = protectedCode.replace(/([a-zA-Z0-9_$])\s*(\+|\*|\/|%)\s*([a-zA-Z0-9_$])/g, '$1 $2 $3');
    protectedCode = protectedCode.replace(/\s*:\s*/g, ': ');
  }

  // Ensure clean line breaks around semicolons and braces
  protectedCode = protectedCode
    .replace(/;\s*/g, ';\n')
    .replace(/\s*\{\s*/g, ' {\n')
    .replace(/\s*\}\s*/g, '\n}\n')
    .replace(/\n\s*;/g, ';');

  // Optional: Semicolon insertion on non-empty statement lines (BEFORE token restoration)
  if (insertSemicolons) {
    const rawLines = protectedCode.split('\n');
    protectedCode = rawLines
      .map((line) => {
        const trimmed = line.trim();
        if (
          !trimmed ||
          trimmed.endsWith(';') ||
          trimmed.endsWith('{') ||
          trimmed.endsWith('}') ||
          trimmed.endsWith(':') ||
          trimmed.endsWith(',') ||
          trimmed.startsWith('//') ||
          trimmed.startsWith('/*')
        ) {
          return line;
        }
        // Don't append to control structure headers
        if (/^(if|for|while|switch|else|catch|finally|function|class|interface)\b/.test(trimmed)) {
          return line;
        }
        return `${line};`;
      })
      .join('\n');
  }

  // Indentation traversal
  const lines = protectedCode.split('\n');
  let currentIndent = 0;
  const formattedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    // Decrease indent if closing bracket/brace
    const closeCount = (line.match(/^[\}\]\)]/) || []).length;
    if (closeCount > 0) {
      currentIndent = Math.max(0, currentIndent - 1);
    }

    formattedLines.push(indentStr.repeat(currentIndent) + line);

    // Increase indent for next lines
    const openBraces = (line.match(/[\{\[\(]/g) || []).length;
    const closeBraces = (line.match(/[\}\]\)]/g) || []).length;
    currentIndent = Math.max(0, currentIndent + openBraces - closeBraces);
  }

  let formatted = formattedLines.join('\n');

  // Restore protected tokens (strings, templates, comments)
  tokens.forEach((tok, idx) => {
    const id = `${tokenPrefix}${idx}__`;
    let restoredTok = tok;

    if (quoteType !== 'preserve' && !tok.startsWith('//') && !tok.startsWith('/*') && !tok.startsWith('`')) {
      if (quoteType === 'single' && tok.startsWith('"')) {
        const inner = tok.slice(1, -1).replace(/'/g, "\\'").replace(/\\"/g, '"');
        restoredTok = `'${inner}'`;
      } else if (quoteType === 'double' && tok.startsWith("'")) {
        const inner = tok.slice(1, -1).replace(/"/g, '\\"').replace(/\\'/g, "'");
        restoredTok = `"${inner}"`;
      }
    }

    formatted = formatted.replace(id, () => restoredTok);
  });

  return formatted.trim();
}

/**
 * Minify JavaScript / TypeScript code
 */
export function minifyJsTs(code: string): string {
  let minified = code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};:,=+\-*/()><!&|?])\s*/g, '$1')
    .trim();
  return minified;
}
