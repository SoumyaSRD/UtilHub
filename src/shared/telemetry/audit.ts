// Enterprise Audit Trail Service
export type AuditAction =
  | 'TOOL_EXECUTED'
  | 'TOOL_EXPORTED'
  | 'ROLE_CHANGED'
  | 'FEATURE_FLAG_TOGGLED'
  | 'THEME_CHANGED'
  | 'CONFIGURATION_SAVED'
  | 'PERMISSION_DENIED';

export interface AuditRecord {
  id: string;
  timestamp: string;
  action: AuditAction;
  actor: string;
  targetId: string;
  details?: Record<string, unknown>;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
}

const AUDIT_STORAGE_KEY = 'utilityhub_audit_records';

class AuditService {
  private records: AuditRecord[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (stored) {
        this.records = JSON.parse(stored);
      }
    } catch {
      this.records = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(this.records.slice(0, 500)));
    } catch {
      // Storage quota exceeded or disabled
    }
  }

  public record(
    action: AuditAction,
    actor: string,
    targetId: string,
    details?: Record<string, unknown>,
    status: 'SUCCESS' | 'FAILURE' | 'WARNING' = 'SUCCESS'
  ): AuditRecord {
    const record: AuditRecord = {
      id: 'aud_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      action,
      actor,
      targetId,
      details,
      status,
    };

    this.records.unshift(record);
    if (this.records.length > 500) {
      this.records.pop();
    }
    this.saveToStorage();
    return record;
  }

  public getRecords(): AuditRecord[] {
    return [...this.records];
  }

  public clear() {
    this.records = [];
    localStorage.removeItem(AUDIT_STORAGE_KEY);
  }
}

export const auditService = new AuditService();
