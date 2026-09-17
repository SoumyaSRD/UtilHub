import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../app/store';
import { showToast } from '../app/store/slices/uiSlice';
import { setActiveDataset } from '../app/store/slices/sharedDataSlice';
import { fileWorkerClient } from '../shared/workers/fileWorkerClient';
import { antigravityUtil } from '../utils/antigravityUtil';
import { saveAs } from 'file-saver';

// Supported quick actions for one-click prompts
const QUICK_PROMPTS = [
  { label: '📊 Excel to JSON', prompt: 'Convert this dataset to JSON' },
  { label: '🔍 Column Extractor', prompt: 'Extract columns' },
  { label: '🧹 Remove Duplicates', prompt: 'Remove duplicate rows' },
  { label: '📝 SQL IN-Clause', prompt: 'Generate SQL in clause from these items' },
  { label: '⚙️ Format JSON', prompt: 'Format and validate JSON' },
  { label: '🚀 Float Window (Zero-G)', prompt: 'Make this chatbox float up in the air at 80% intensity for 6 seconds!' },
];

export const CommandChatbot = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: '⚡ Autonomous AI Command Engine ready. Attach any Excel, CSV, JSON, or text file, or type a command like "excel to json", "column extractor", "sql in clause", or "format json" to execute operations instantly.',
      meta: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Draggable FAB state
  const [fabPosition, setFabPosition] = useState(() => {
    try {
      const saved = localStorage.getItem('helper_chatbot_fab_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    // Default: bottom-right
    return {
      x: typeof window !== 'undefined' ? window.innerWidth - 76 : 300,
      y: typeof window !== 'undefined' ? window.innerHeight - 76 : 500,
    };
  });

  const isDraggingFabRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const fabStartPosRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Keep FAB within window on resize
  useEffect(() => {
    const handleResize = () => {
      setFabPosition((prev) => ({
        x: Math.min(Math.max(16, prev.x), window.innerWidth - 68),
        y: Math.min(Math.max(16, prev.y), window.innerHeight - 68),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save FAB position to localStorage
  const saveFabPosition = (pos) => {
    try {
      localStorage.setItem('helper_chatbot_fab_pos', JSON.stringify(pos));
    } catch {
      // ignore
    }
  };

  // FAB Drag Handlers (Mouse)
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    isDraggingFabRef.current = true;
    hasMovedRef.current = false;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    fabStartPosRef.current = { ...fabPosition };

    const handleMouseMove = (moveEvent) => {
      if (!isDraggingFabRef.current) return;
      const dx = moveEvent.clientX - dragStartPosRef.current.x;
      const dy = moveEvent.clientY - dragStartPosRef.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMovedRef.current = true;
      }
      const newX = Math.min(Math.max(12, fabStartPosRef.current.x + dx), window.innerWidth - 64);
      const newY = Math.min(Math.max(12, fabStartPosRef.current.y + dy), window.innerHeight - 64);
      setFabPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      isDraggingFabRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (hasMovedRef.current) {
        setFabPosition((current) => {
          saveFabPosition(current);
          return current;
        });
      } else {
        // Was a clean click -> toggle chat
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // FAB Drag Handlers (Touch)
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    if (!touch) return;
    isDraggingFabRef.current = true;
    hasMovedRef.current = false;
    dragStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    fabStartPosRef.current = { ...fabPosition };

    const handleTouchMove = (moveEvent) => {
      const moveTouch = moveEvent.touches[0];
      if (!isDraggingFabRef.current || !moveTouch) return;
      const dx = moveTouch.clientX - dragStartPosRef.current.x;
      const dy = moveTouch.clientY - dragStartPosRef.current.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        hasMovedRef.current = true;
      }
      const newX = Math.min(Math.max(12, fabStartPosRef.current.x + dx), window.innerWidth - 64);
      const newY = Math.min(Math.max(12, fabStartPosRef.current.y + dy), window.innerHeight - 64);
      setFabPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
      isDraggingFabRef.current = false;
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (hasMovedRef.current) {
        setFabPosition((current) => {
          saveFabPosition(current);
          return current;
        });
      } else {
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
  };

  // Handle file select
  const handleFileAttach = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedFile(file);
    dispatch(showToast({ message: `Attached "${file.name}"`, severity: 'info' }));
    e.target.value = '';
  };

  // Drag-and-drop file into chat window
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setAttachedFile(file);
      dispatch(showToast({ message: `Attached "${file.name}" via drop`, severity: 'info' }));
    }
  };

  // Execute Autonomous Operations
  const executeAutonomousOperation = async (command, file) => {
    const lower = command.toLowerCase().trim();

    // 1. Antigravity Zero-G Float
    if (lower.includes('float') || lower.includes('lift') || lower.includes('zero-g') || lower.includes('antigravity')) {
      const intensityMatch = lower.match(/(\d{1,3})\s*%/);
      const intensity = intensityMatch ? Number(intensityMatch[1]) : 70;
      const durationMatch = lower.match(/(\d{1,2})\s*(?:second|sec|s\b)/);
      const duration = durationMatch ? Number(durationMatch[1]) : 6;
      const selector = lower.includes('body') || lower.includes('page') ? 'body' : '.chatbot-container';

      antigravityUtil.execute({ intensity, duration, selector });
      return {
        text: `🚀 Antigravity Zero-G activated! Floating target "${selector}" at ${intensity}% intensity for ${duration} seconds. Enjoy the zero-gravity physics!`,
        cardType: 'status',
      };
    }

    // 2. Navigation Commands
    if (lower.includes('go to') || lower.includes('open ') || lower.includes('navigate to')) {
      if (lower.includes('studio') || lower.includes('document')) {
        navigate('/document-studio');
        return { text: 'Navigating you to Document & File Studio...', cardType: 'nav' };
      }
      if (lower.includes('column extractor')) {
        navigate('/excel-tools/column-extractor');
        return { text: 'Navigating you to Column Extractor...', cardType: 'nav' };
      }
      if (lower.includes('tabular') || lower.includes('excel viewer')) {
        navigate('/excel-tools/tabular-viewer');
        return { text: 'Navigating you to Tabular Spreadsheet Viewer...', cardType: 'nav' };
      }
      if (lower.includes('diff') || lower.includes('compare')) {
        navigate('/universal-diff');
        return { text: 'Navigating you to Universal Diff Studio...', cardType: 'nav' };
      }
      if (lower.includes('sql') || lower.includes('in clause')) {
        navigate('/sql-tools/in-clause');
        return { text: 'Navigating you to SQL IN-Clause Tool...', cardType: 'nav' };
      }
      if (lower.includes('dashboard')) {
        navigate('/dashboard');
        return { text: 'Navigating you to Dashboard...', cardType: 'nav' };
      }
    }

    // 3. Excel / CSV to JSON
    if (
      lower.includes('excel to json') ||
      lower.includes('csv to json') ||
      lower.includes('to json') ||
      (file && (lower.includes('json') || lower.includes('convert')))
    ) {
      if (!file && !lower.includes('[') && !lower.includes('{') && !lower.includes(',')) {
        return {
          text: 'Please attach an Excel (.xlsx/.xls) or CSV file, or paste CSV/table text to convert to JSON.',
          cardType: 'warning',
        };
      }

      let parsedRows = [];
      let columns = [];
      let sourceName = file ? file.name : 'Pasted Data';

      if (file) {
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
          const res = await fileWorkerClient.parseExcelFile(file);
          parsedRows = res.rows;
          columns = res.columns;
        } else {
          const txt = await file.text();
          // parse csv lines
          const lines = txt.split('\n').filter((l) => l.trim().length > 0);
          if (lines.length > 0) {
            columns = lines[0].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
            parsedRows = lines.slice(1).map((line) => {
              const parts = line.split(',');
              const obj = {};
              columns.forEach((col, idx) => {
                obj[col] = parts[idx]?.trim().replace(/^"|"$/g, '') ?? '';
              });
              return obj;
            });
          }
        }
      } else {
        // Parse CSV or tabular text from command
        const lines = command.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length > 1) {
          columns = lines[0].split(',').map((c) => c.trim());
          parsedRows = lines.slice(1).map((l) => {
            const parts = l.split(',');
            const obj = {};
            columns.forEach((col, idx) => {
              obj[col] = parts[idx]?.trim() ?? '';
            });
            return obj;
          });
        }
      }

      if (parsedRows.length === 0) {
        return {
          text: 'Could not detect structured rows from the input. Ensure it is a valid spreadsheet, CSV, or comma-separated text.',
          cardType: 'error',
        };
      }

      const jsonStr = JSON.stringify(parsedRows, null, 2);

      // Also share with platform store for instant usage in other tools
      dispatch(
        setActiveDataset({
          id: `chatbot-dataset-${Date.now()}`,
          fileName: sourceName,
          fileType: sourceName.endsWith('.csv') ? 'csv' : 'xlsx',
          uploadedAt: new Date().toISOString(),
          sheetNames: ['Sheet1'],
          activeSheet: 'Sheet1',
          sheets: {
            Sheet1: {
              sheetName: 'Sheet1',
              columns,
              rows: parsedRows,
              totalRowCount: parsedRows.length,
              nullColumns: [],
            },
          },
          sourceTool: 'AI Chatbot',
        })
      );

      return {
        text: `✅ Converted **${sourceName}** into JSON successfully! (${parsedRows.length} rows, ${columns.length} columns)`,
        cardType: 'jsonResult',
        payload: {
          json: jsonStr,
          rowCount: parsedRows.length,
          columns,
          fileName: `${sourceName.replace(/\.[^/.]+$/, '')}.json`,
        },
      };
    }

    // 4. Column Extractor
    if (lower.includes('column extractor') || lower.includes('extract column') || lower.includes('extract cols')) {
      if (!file) {
        return {
          text: 'Please attach a spreadsheet or CSV file to extract columns from. You can also specify which columns to extract (e.g. "extract columns SKU, Unit_Price").',
          cardType: 'warning',
        };
      }

      const res = await fileWorkerClient.parseExcelFile(file);
      const allCols = res.columns;

      // Check if user requested specific columns
      const requested = allCols.filter((col) => lower.includes(col.toLowerCase()));
      const colsToExtract = requested.length > 0 ? requested : allCols.slice(0, 3);

      const extractedRows = res.rows.map((r) => {
        const out = {};
        colsToExtract.forEach((c) => (out[c] = r[c] ?? ''));
        return out;
      });

      const jsonStr = JSON.stringify(extractedRows, null, 2);
      return {
        text: `✅ Extracted ${colsToExtract.length} column(s) [${colsToExtract.join(', ')}] from **${file.name}** across ${extractedRows.length} rows.`,
        cardType: 'jsonResult',
        payload: {
          json: jsonStr,
          rowCount: extractedRows.length,
          columns: colsToExtract,
          allColumns: allCols,
          fileName: `extracted_${colsToExtract.join('_')}.json`,
        },
      };
    }

    // 5. Remove Duplicates
    if (lower.includes('remove duplicate') || lower.includes('dedupe') || lower.includes('duplicate')) {
      if (file) {
        const res = await fileWorkerClient.parseExcelFile(file);
        const originalCount = res.rows.length;
        const seen = new Set();
        const dedupedRows = [];

        res.rows.forEach((r) => {
          const key = JSON.stringify(r);
          if (!seen.has(key)) {
            seen.add(key);
            dedupedRows.push(r);
          }
        });

        const removed = originalCount - dedupedRows.length;
        const jsonStr = JSON.stringify(dedupedRows, null, 2);
        return {
          text: `✅ Deduplication complete for **${file.name}**! Removed ${removed} duplicate row(s). ${dedupedRows.length} unique rows remain.`,
          cardType: 'jsonResult',
          payload: {
            json: jsonStr,
            rowCount: dedupedRows.length,
            columns: res.columns,
            fileName: `deduped_${file.name.replace(/\.[^/.]+$/, '')}.json`,
          },
        };
      } else {
        // Dedupe text lines
        const lines = command.split('\n');
        const unique = Array.from(new Set(lines));
        return {
          text: `✅ Removed ${lines.length - unique.length} duplicate lines.`,
          cardType: 'textResult',
          payload: { text: unique.join('\n') },
        };
      }
    }

    // 6. SQL IN-Clause
    if (lower.includes('in clause') || lower.includes('sql in') || lower.includes('in list')) {
      let items = [];
      if (file) {
        const text = await file.text();
        items = text.split(/[\r\n,]+/).map((s) => s.trim()).filter(Boolean);
      } else {
        // Extract from command
        const raw = command.replace(/(generate|sql|in clause|create|from|for)/gi, '');
        items = raw.split(/[\r\n,;]+/).map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
      }

      if (items.length === 0) {
        return {
          text: 'Please provide items or attach a file with IDs/values to generate the SQL IN clause.',
          cardType: 'warning',
        };
      }

      const formatted = items.map((item) => (/^\d+(\.\d+)?$/.test(item) ? item : `'${item.replace(/'/g, "''")}'`));
      const inClause = `IN (${formatted.join(', ')})`;

      return {
        text: `Generated SQL IN clause for ${items.length} item(s):`,
        cardType: 'sqlResult',
        payload: { sql: inClause },
      };
    }

    // 7. Format JSON
    if (lower.includes('format json') || lower.includes('beautify json') || lower.includes('validate json')) {
      let targetText = command;
      if (file) {
        targetText = await file.text();
      }
      try {
        const jsonMatch = targetText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        const toParse = jsonMatch ? jsonMatch[0] : targetText;
        const parsed = JSON.parse(toParse);
        const formatted = JSON.stringify(parsed, null, 2);
        return {
          text: '✅ JSON validated and formatted cleanly:',
          cardType: 'jsonResult',
          payload: { json: formatted, rowCount: Array.isArray(parsed) ? parsed.length : 1, fileName: 'formatted.json' },
        };
      } catch (err) {
        return {
          text: `❌ Invalid JSON: ${err.message}`,
          cardType: 'error',
        };
      }
    }

    // 8. Base64 encode / decode
    if (lower.includes('base64')) {
      const isDecode = lower.includes('decode');
      const textMatch = command.match(/["']([^"']+)["']/) || [null, command.replace(/base64|encode|decode/gi, '').trim()];
      const str = textMatch[1] || '';
      try {
        const result = isDecode ? atob(str) : btoa(str);
        return {
          text: `Base64 ${isDecode ? 'Decoded' : 'Encoded'} Result:`,
          cardType: 'textResult',
          payload: { text: result },
        };
      } catch (err) {
        return { text: `Base64 error: ${err.message}`, cardType: 'error' };
      }
    }

    // Default: local intelligent help
    return {
      text: `🤖 **Autonomous Command Assistant**\n\nI can execute application operations directly on your files or pasted data:\n\n` +
        `• **Excel to JSON**: Attach a spreadsheet or CSV and say *"convert to json"*\n` +
        `• **Column Extractor**: Say *"extract columns SKU, Product_Name"*\n` +
        `• **Remove Duplicates**: Say *"remove duplicates"*\n` +
        `• **SQL IN-Clause**: Say *"generate in clause"*\n` +
        `• **Format JSON**: Say *"format json"*\n` +
        `• **Navigation**: Say *"go to document studio"* or *"open column extractor"*\n` +
        `• **Zero-G Physics**: Say *"make this chatbox float up in the air at 80% intensity"*`,
      cardType: 'help',
    };
  };

  // Submit Handler
  const handleSend = async (customPrompt = null) => {
    const textToSend = customPrompt || inputVal;
    if (!textToSend.trim() && !attachedFile) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: textToSend || `Process attached file: ${attachedFile?.name}`,
      attachedFile: attachedFile ? { name: attachedFile.name, size: attachedFile.size } : null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    const currentFile = attachedFile;
    setAttachedFile(null);
    setIsProcessing(true);

    try {
      const opResult = await executeAutonomousOperation(textToSend, currentFile);
      const assistantMsg = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: opResult.text,
        cardType: opResult.cardType,
        payload: opResult.payload,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-err-${Date.now()}`,
          role: 'assistant',
          text: `⚠️ Operation error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text, label = 'Copied to clipboard') => {
    navigator.clipboard.writeText(text);
    dispatch(showToast({ message: label, severity: 'success' }));
  };

  const downloadFile = (content, fileName, mimeType = 'application/json') => {
    const blob = new Blob([content], { type: mimeType });
    saveAs(blob, fileName);
    dispatch(showToast({ message: `Downloaded ${fileName}`, severity: 'success' }));
  };

  return (
    <>
      {/* Draggable Circular Floating Action Button (FAB) */}
      <div
        style={{
          position: 'fixed',
          left: `${fabPosition.x}px`,
          top: `${fabPosition.y}px`,
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 50%, #06b6d4 100%)',
          boxShadow: '0 8px 24px rgba(79, 70, 229, 0.45), 0 0 16px rgba(6, 182, 212, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDraggingFabRef.current ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'none',
          zIndex: 9999,
          transition: isDraggingFabRef.current ? 'none' : 'box-shadow 0.2s ease, transform 0.15s ease',
          border: '2px solid rgba(255, 255, 255, 0.35)',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        title="Drag to move. Click to open AI Command Terminal"
      >
        {/* Pulse Indicator */}
        <span
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            border: '2px solid #ffffff',
            boxShadow: '0 0 8px #10b981',
          }}
        />
        {/* Bot / Terminal Icon */}
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      </div>

      {/* Expanded Terminal Chatbot Window */}
      {isOpen && (
        <div
          className="chatbot-container"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '450px',
            maxWidth: 'calc(100vw - 32px)',
            height: '650px',
            maxHeight: 'calc(100vh - 48px)',
            backgroundColor: 'rgba(15, 23, 42, 0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: isDraggingFile ? '2px dashed #38bdf8' : '1px solid rgba(148, 163, 184, 0.25)',
            borderRadius: '16px',
            boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.65), 0 0 35px rgba(99, 102, 241, 0.25)',
            zIndex: 9998,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: '#f1f5f9',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
              backgroundColor: 'rgba(30, 41, 59, 0.7)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#e2e8f0' }}>AI Command Orchestrator</span>
              <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '2px 6px', borderRadius: '999px' }}>
                Active
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => setMessages([messages[0]])}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}
                title="Clear chat history"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  lineHeight: 1,
                  padding: '4px 8px',
                }}
                title="Close chat window"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '92%',
                  backgroundColor: m.role === 'user' ? '#3b82f6' : 'rgba(30, 41, 59, 0.85)',
                  color: m.role === 'user' ? '#ffffff' : '#f1f5f9',
                  padding: '10px 14px',
                  borderRadius: m.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  border: m.role === 'user' ? 'none' : '1px solid rgba(148, 163, 184, 0.15)',
                  fontSize: '0.86rem',
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                {/* Attached File in Message */}
                {m.attachedFile && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      marginBottom: '6px',
                      fontSize: '0.75rem',
                    }}
                  >
                    📎 {m.attachedFile.name} ({(m.attachedFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}

                <div>{m.text}</div>

                {/* JSON Result Card */}
                {m.cardType === 'jsonResult' && m.payload && (
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '10px',
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
                        Result: {m.payload.rowCount} rows
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => copyToClipboard(m.payload.json, 'Copied JSON to clipboard')}
                          style={{
                            backgroundColor: 'rgba(56, 189, 248, 0.15)',
                            color: '#38bdf8',
                            border: '1px solid rgba(56, 189, 248, 0.4)',
                            borderRadius: '4px',
                            padding: '2px 8px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => downloadFile(m.payload.json, m.payload.fileName)}
                          style={{
                            backgroundColor: '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '2px 8px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          Download
                        </button>
                      </div>
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        maxHeight: '160px',
                        overflowY: 'auto',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {m.payload.json.slice(0, 500)}
                      {m.payload.json.length > 500 ? '\n... (truncated)' : ''}
                    </pre>
                  </div>
                )}

                {/* SQL Result Card */}
                {m.cardType === 'sqlResult' && m.payload && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '8px',
                      backgroundColor: '#0f172a',
                      borderRadius: '6px',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.7rem', color: '#4ade80' }}>SQL Statement</span>
                      <button
                        onClick={() => copyToClipboard(m.payload.sql, 'Copied SQL to clipboard')}
                        style={{
                          backgroundColor: 'rgba(34, 197, 94, 0.2)',
                          color: '#4ade80',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                        }}
                      >
                        Copy SQL
                      </button>
                    </div>
                    <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.78rem', color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
                      {m.payload.sql}
                    </pre>
                  </div>
                )}

                {/* Text Result Card */}
                {m.cardType === 'textResult' && m.payload && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '8px',
                      backgroundColor: '#0f172a',
                      borderRadius: '6px',
                    }}
                  >
                    <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.8rem', color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
                      {m.payload.text}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(m.payload.text)}
                      style={{
                        marginTop: '6px',
                        backgroundColor: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '0.7rem',
                        cursor: 'pointer',
                      }}
                    >
                      Copy
                    </button>
                  </div>
                )}

                <div style={{ fontSize: '0.68rem', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
                  {m.timestamp}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: 'rgba(30, 41, 59, 0.85)',
                  padding: '10px 14px',
                  borderRadius: '14px 14px 14px 2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  color: '#94a3b8',
                }}
              >
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8', animation: 'ping 1s infinite' }} />
                Executing command in background worker...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div
            style={{
              padding: '6px 12px',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              borderTop: '1px solid rgba(148, 163, 184, 0.1)',
            }}
          >
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.prompt)}
                style={{
                  backgroundColor: 'rgba(30, 41, 59, 0.7)',
                  color: '#94a3b8',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '12px',
                  padding: '3px 9px',
                  fontSize: '0.72rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Attached File Chip (if present) */}
          {attachedFile && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 12px',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                borderTop: '1px solid rgba(56, 189, 248, 0.2)',
                fontSize: '0.78rem',
                color: '#38bdf8',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📎</span>
                <span style={{ fontWeight: 600 }}>{attachedFile.name}</span>
                <span style={{ opacity: 0.7 }}>({(attachedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button
                onClick={() => setAttachedFile(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Input Bar */}
          <div
            style={{
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              borderTop: '1px solid rgba(148, 163, 184, 0.15)',
            }}
          >
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileAttach}
              accept=".xlsx,.xls,.csv,.json,.txt,.md,.sql,.pdf"
            />
            {/* Attachment Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: 'none',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                borderRadius: '8px',
                padding: '7px 9px',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Attach Excel, CSV, JSON, or text file"
            >
              📎
            </button>

            {/* Command Text Input */}
            <input
              ref={inputRef}
              type="text"
              placeholder={attachedFile ? `Command for ${attachedFile.name}...` : 'Type command (e.g. "excel to json")...'}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              style={{
                flex: 1,
                backgroundColor: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#f8fafc',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />

            {/* Send Button */}
            <button
              onClick={() => handleSend()}
              disabled={isProcessing || (!inputVal.trim() && !attachedFile)}
              style={{
                backgroundColor: isProcessing || (!inputVal.trim() && !attachedFile) ? '#475569' : '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: isProcessing || (!inputVal.trim() && !attachedFile) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CommandChatbot;
