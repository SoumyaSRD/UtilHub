export interface NoteItem {
  id: string;
  notebookId: string;
  sectionId: string;
  parentId: string | null; // For tree nesting: pages and sub-pages
  title: string;
  content: string;
  tags: string[];
  color: string; // OneNote category color or Sticky note color
  pinned: boolean;
  isStickyNote?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteSection {
  id: string;
  notebookId: string;
  name: string;
  color: string; // OneNote section tab color
  order: number;
}

export interface Notebook {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  order: number;
}

export interface NotesWorkspace {
  notebooks: Notebook[];
  sections: NoteSection[];
  notes: NoteItem[];
  activeNotebookId: string;
  activeSectionId: string;
  activeNoteId: string | null;
  expandedNodeIds: string[];
  lastSaved: string;
}

export type EditorViewMode = 'split' | 'edit' | 'preview';
export type NotesViewMode = 'tree' | 'sticky';

export interface NoteFilterState {
  searchQuery: string;
  selectedTag: string | null;
  pinnedOnly: boolean;
  colorFilter: string | null;
}
