export type SqlDialect = 'standard' | 'postgres' | 'mysql' | 'sqlite' | 'oracle' | 'bigquery';
export type KeywordCase = 'upper' | 'lower' | 'preserve';

export interface SqlFormatOptions {
  dialect?: SqlDialect;
  keywordCase?: KeywordCase;
  indentSpaces?: number;
  breakOnComma?: boolean;
}

const SQL_KEYWORDS = [
  'SELECT', 'DISTINCT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE',
  'IS', 'NULL', 'GROUP BY', 'HAVING', 'ORDER BY', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
  'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN', 'ON', 'AS',
  'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE',
  'DROP TABLE', 'UNION', 'UNION ALL', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
  'EXISTS', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CAST', 'COALESCE', 'WITH', 'OVER', 'PARTITION BY'
];

const MAJOR_CLAUSES = [
  'WITH', 'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET',
  'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN', 'CROSS JOIN', 'JOIN',
  'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'UNION ALL', 'UNION'
];

export function formatSql(sql: string, options: SqlFormatOptions = {}): string {
  const {
    keywordCase = 'upper',
    indentSpaces = 2,
    breakOnComma = false,
  } = options;

  if (!sql.trim()) return '';

  const indent = ' '.repeat(indentSpaces);
  let formatted = sql.trim();

  // Normalize all whitespace to single spaces, preserving string literals
  const stringLiterals: string[] = [];
  formatted = formatted.replace(/'(?:''|[^'])*'/g, (match) => {
    stringLiterals.push(match);
    return `__SQL_STR_${stringLiterals.length - 1}__`;
  });

  // Normalize whitespace
  formatted = formatted.replace(/\s+/g, ' ');

  // Standardize keyword casing
  MAJOR_CLAUSES.forEach((clause) => {
    const regex = new RegExp(`\\b${clause.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    formatted = formatted.replace(regex, (match) => {
      if (keywordCase === 'upper') return match.toUpperCase();
      if (keywordCase === 'lower') return match.toLowerCase();
      return match;
    });
  });

  SQL_KEYWORDS.forEach((kw) => {
    const regex = new RegExp(`\\b${kw.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    formatted = formatted.replace(regex, (match) => {
      if (keywordCase === 'upper') return match.toUpperCase();
      if (keywordCase === 'lower') return match.toLowerCase();
      return match;
    });
  });

  // Break lines before major clauses
  MAJOR_CLAUSES.forEach((clause) => {
    const regex = new RegExp(`\\s+(${clause.replace(/\s+/g, '\\s+')})\\b`, 'gi');
    formatted = formatted.replace(regex, '\n$1');
  });

  // Handle commas if requested
  if (breakOnComma) {
    formatted = formatted.replace(/,\s*/g, `,\n${indent}`);
  }

  // Handle subqueries (parentheses with SELECT)
  formatted = formatted.replace(/\(\s*(SELECT\b)/gi, `(\n${indent}$1`);

  // Handle indentation for clauses after SELECT / WHERE / SET
  const lines = formatted.split('\n');
  const resultLines: string[] = [];
  let inIndentBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const isMajor = MAJOR_CLAUSES.some((c) =>
      line.toUpperCase().startsWith(c.toUpperCase())
    );

    if (isMajor) {
      inIndentBlock = !['WITH', 'UNION', 'UNION ALL'].includes(line.toUpperCase());
      resultLines.push(line);
    } else if (inIndentBlock) {
      resultLines.push(`${indent}${line}`);
    } else {
      resultLines.push(line);
    }
  }

  formatted = resultLines.join('\n');

  // Restore string literals
  stringLiterals.forEach((lit, index) => {
    formatted = formatted.replace(`__SQL_STR_${index}__`, lit);
  });

  return formatted;
}

export function minifySql(sql: string): string {
  if (!sql.trim()) return '';
  return sql
    .replace(/--.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/\s+/g, ' ')
    .trim();
}
