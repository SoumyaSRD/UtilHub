import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

interface MarkdownRendererProps {
  content: string;
  onToggleChecklist?: (lineIndex: number, checked: boolean) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  onToggleChecklist,
}) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = React.useState<number | null>(null);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';
  let inTable = false;
  let tableRows: string[][] = [];

  const flushTable = (keyPrefix: number) => {
    if (tableRows.length === 0) return;
    const headerRow = tableRows[0];
    const bodyRows = tableRows.slice(1).filter((r) => !r.every((c) => c.match(/^:?-+:?$/)));

    elements.push(
      <Box
        key={`table-${keyPrefix}`}
        sx={{
          my: 2,
          overflowX: 'auto',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '8px',
          bgcolor: 'var(--glass-bg)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface-hover)', borderBottom: '2px solid var(--color-border)' }}>
              {headerRow.map((col, idx) => (
                <th key={idx} style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {col.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, rIdx) => (
              <tr
                key={rIdx}
                style={{
                  borderBottom: '1px solid var(--color-border-subtle)',
                  background: rIdx % 2 === 0 ? 'transparent' : 'var(--color-surface-hover)',
                }}
              >
                {row.map((cell, cIdx) => (
                  <td key={cIdx} style={{ padding: '8px 14px', color: 'var(--color-text-secondary)' }}>
                    {cell.trim()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    );
    tableRows = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        const codeText = codeBuffer.join('\n');
        const codeIdx = i;
        elements.push(
          <Box
            key={`code-${codeIdx}`}
            sx={{
              position: 'relative',
              my: 2,
              p: 2,
              borderRadius: '8px',
              bgcolor: 'var(--color-code-bg)',
              border: '1px solid var(--color-code-border)',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              overflowX: 'auto',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 6,
                right: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {codeLang && (
                <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  {codeLang}
                </Typography>
              )}
              <Tooltip title={copiedCodeIdx === codeIdx ? 'Copied!' : 'Copy Code'}>
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(codeText, codeIdx)}
                  sx={{ color: copiedCodeIdx === codeIdx ? 'var(--color-success)' : 'var(--color-text-muted)' }}
                >
                  {copiedCodeIdx === codeIdx ? <CheckIcon fontSize="inherit" /> : <ContentCopyIcon fontSize="inherit" />}
                </IconButton>
              </Tooltip>
            </Box>
            <pre style={{ margin: 0, color: 'var(--color-code-text)' }}>{codeText}</pre>
          </Box>
        );
        codeBuffer = [];
        inCodeBlock = false;
        codeLang = '';
        continue;
      } else {
        inCodeBlock = true;
        codeLang = line.trim().substring(3).trim();
        continue;
      }
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Markdown Table detection
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      const cells = line
        .trim()
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable(i);
    }

    // Checkbox / Checklist Item
    const taskMatch = line.match(/^(\s*)-\s*\[([ xX])\]\s*(.*)$/);
    if (taskMatch) {
      const isChecked = taskMatch[2].toLowerCase() === 'x';
      const taskText = taskMatch[3];
      const lineIndex = i;
      elements.push(
        <Box
          key={`task-${i}`}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            py: 0.5,
            cursor: onToggleChecklist ? 'pointer' : 'default',
            '&:hover': onToggleChecklist
              ? {
                  bgcolor: 'var(--color-surface-hover)',
                  borderRadius: '4px',
                }
              : {},
          }}
          onClick={() => {
            if (onToggleChecklist) {
              onToggleChecklist(lineIndex, !isChecked);
            }
          }}
        >
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => {
              if (onToggleChecklist) {
                onToggleChecklist(lineIndex, !isChecked);
              }
            }}
            style={{
              cursor: 'pointer',
              width: '16px',
              height: '16px',
              accentColor: 'var(--color-primary)',
            }}
          />
          <Typography
            variant="body2"
            sx={{
              color: isChecked ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
              textDecoration: isChecked ? 'line-through' : 'none',
              fontSize: '0.92rem',
            }}
          >
            {renderInlineMarkdown(taskText)}
          </Typography>
        </Box>
      );
      continue;
    }

    // Callout Blocks (> [!NOTE], > [!TIP], > [!WARNING], > [!IMPORTANT])
    if (line.trim().startsWith('> [!')) {
      const calloutTypeMatch = line.trim().match(/^>\s*\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]/i);
      const calloutType = calloutTypeMatch ? calloutTypeMatch[1].toUpperCase() : 'NOTE';
      const calloutLines: string[] = [];
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith('>')) {
        i++;
        calloutLines.push(lines[i].replace(/^>\s?/, ''));
      }

      const colorMap: Record<string, { border: string; bg: string; icon: string }> = {
        NOTE: { border: 'var(--color-primary)', bg: 'rgba(59, 130, 246, 0.08)', icon: 'ℹ️ Note' },
        TIP: { border: 'var(--color-success)', bg: 'rgba(16, 185, 129, 0.08)', icon: '💡 Tip' },
        WARNING: { border: 'var(--color-warning)', bg: 'rgba(245, 158, 11, 0.08)', icon: '⚠️ Warning' },
        IMPORTANT: { border: 'var(--color-secondary)', bg: 'rgba(139, 92, 246, 0.08)', icon: '⚡ Important' },
        CAUTION: { border: 'var(--color-error)', bg: 'rgba(239, 68, 68, 0.08)', icon: '🛑 Caution' },
      };

      const style = colorMap[calloutType] || colorMap.NOTE;

      elements.push(
        <Box
          key={`callout-${i}`}
          sx={{
            my: 2,
            p: 2,
            borderRadius: '6px',
            borderLeft: `4px solid ${style.border}`,
            bgcolor: style.bg,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: style.border }}>
            {style.icon}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            {calloutLines.map((cl, cIdx) => (
              <React.Fragment key={cIdx}>
                {renderInlineMarkdown(cl)}
                {cIdx < calloutLines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </Typography>
        </Box>
      );
      continue;
    }

    // Standard Blockquote
    if (line.trim().startsWith('>')) {
      const quoteText = line.replace(/^>\s?/, '');
      elements.push(
        <Box
          key={`quote-${i}`}
          sx={{
            my: 1.5,
            pl: 2,
            borderLeft: '3px solid var(--color-primary)',
            color: 'var(--color-text-secondary)',
            fontStyle: 'italic',
            bgcolor: 'var(--glass-bg)',
            py: 0.5,
            borderRadius: '0 4px 4px 0',
          }}
        >
          {renderInlineMarkdown(quoteText)}
        </Box>
      );
      continue;
    }

    // Horizontal Rule
    if (line.trim().match(/^---$|^___$|^\*\*\*$/)) {
      elements.push(
        <Box
          key={`hr-${i}`}
          sx={{
            my: 2.5,
            borderBottom: '1px solid var(--color-border)',
            opacity: 0.7,
          }}
        />
      );
      continue;
    }

    // Headers
    if (line.startsWith('# ')) {
      elements.push(
        <Typography
          key={`h1-${i}`}
          variant="h4"
          sx={{
            fontWeight: 700,
            mt: 3,
            mb: 1.5,
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border-subtle)',
            pb: 1,
          }}
        >
          {renderInlineMarkdown(line.substring(2))}
        </Typography>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <Typography
          key={`h2-${i}`}
          variant="h5"
          sx={{
            fontWeight: 600,
            mt: 2.5,
            mb: 1,
            color: 'var(--color-primary)',
          }}
        >
          {renderInlineMarkdown(line.substring(3))}
        </Typography>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <Typography
          key={`h3-${i}`}
          variant="h6"
          sx={{
            fontWeight: 600,
            mt: 2,
            mb: 0.75,
            color: 'var(--color-text-primary)',
            fontSize: '1.1rem',
          }}
        >
          {renderInlineMarkdown(line.substring(4))}
        </Typography>
      );
      continue;
    }

    // Bullet List
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const listText = line.trim().substring(2);
      elements.push(
        <Box key={`bullet-${i}`} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, my: 0.5, pl: 1.5 }}>
          <span style={{ color: 'var(--color-primary)', fontSize: '1.2rem', lineHeight: 1 }}>•</span>
          <Typography variant="body2" sx={{ color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
            {renderInlineMarkdown(listText)}
          </Typography>
        </Box>
      );
      continue;
    }

    // Numbered List
    const numMatch = line.trim().match(/^(\d+)\.\s*(.*)$/);
    if (numMatch) {
      elements.push(
        <Box key={`num-${i}`} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, my: 0.5, pl: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-primary)', minWidth: '18px' }}>
            {numMatch[1]}.
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
            {renderInlineMarkdown(numMatch[2])}
          </Typography>
        </Box>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<Box key={`br-${i}`} sx={{ height: '8px' }} />);
      continue;
    }

    // Standard Paragraph
    elements.push(
      <Typography
        key={`p-${i}`}
        variant="body2"
        sx={{
          color: 'var(--color-text-primary)',
          lineHeight: 1.7,
          my: 0.5,
          fontSize: '0.94rem',
        }}
      >
        {renderInlineMarkdown(line)}
      </Typography>
    );
  }

  // If table ended at end of document
  if (inTable) {
    flushTable(lines.length);
  }

  return (
    <Box
      sx={{
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        p: 1,
      }}
    >
      {elements}
    </Box>
  );
};

// Helper function to render bold, italic, code, tags, and links in lines
const renderInlineMarkdown = (text: string): React.ReactNode => {
  // Split by inline markdown patterns: code `...`, bold **...**, italic *...*, strikethrough ~~...~~, tags #...
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~|#[\w-]+)/g);

  return parts.map((part, idx) => {
    if (!part) return null;

    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          style={{
            backgroundColor: 'var(--color-surface-hover)',
            color: 'var(--color-primary)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.85em',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }

    if (part.startsWith('~~') && part.endsWith('~~')) {
      return <del key={idx}>{part.slice(2, -2)}</del>;
    }

    if (part.startsWith('#') && part.length > 1 && !part.includes(' ')) {
      return (
        <span
          key={idx}
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            color: 'var(--color-primary)',
            padding: '1px 7px',
            borderRadius: '12px',
            fontSize: '0.82em',
            fontWeight: 600,
            marginRight: '3px',
          }}
        >
          {part}
        </span>
      );
    }

    return part;
  });
};
