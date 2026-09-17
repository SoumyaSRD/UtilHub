import type { Notebook, NoteSection, NoteItem, NotesWorkspace } from '../types';

export const NOTES_STORAGE_KEY = 'utilityhub_notes_creator_workspace_v1';

export const SECTION_COLORS = [
  '#3b82f6', // OneNote Blue
  '#10b981', // Emerald Green
  '#8b5cf6', // Monarch Purple
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#ef4444', // Crimson Red
  '#64748b', // Slate
];

export const STICKY_NOTE_COLORS = [
  { name: 'Canary Yellow', bg: '#fef08a', text: '#713f12', border: '#fde047' },
  { name: 'Mint Green', bg: '#bbf7d0', text: '#14532d', border: '#86efac' },
  { name: 'Sky Blue', bg: '#bae6fd', text: '#0c4a6e', border: '#7dd3fc' },
  { name: 'Lavender Purple', bg: '#ddd6fe', text: '#4c1d95', border: '#c4b5fd' },
  { name: 'Blossom Pink', bg: '#fbcfe8', text: '#831843', border: '#f472b6' },
  { name: 'Charcoal Slate', bg: '#334155', text: '#f8fafc', border: '#475569' },
];

export const createDefaultWorkspace = (): NotesWorkspace => {
  const nbEngineering: Notebook = {
    id: 'nb-eng-01',
    name: 'Engineering Architecture & Playbook',
    description: 'System specifications, architectural decision records, and sprint planning',
    color: '#3b82f6',
    icon: 'Terminal',
    order: 1,
  };

  const nbInnovation: Notebook = {
    id: 'nb-inv-02',
    name: 'Product Innovation Lab',
    description: 'Feature brainstorms, UX research insights, and customer feedback logs',
    color: '#8b5cf6',
    icon: 'AutoStories',
    order: 2,
  };

  const nbSticky: Notebook = {
    id: 'nb-stk-03',
    name: 'Microsoft Sticky Notes & Scratchpad',
    description: 'Quick thoughts, daily reminders, and fast scratchpad notes',
    color: '#f59e0b',
    icon: 'StickyNote2',
    order: 3,
  };

  // Sections
  const secArch: NoteSection = {
    id: 'sec-arch-01',
    notebookId: nbEngineering.id,
    name: 'Architecture Decisions (ADRs)',
    color: '#3b82f6',
    order: 1,
  };

  const secSprint: NoteSection = {
    id: 'sec-sprint-02',
    notebookId: nbEngineering.id,
    name: 'Sprint Backlog & Tasks',
    color: '#10b981',
    order: 2,
  };

  const secStandards: NoteSection = {
    id: 'sec-std-03',
    notebookId: nbEngineering.id,
    name: 'Frontend & Backend Standards',
    color: '#06b6d4',
    order: 3,
  };

  const secIdeas: NoteSection = {
    id: 'sec-ideas-04',
    notebookId: nbInnovation.id,
    name: 'AI & Productivity Features',
    color: '#8b5cf6',
    order: 1,
  };

  const secScratch: NoteSection = {
    id: 'sec-scr-05',
    notebookId: nbSticky.id,
    name: 'Quick Scratchboard',
    color: '#f59e0b',
    order: 1,
  };

  const now = new Date().toISOString();

  // Notes in Tree hierarchy
  const noteAdr: NoteItem = {
    id: 'note-adr-001',
    notebookId: nbEngineering.id,
    sectionId: secArch.id,
    parentId: null, // Root note in this section
    title: 'ADR 008: High-Performance Web Worker Architecture',
    tags: ['architecture', 'performance', 'workers', 'critical'],
    color: '#3b82f6',
    pinned: true,
    createdAt: now,
    updatedAt: now,
    content: `# ADR 008: High-Performance Web Worker Architecture

> **Status:** Accepted  
> **Date:** 2026-09-17  
> **Stakeholders:** Lead Architect, Core Platform Team

---

## 1. Context & Problem Statement
When handling enterprise spreadsheets (Excel files with 100,000+ rows), large PDF conversions, and high-volume universal text diff calculations, processing on the UI thread causes severe frame drops and page freezing.

## 2. Decision Outcome
We decided to offload all CPU-bound parsing, chunking, deduplication, and syntax formatting tasks to dedicated **Web Workers** via typed message passing and Comlink/Transferable Objects.

### Architecture Topology
| Component | Responsibility | Thread Model |
| :--- | :--- | :--- |
| **App UI View** | Render Monaco Editor, virtualized grid, and glass controls | Main UI Thread (60fps) |
| **FileProcessor Worker** | Parse .xlsx, extract columns, remove duplicate keys | Dedicated Worker Thread |
| **Diff & Syntax Worker** | Myers diff algorithms, Prettier AST formatting | Dedicated Worker Thread |
| **Worker Client Facade** | Timeout handling, worker pooling, and error boundaries | Bridge Layer |

## 3. Implementation Code Pattern
\`\`\`typescript
// Worker communication standard
export interface WorkerTaskPayload<T> {
  action: 'PARSE_EXCEL' | 'FORMAT_CODE' | 'COMPUTE_DIFF';
  payload: T;
  transferables?: ArrayBuffer[];
}

export const executeWorkerTask = async <T, R>(task: WorkerTaskPayload<T>): Promise<R> => {
  return new Promise((resolve, reject) => {
    const worker = getWorkerInstance();
    worker.postMessage(task);
    worker.onmessage = (e) => resolve(e.data);
    worker.onerror = (err) => reject(err);
  });
};
\`\`\`

> [!TIP]
> Always verify memory cleanup by terminating transient workers after heavy batch operations.
`,
  };

  const noteAdrChild: NoteItem = {
    id: 'note-adr-child-002',
    notebookId: nbEngineering.id,
    sectionId: secArch.id,
    parentId: noteAdr.id, // Child note under noteAdr (Tree Structure)
    title: 'Sub-Note: Fallback Strategies for Non-Worker Environments',
    tags: ['architecture', 'fallback', 'sub-note'],
    color: '#06b6d4',
    pinned: false,
    createdAt: now,
    updatedAt: now,
    content: `# Sub-Note: Fallback Strategies for Non-Worker Environments

This sub-page complements **ADR 008** by outlining graceful degradation strategies when Web Workers are unavailable or restricted by enterprise security policies.

### Graceful Fallback Pipeline
1. **Time-sliced processing via \`requestIdleCallback\`**
2. **Chunked async processing with \`setTimeout(0)\` batches**
3. **Progressive user notification banners**

- [x] Implement browser worker support detection (\`typeof Worker !== 'undefined'\`)
- [x] Configure fallback chunk size limit (maximum 2,500 items per tick)
- [ ] Add performance telemetry report when fallback executes
`,
  };

  const noteSprint: NoteItem = {
    id: 'note-sprint-003',
    notebookId: nbEngineering.id,
    sectionId: secSprint.id,
    parentId: null,
    title: 'Sprint 24 Action Items & Release Checklist',
    tags: ['sprint', 'todo', 'checklist'],
    color: '#10b981',
    pinned: true,
    createdAt: now,
    updatedAt: now,
    content: `# Sprint 24 Action Items & Release Checklist

Interactive checklist of deliverable tasks for the upcoming platform milestone.

### Milestone Deliverables
- [x] Implement dynamic SCSS theme engine with instant live switching
- [x] Add Solo Leveling anime aesthetic theme with monarch purple & cyan glow
- [x] Build tree-structured Microsoft OneNote compatible Notes Creator
- [ ] Benchmark cold startup latency across 500+ stored notes
- [ ] Enable cloud export synchronization for offline backup

### Priority Bug Fixes
- [x] Fix Monaco Editor dark theme mismatch in Dracula and Cyberpunk themes
- [x] Eliminate hardcoded dark hex colors in Chatbot interface
- [ ] Add touch swipe gesture on mobile sidebar navigation

### Discussion Points for Standup
* **P1:** Memory footprint when indexing notes with attachments.
* **P2:** Microsoft OneNote HTML schema compliance testing.
`,
  };

  const noteStandards: NoteItem = {
    id: 'note-std-004',
    notebookId: nbEngineering.id,
    sectionId: secStandards.id,
    parentId: null,
    title: 'React 19 & TypeScript Development Guide',
    tags: ['standards', 'typescript', 'react'],
    color: '#06b6d4',
    pinned: false,
    createdAt: now,
    updatedAt: now,
    content: `# React 19 & TypeScript Development Guide

Guidelines and code conventions for UtilityHub engineering modules.

### Component Structure Standard
1. Strict typing on all component props
2. Frosted glass styling utilizing CSS variables (\`var(--glass-bg)\`, \`var(--glass-border)\`)
3. Zero inline hex values for themes; always leverage theme token variables

\`\`\`tsx
export const GlassCard: React.FC<GlassCardProps> = ({ title, children }) => {
  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
};
\`\`\`
`,
  };

  const noteAiFeatures: NoteItem = {
    id: 'note-ai-005',
    notebookId: nbInnovation.id,
    sectionId: secIdeas.id,
    parentId: null,
    title: 'AI Command Assistant Workflow Specifications',
    tags: ['ai', 'roadmap', 'innovation'],
    color: '#8b5cf6',
    pinned: true,
    createdAt: now,
    updatedAt: now,
    content: `# AI Command Assistant Workflow Specifications

Specifications for the draggable AI Command Chatbot:

### Supported Natural Language Commands
- \`"Convert this CSV into JSON and download"\`
- \`"Format this messy SQL query with UPPERCASE keywords"\`
- \`"Extract column CustomerID from uploaded spreadsheet"\`
- \`"Compare these two JSON payloads and highlight mismatched fields"\`

> [!NOTE]
> All processing happens locally in the browser or worker thread, preserving user data privacy.
`,
  };

  // Sticky Notes for quick scratchboard
  const sticky1: NoteItem = {
    id: 'sticky-001',
    notebookId: nbSticky.id,
    sectionId: secScratch.id,
    parentId: null,
    title: '💡 Quick Thought: Keybindings',
    content: 'Add Ctrl+Shift+N global shortcut to instantly open a new note popup from anywhere in the app.',
    tags: ['shortcut', 'idea'],
    color: '#fef08a', // Canary Yellow
    pinned: true,
    isStickyNote: true,
    createdAt: now,
    updatedAt: now,
  };

  const sticky2: NoteItem = {
    id: 'sticky-002',
    notebookId: nbSticky.id,
    sectionId: secScratch.id,
    parentId: null,
    title: 'Meeting with DevOps @ 3:00 PM',
    content: 'Discuss automated build pipeline and Docker caching optimization for faster staging deployments.',
    tags: ['meeting', 'devops'],
    color: '#bbf7d0', // Mint Green
    pinned: false,
    isStickyNote: true,
    createdAt: now,
    updatedAt: now,
  };

  const sticky3: NoteItem = {
    id: 'sticky-003',
    notebookId: nbSticky.id,
    sectionId: secScratch.id,
    parentId: null,
    title: 'Database Migration Notice',
    content: 'Run schema updates for column user_preferences_json before Friday release freeze.',
    tags: ['database', 'urgent'],
    color: '#fbcfe8', // Blossom Pink
    pinned: true,
    isStickyNote: true,
    createdAt: now,
    updatedAt: now,
  };

  return {
    notebooks: [nbEngineering, nbInnovation, nbSticky],
    sections: [secArch, secSprint, secStandards, secIdeas, secScratch],
    notes: [noteAdr, noteAdrChild, noteSprint, noteStandards, noteAiFeatures, sticky1, sticky2, sticky3],
    activeNotebookId: nbEngineering.id,
    activeSectionId: secArch.id,
    activeNoteId: noteAdr.id,
    expandedNodeIds: [noteAdr.id],
    lastSaved: now,
  };
};

// Persistence functions
export const loadNotesWorkspace = (): NotesWorkspace => {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) {
      const defaultWs = createDefaultWorkspace();
      saveNotesWorkspace(defaultWs);
      return defaultWs;
    }
    const parsed = JSON.parse(raw) as NotesWorkspace;
    if (!parsed.notebooks || !parsed.sections || !parsed.notes) {
      const defaultWs = createDefaultWorkspace();
      saveNotesWorkspace(defaultWs);
      return defaultWs;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load notes workspace from localStorage, initializing defaults:', err);
    const defaultWs = createDefaultWorkspace();
    return defaultWs;
  }
};

export const saveNotesWorkspace = (workspace: NotesWorkspace): void => {
  try {
    const updated = {
      ...workspace,
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save notes workspace to localStorage:', err);
  }
};

// Microsoft OneNote Compatible HTML Generator
export const exportNoteToOneNoteHtml = (
  note: NoteItem,
  sectionName = 'General',
  notebookName = 'Personal Notebook'
): string => {
  // Convert basic markdown formatting into compliant HTML representation
  const htmlBody = note.content
    .replace(/^# (.*$)/gim, '<h1 style="color:#2b579a;font-family:\'Segoe UI\',sans-serif;margin-top:20px;">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 style="color:#107c41;font-family:\'Segoe UI\',sans-serif;margin-top:16px;">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 style="color:#4a5568;font-family:\'Segoe UI\',sans-serif;margin-top:12px;">$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/~~(.*?)~~/gim, '<del>$1</del>')
    .replace(/`([^`]+)`/gim, '<code style="background-color:#f1f5f9;padding:2px 6px;border-radius:4px;font-family:Consolas,monospace;">$1</code>')
    .replace(/- \[x\] (.*$)/gim, '<p style="margin:4px 0;"><span style="color:#10b981;font-weight:bold;">☑</span> <del>$1</del></p>')
    .replace(/- \[ \] (.*$)/gim, '<p style="margin:4px 0;"><span style="color:#64748b;">☐</span> $1</p>')
    .replace(/^- (.*$)/gim, '<li style="margin-left:20px;">$1</li>')
    .replace(/\n\n/gim, '<br/><br/>');

  const formattedDate = new Date(note.updatedAt || note.createdAt).toLocaleString();

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:dt="uuid:C2F41010-65B3-11d1-A29F-00AA00C14882"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="generator" content="UtilityHub Microsoft OneNote Compatible Note Creator" />
  <meta name="application-name" content="Microsoft OneNote" />
  <meta name="notebook" content="${escapeXml(notebookName)}" />
  <meta name="section" content="${escapeXml(sectionName)}" />
  <meta name="created" content="${note.createdAt}" />
  <meta name="updated" content="${note.updatedAt}" />
  <title>${escapeXml(note.title)}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11pt;
      color: #1f2937;
      line-height: 1.6;
      background-color: #ffffff;
      margin: 40px;
    }
    .onenote-header {
      border-bottom: 2px solid #8b5cf6;
      padding-bottom: 12px;
      margin-bottom: 24px;
    }
    .onenote-breadcrumbs {
      font-size: 9pt;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
    }
    .onenote-title {
      font-size: 20pt;
      font-weight: 600;
      color: #111827;
      margin: 0 0 8px 0;
    }
    .onenote-meta {
      font-size: 9pt;
      color: #9ca3af;
    }
    .onenote-tag {
      display: inline-block;
      background: #e0e7ff;
      color: #4338ca;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 8pt;
      font-weight: 600;
      margin-right: 4px;
    }
  </style>
</head>
<body>
  <div class="onenote-header">
    <div class="onenote-breadcrumbs">
      ${escapeXml(notebookName)} &gt; ${escapeXml(sectionName)}
    </div>
    <h1 class="onenote-title">${escapeXml(note.title)}</h1>
    <div class="onenote-meta">
      Last modified: ${formattedDate}
      ${note.tags.length > 0 ? '<br/>' + note.tags.map((t) => `<span class="onenote-tag">#${escapeXml(t)}</span>`).join(' ') : ''}
    </div>
  </div>
  <div class="onenote-content">
    ${htmlBody}
  </div>
</body>
</html>`;
};

const escapeXml = (unsafe: string): string => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
};
