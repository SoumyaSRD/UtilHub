/**
 * Multi-Language Code & Data Formatters
 */

// --- JSON Helpers ---
export function formatJson(
  input: string,
  spaces: number | '\t' = 2,
  sortKeys = false
): string {
  const parsed = JSON.parse(input);

  const sortObject = (obj: unknown, desc = false): unknown => {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map((i) => sortObject(i, desc));
    const keys = Object.keys(obj as Record<string, unknown>);
    keys.sort((a, b) => (desc ? b.localeCompare(a) : a.localeCompare(b)));
    return keys.reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = sortObject((obj as Record<string, unknown>)[key], desc);
      return acc;
    }, {});
  };

  const finalObj = sortKeys ? sortObject(parsed) : parsed;
  return JSON.stringify(finalObj, null, spaces);
}

export function minifyJson(input: string): string {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed);
}

/**
 * Attempts to repair lenient/relaxed JSON:
 * - single quotes to double quotes
 * - trailing commas
 * - unquoted object keys
 */
export function repairJson(input: string): string {
  let cleaned = input.trim();
  // Replace single quotes with double quotes around keys and values
  cleaned = cleaned.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');
  // Remove trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,(\s*[\]}])/g, '$1');
  // Quote unquoted object keys: { foo: 1 } -> { "foo": 1 }
  cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z0-9_$-]+)\s*:/g, '$1"$2":');
  // Verify valid JSON
  const parsed = JSON.parse(cleaned);
  return JSON.stringify(parsed, null, 2);
}

export function escapeJsonString(input: string): string {
  return JSON.stringify(input);
}

export function unescapeJsonString(input: string): string {
  let trimmed = input.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return JSON.parse(trimmed);
  }
  return JSON.parse(`"${trimmed}"`);
}

/**
 * Generates TypeScript interface declarations from JSON object
 */
export function jsonToTypeScript(jsonStr: string, rootName = 'RootObject'): string {
  const parsed = JSON.parse(jsonStr);
  const interfaces: Record<string, string> = {};

  const getType = (val: unknown, keyName: string): string => {
    if (val === null) return 'null | unknown';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'unknown[]';
      const itemType = getType(val[0], `${keyName}Item`);
      return `${itemType}[]`;
    }
    if (typeof val === 'object') {
      const typeName = capitalize(keyName);
      buildInterface(val as Record<string, unknown>, typeName);
      return typeName;
    }
    return typeof val;
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const buildInterface = (obj: Record<string, unknown>, name: string) => {
    let result = `export interface ${name} {\n`;
    for (const [key, value] of Object.entries(obj)) {
      const isIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
      const safeKey = isIdentifier ? key : JSON.stringify(key);
      result += `  ${safeKey}: ${getType(value, key)};\n`;
    }
    result += `}\n`;
    interfaces[name] = result;
  };

  if (Array.isArray(parsed)) {
    if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
      buildInterface(parsed[0] as Record<string, unknown>, rootName);
      return Object.values(interfaces).join('\n') + `\nexport type ${rootName}List = ${rootName}[];\n`;
    }
    return `export type ${rootName} = unknown[];\n`;
  } else if (typeof parsed === 'object' && parsed !== null) {
    buildInterface(parsed as Record<string, unknown>, rootName);
    return Object.values(interfaces).join('\n');
  }

  return `export type ${rootName} = ${typeof parsed};\n`;
}

// --- HTML / XML Formatter ---
export function formatXmlHtml(xml: string, indent = '  '): string {
  let formatted = '';
  let pad = 0;
  // Normalize self-closing tags and clean extra spaces
  const cleaned = xml.replace(/(>)(<)(\/*)/g, '$1\r\n$2$3');
  const lines = cleaned.split('\r\n');

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    let indentChange = 0;
    if (trimmed.match(/.+<\/\w[^>]*>$/)) {
      indentChange = 0;
    } else if (trimmed.match(/^<\/\w/)) {
      if (pad > 0) pad -= 1;
    } else if (trimmed.match(/^<\w[^>]*[^/]>.*$/) && !trimmed.startsWith('<!') && !trimmed.startsWith('<?')) {
      indentChange = 1;
    }

    formatted += indent.repeat(pad) + trimmed + '\n';
    pad += indentChange;
  });

  return formatted.trim();
}

export function minifyXmlHtml(xml: string): string {
  return xml
    .replace(/<!--[\s\S]*?-->/g, '') // remove comments
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
    .trim();
}

// --- CSS Formatter ---
export function formatCss(css: string, indent = '  '): string {
  let formatted = css
    .replace(/\s*([{};:])\s*/g, '$1')
    .replace(/\{/g, ' {\n')
    .replace(/;/g, ';\n')
    .replace(/\}/g, '\n}\n')
    .replace(/\n\s*\n/g, '\n');

  const lines = formatted.split('\n');
  let pad = 0;
  formatted = lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.includes('}')) pad = Math.max(0, pad - 1);
      const res = indent.repeat(pad) + trimmed;
      if (trimmed.includes('{')) pad += 1;
      return res;
    })
    .filter(Boolean)
    .join('\n');

  return formatted;
}

export function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

// Re-export TypeScript / JavaScript formatters
export { formatJsTs, minifyJsTs, type JsTsFormatOptions } from './jsTsFormatter';

