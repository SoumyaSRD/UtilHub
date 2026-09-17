# UtilHub - Enterprise Engineering & Productivity Platform

[![Deploy to GitHub Pages](https://github.com/SoumyaSRD/UtilHub/actions/workflows/deploy.yml/badge.svg)](https://github.com/SoumyaSRD/UtilHub/actions/workflows/deploy.yml)

🌐 **Live Application URL**: [https://soumyasrd.github.io/UtilHub/](https://soumyasrd.github.io/UtilHub/)

A high-performance, developer-first engineering workspace featuring large-scale spreadsheet virtualization, hierarchical Microsoft OneNote-compatible notes creation, precision code formatters & compiler sandbox, universal side-by-side diffing, asynchronous Web Worker data processing, and an autonomous AI command chatbot.

---

## 🚀 Key Features & Workstations

### 📝 Tree-Structured Notes & Microsoft OneNote Creator Studio
- **Hierarchical Tree Structure**: Organize thoughts in Notebooks → Colored Sections → Multi-level Pages & Sub-pages (`parentId` nesting) with drag/move, collapse/expand, and pinning.
- **Rich Markdown Editor**: Comprehensive toolbar supporting Headings (H1–H3), Bold, Italic, Strikethrough, Code Blocks, Tables, Quotes, Callout Boxes (Tip, Warning, Note), and Date/Time stamps.
- **Interactive Checklist Checkboxes**: In preview mode, click any task checkbox to instantly toggle between `[ ]` and `[x]` with real-time auto-saving.
- **Microsoft Notes Compatibility**:
  - **OneNote HTML Export**: Generates compliant OneNote HTML documents with OneNote XML metadata, breadcrumb headers, and section styling.
  - **Microsoft Sticky Notes Board View**: Switchable grid view for quick sticky note scratchpads with classic sticky colors (*Canary Yellow*, *Mint Green*, *Sky Blue*, *Lavender Purple*, *Blossom Pink*, *Charcoal Slate*).
  - **Markdown & Plain Text Exports**: Direct downloads in `.md` and `.txt`.
- **Local Storage Auto-Save Persistence**: Every keystroke, new page, rename, or color tag is continuously auto-saved to `localStorage` (`utilityhub_notes_creator_workspace_v1`) and restored automatically upon returning to the page.
- **Backup & Restore**: Export complete workspace to JSON and restore via file picker anytime.

---

### 📊 Excel Tabular Viewer & Multi-Sheet Studio
- **100,000+ (1 Lakh+) Record Virtual Scrolling**: Native 60fps virtualization window rendering that seamlessly scrolls through massive datasets without browser lag or DOM overload.
- **Dynamic Multi-Sheet Tabs**: Automatically extracts all sheets from uploaded `.xlsx`, `.xls`, or `.csv` workbooks, rendering interactive tabs with per-sheet row counts and empty column indicators.
- **Intelligent Null Column Remover**: Detects columns where 100% of cells are empty, null, undefined, or blank whitespace. Provides a 1-click toggle to hide empty columns in the table view.
- **Multiple Download Capabilities**:
  - 📥 **Cleaned Excel (.xlsx)**: Strips all-null columns from the active sheet.
  - 📥 **Cleaned Full Workbook (.xlsx)**: Preserves all workbook tabs while removing empty columns across each individual sheet.
  - 📥 **Cleaned CSV (.csv)**: Export current sheet as CSV without null columns.
  - 📥 **Cleaned JSON (.json)**: Export as JSON array of objects omitting empty properties.
  - 📥 **Filtered Rows Only**: Export only the rows matching search filters.
  - 📥 **Raw / Original Exports**: Unmodified exports with all original columns intact.
- **Interactive Tools**: Global multi-column search, column sorting, schema drawer with data type detection & fill rates, jump-to-row navigation, and cell inspection modal.
- **Demo Dataset**: 1-click generation of a 100,000-row multi-sheet demo workbook with empty columns to test immediately.

---

### ⚡ Zero UI Freezing: Asynchronous Web Worker Architecture
- **Dedicated Web Workers**: Offloads CPU-intensive operations (parsing multi-megabyte spreadsheets, Myers diff calculations, composite key deduplication, column projection, and exports) off the UI thread to [`fileProcessor.worker.ts`](src/shared/workers/fileProcessor.worker.ts).
- **Graceful Fallback**: Automatic detection and graceful fallback for non-worker environments.
- **Responsive 60fps UI**: Retains smooth scrolling and interaction during heavy file crunching.

---

### 🔍 Side-by-Side Universal JSON & Text Diff Studio
- **Dual Synchronized Monaco Editors**: Side-by-side editable text panels with live JSON syntax validation (`Valid` / `Invalid` badge), line & character counts, upload, paste, format, and clear buttons.
- **Diff Display Modes**: Toggle between side-by-side synchronized diff and unified inline diff.
- **Semantic Differences Breakdown Table**: Displays dot-notated paths, old value, new value, and type chips (`+ ADDED`, `- REMOVED`, `~ MODIFIED`, `! TYPE CHANGE`), with instant search filtering.
- **Presets & Controls**: Sample presets (*API Schema Diff*, *Server Config Diff*, *Permissions Diff*), swap sides, ignore key ordering, and export diff report.

---

### 💻 Precision JS/TS Formatter & TypeScript Compiler Arena
- **Precision Formatter**: Beautify, indent (2 spaces, 4 spaces, Tab), enforce semicolons, normalize quotes, and format TypeScript interfaces/types without corrupting string literals.
- **Live In-Browser TypeScript Compiler & Sandbox**:
  - Transpiles TypeScript into clean ES2022 JavaScript on the fly.
  - Executes code in a safe sandbox with real-time console log interception (`log`, `warn`, `error`), returned value capture, and millisecond execution timer.
- **Curated Coding Challenges**: Built-in practice challenges (*Two Sum*, *Deep Clone*, *LRU Cache*, *Async Concurrency Pool*, *Debounce & Throttle*, *Recursive Array Flatten*, *TypeScript Type Gymnastics*).

---

### 🤖 Autonomous AI Command Chatbot
- **Draggable Circular FAB**: 54px circular floating action button with smooth drag-and-drop movement anywhere on the screen (position is clamped and remembered across reloads).
- **File Drops & Attachment**: Attach or drop `.xlsx`, `.csv`, `.json`, `.txt`, `.md`, or `.sql` files directly into chat.
- **Autonomous Tool Execution**:
  - *"excel to json"*: Extracts spreadsheet rows into interactive JSON cards.
  - *"extract columns"*, *"remove duplicates"*, *"sql in clause"*, *"format json"*.
  - *"open notes"*: Instant navigation to Notes Studio.
  - Zero-G physics floating animation on demand.

---

### 🎨 Dynamic SCSS Theme Engine & Solo Leveling Anime Theme
- **Dynamic SCSS Token Engine**: Declarative `@mixin generate-theme-tokens` generating primary, secondary, canvas, typography, borders, state colors, and glassmorphic tokens (`--glass-bg`, `--glass-border`, `--glass-blur`, `--ambient-gradient`).
- **8 Curated Themes**:
  1. 🗡️ **Solo Leveling** (*Anime Theme*): Deep abyss dungeon void (`#05070e`), glowing electric cyan necromancy accents (`#00e5ff`), monarch purple aura (`#8b5cf6`), system quest alert gold, and "ARISE" badge.
  2. 🌌 **Obsidian Night**: Premium dark engineering canvas with cobalt accents.
  3. ☀️ **Frosted Daylight**: Clean daylight aesthetic with frosted glass cards.
  4. ⚡ **Cyberpunk Neon**: Synthwave midnight with radiant neon cyan and hot magenta.
  5. 🧛 **Dracula Pro**: Dark midnight purple with vivid violet, pink, and cyan.
  6. 🌅 **Tokyo Sunset**: Twilight nightscape with sunset amber and sakura pink.
  7. ❄️ **Nordic Frost**: Arctic polar night slate with crystalline frost blue.
  8. 🏢 **Enterprise Blue & Green**: High-contrast corporate productivity palettes.
- **Frosted Glassmorphism**: `backdrop-filter: blur(16px)` across cards, dialogs, headers, sidebars, and chatbot.

---

## 💻 Tech Stack
- **Framework**: React 19 + TypeScript + Vite 8
- **UI & Icons**: Material UI v9 (`@mui/material`), Material Icons (`@mui/icons-material`)
- **Code & Diff Editor**: Monaco Editor (`@monaco-editor/react`)
- **Workers**: Dedicated Web Workers (`fileProcessor.worker.ts`)
- **Styling**: Dynamic SCSS Design Token System with Glassmorphism
- **Data Engine**: SheetJS XLSX (`xlsx`), FileSaver (`file-saver`)
- **State Management**: Redux Toolkit
- **CI/CD & Hosting**: GitHub Actions + GitHub Pages

---

## 🛠️ Local Development

```bash
# 1. Clone repository
git clone https://github.com/SoumyaSRD/UtilHub.git
cd UtilHub

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Run unit tests
npm test

# 5. Build for production
npm run build
```

---

## 📄 License
MIT License © 2026 UtilHub Contributors.
