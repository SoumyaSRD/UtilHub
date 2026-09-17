import type { StudioFile } from '../types';

const DB_NAME = 'HelperStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'files';
const LEGACY_STORAGE_KEY = 'helper_studio_files_v1';

class StudioStorage {
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private saveTimeout: any = null;
  private statusListeners: Set<(status: 'saved' | 'saving' | 'unsaved') => void> = new Set();
  public currentStatus: 'saved' | 'saving' | 'unsaved' = 'saved';

  constructor() {
    this.initDb();
  }

  public subscribeStatus(listener: (status: 'saved' | 'saving' | 'unsaved') => void): () => void {
    this.statusListeners.add(listener);
    listener(this.currentStatus);
    return () => this.statusListeners.delete(listener);
  }

  private setStatus(status: 'saved' | 'saving' | 'unsaved') {
    this.currentStatus = status;
    this.statusListeners.forEach((fn) => fn(status));
  }

  private initDb(): Promise<IDBDatabase | null> {
    if (this.dbPromise) return this.dbPromise;
    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.resolve(null);
    }

    this.dbPromise = new Promise((resolve) => {
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
          console.warn('[StudioStorage] IndexedDB open error, using localStorage fallback');
          resolve(null);
        };
      } catch (err) {
        console.warn('[StudioStorage] IndexedDB not available:', err);
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  /**
   * Load all files from storage (first tries IndexedDB, then migrates localStorage)
   */
  public async loadFiles(defaultFiles: StudioFile[]): Promise<StudioFile[]> {
    const db = await this.initDb();
    if (db) {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        const dbFiles: StudioFile[] = await new Promise((resolve, reject) => {
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => reject(req.error);
        });

        if (Array.isArray(dbFiles) && dbFiles.length > 0) {
          this.setStatus('saved');
          return dbFiles;
        }
      } catch (err) {
        console.warn('[StudioStorage] Error reading from IndexedDB:', err);
      }
    }

    // Check localStorage fallback / legacy migration
    try {
      const saved = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // migrate to indexedDB in background
          if (db) {
            this.saveFilesImmediate(parsed).catch(console.error);
          }
          this.setStatus('saved');
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    this.setStatus('saved');
    return defaultFiles;
  }

  /**
   * Immediate non-blocking save
   */
  public async saveFilesImmediate(files: StudioFile[]): Promise<void> {
    this.setStatus('saving');
    const db = await this.initDb();

    if (db) {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        // Clear and rewrite current files
        store.clear();
        files.forEach((f) => store.put(f));

        await new Promise<void>((resolve, reject) => {
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });

        this.setStatus('saved');
        return;
      } catch (err) {
        console.warn('[StudioStorage] Error saving to IndexedDB:', err);
      }
    }

    // Fallback: save metadata & lightweight copy to localStorage without freezing
    try {
      // Keep content within safe limits in localStorage
      const safeFiles = files.map((f) => {
        if (typeof f.content === 'string' && f.content.length > 200000) {
          return { ...f, content: f.content.substring(0, 200000) };
        }
        return f;
      });
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(safeFiles));
    } catch (e) {
      console.warn('[StudioStorage] localStorage fallback quota exceeded:', e);
    }
    this.setStatus('saved');
  }

  /**
   * Debounced save to prevent excessive disk/CPU operations during keystrokes
   */
  public saveFilesDebounced(files: StudioFile[], delayMs = 600) {
    this.setStatus('unsaved');
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveFilesImmediate(files);
    }, delayMs);
  }
}

export const studioStorage = new StudioStorage();
