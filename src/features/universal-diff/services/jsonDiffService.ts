export type DiffChangeType = 'ADDED' | 'REMOVED' | 'MODIFIED' | 'TYPE_CHANGED';

export interface JsonDiffEntry {
  path: string;
  type: DiffChangeType;
  leftValue?: unknown;
  rightValue?: unknown;
}

export interface JsonDiffSummary {
  entries: JsonDiffEntry[];
  addedCount: number;
  removedCount: number;
  modifiedCount: number;
  typeChangedCount: number;
  unchangedCount: number;
  isIdentical: boolean;
}

export function sortJsonKeys(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sortJsonKeys);
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  return keys.reduce<Record<string, unknown>>((acc, key) => {
    acc[key] = sortJsonKeys((obj as Record<string, unknown>)[key]);
    return acc;
  }, {});
}

export function compareJsonObjects(
  left: unknown,
  right: unknown,
  currentPath = ''
): JsonDiffEntry[] {
  const diffs: JsonDiffEntry[] = [];

  // Primitive equality
  if (left === right) {
    return diffs;
  }

  // Type mismatch
  if (typeof left !== typeof right || Array.isArray(left) !== Array.isArray(right)) {
    diffs.push({
      path: currentPath || 'root',
      type: 'TYPE_CHANGED',
      leftValue: left,
      rightValue: right,
    });
    return diffs;
  }

  // Handle nulls
  if (left === null || right === null) {
    if (left !== right) {
      diffs.push({
        path: currentPath || 'root',
        type: 'MODIFIED',
        leftValue: left,
        rightValue: right,
      });
    }
    return diffs;
  }

  // Handle arrays
  if (Array.isArray(left) && Array.isArray(right)) {
    const maxLen = Math.max(left.length, right.length);
    for (let i = 0; i < maxLen; i++) {
      const itemPath = currentPath ? `${currentPath}[${i}]` : `[${i}]`;
      if (i >= left.length) {
        diffs.push({ path: itemPath, type: 'ADDED', rightValue: right[i] });
      } else if (i >= right.length) {
        diffs.push({ path: itemPath, type: 'REMOVED', leftValue: left[i] });
      } else {
        diffs.push(...compareJsonObjects(left[i], right[i], itemPath));
      }
    }
    return diffs;
  }

  // Handle objects
  if (typeof left === 'object' && typeof right === 'object') {
    const leftObj = left as Record<string, unknown>;
    const rightObj = right as Record<string, unknown>;
    const allKeys = Array.from(new Set([...Object.keys(leftObj), ...Object.keys(rightObj)]));

    allKeys.forEach((key) => {
      const keyPath = currentPath ? `${currentPath}.${key}` : key;
      const hasLeft = Object.prototype.hasOwnProperty.call(leftObj, key);
      const hasRight = Object.prototype.hasOwnProperty.call(rightObj, key);

      if (!hasLeft && hasRight) {
        diffs.push({ path: keyPath, type: 'ADDED', rightValue: rightObj[key] });
      } else if (hasLeft && !hasRight) {
        diffs.push({ path: keyPath, type: 'REMOVED', leftValue: leftObj[key] });
      } else {
        diffs.push(...compareJsonObjects(leftObj[key], rightObj[key], keyPath));
      }
    });

    return diffs;
  }

  // Different primitives
  diffs.push({
    path: currentPath || 'root',
    type: 'MODIFIED',
    leftValue: left,
    rightValue: right,
  });

  return diffs;
}

export function computeJsonDiff(
  jsonStrA: string,
  jsonStrB: string,
  sortKeysFirst = true
): JsonDiffSummary {
  let parsedA = JSON.parse(jsonStrA);
  let parsedB = JSON.parse(jsonStrB);

  if (sortKeysFirst) {
    parsedA = sortJsonKeys(parsedA);
    parsedB = sortJsonKeys(parsedB);
  }

  const entries = compareJsonObjects(parsedA, parsedB);

  const addedCount = entries.filter((e) => e.type === 'ADDED').length;
  const removedCount = entries.filter((e) => e.type === 'REMOVED').length;
  const modifiedCount = entries.filter((e) => e.type === 'MODIFIED').length;
  const typeChangedCount = entries.filter((e) => e.type === 'TYPE_CHANGED').length;

  return {
    entries,
    addedCount,
    removedCount,
    modifiedCount,
    typeChangedCount,
    unchangedCount: 0,
    isIdentical: entries.length === 0,
  };
}
