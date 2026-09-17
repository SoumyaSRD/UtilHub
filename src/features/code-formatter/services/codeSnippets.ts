/**
 * Curated Code Practice Snippets & Challenges for TypeScript / JavaScript
 */

export interface CodeSnippet {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Algorithms' | 'Data Structures' | 'Async & Promises' | 'TypeScript Types' | 'Utility Functions';
  description: string;
  code: string;
}

export const CODE_CHALLENGE_SNIPPETS: CodeSnippet[] = [
  {
    id: 'two-sum',
    title: 'Two Sum (Hash Map)',
    difficulty: 'Easy',
    category: 'Algorithms',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.',
    code: `// Problem: Two Sum
// Find two numbers in nums that add up to target and return their indices [i, j].

function twoSum(nums: number[], target: number): [number, number] | null {
  const map = new Map<number, number>();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }

  return null;
}

// --- Test Cases ---
console.log('Test 1:', twoSum([2, 7, 11, 15], 9)); // Expected: [0, 1]
console.log('Test 2:', twoSum([3, 2, 4], 6));       // Expected: [1, 2]
console.log('Test 3:', twoSum([3, 3], 6));          // Expected: [0, 1]
`,
  },
  {
    id: 'deep-clone',
    title: 'Deep Clone with Circular References',
    difficulty: 'Medium',
    category: 'Utility Functions',
    description: 'Create a deep clone function in TypeScript that handles nested objects, arrays, dates, and circular references cleanly.',
    code: `// Problem: Deep Clone Object with Circular References

function deepClone<T>(value: T, seen = new WeakMap<object, any>()): T {
  // Primitives and functions
  if (value === null || typeof value !== 'object') {
    return value;
  }

  // Handle Date
  if (value instanceof Date) {
    return new Date(value.getTime()) as any;
  }

  // Handle circular reference
  if (seen.has(value as object)) {
    return seen.get(value as object);
  }

  // Handle Arrays
  if (Array.isArray(value)) {
    const copy: any[] = [];
    seen.set(value, copy);
    for (let i = 0; i < value.length; i++) {
      copy[i] = deepClone(value[i], seen);
    }
    return copy as any;
  }

  // Handle Objects
  const copy: Record<string, any> = {};
  seen.set(value as object, copy);

  for (const [key, val] of Object.entries(value)) {
    copy[key] = deepClone(val, seen);
  }

  return copy as T;
}

// --- Test Cases ---
const original: any = {
  name: 'Antigravity Suite',
  specs: { cpu: 8, ram: '32GB' },
  createdAt: new Date(),
};
original.self = original; // circular reference!

const cloned = deepClone(original);
console.log('Original Name:', original.name);
console.log('Cloned Name:', cloned.name);
console.log('Cloned Specs Ram:', cloned.specs.ram);
console.log('Is Deep Reference Differing?', original.specs !== cloned.specs);
console.log('Circular Check:', cloned.self === cloned);
`,
  },
  {
    id: 'lru-cache',
    title: 'LRU Cache (Least Recently Used)',
    difficulty: 'Medium',
    category: 'Data Structures',
    description: 'Implement an LRU Cache with get and put operations in O(1) time complexity using Map.',
    code: `// Problem: LRU Cache
// Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

interface ILRUCache<K, V> {
  get(key: K): V | -1;
  put(key: K, value: V): void;
}

class LRUCache<K, V> implements ILRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map<K, V>();
  }

  get(key: K): V | -1 {
    if (!this.cache.has(key)) return -1;
    // Re-insert to mark as recently used
    const val = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Delete least recently used (first key in map iterator)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, value);
  }
}

// --- Test Cases ---
const lru = new LRUCache<number, string>(2);
lru.put(1, 'One');
lru.put(2, 'Two');
console.log('get(1):', lru.get(1)); // returns 'One'
lru.put(3, 'Three');                 // evicts key 2
console.log('get(2):', lru.get(2)); // returns -1 (not found)
lru.put(4, 'Four');                  // evicts key 1
console.log('get(1):', lru.get(1)); // returns -1 (not found)
console.log('get(3):', lru.get(3)); // returns 'Three'
console.log('get(4):', lru.get(4)); // returns 'Four'
`,
  },
  {
    id: 'async-concurrency',
    title: 'Async Task Concurrency Pool',
    difficulty: 'Hard',
    category: 'Async & Promises',
    description: 'Execute an array of async tasks with a maximum concurrency limit (e.g. 3 tasks at a time) and return results in order.',
    code: `// Problem: Async Concurrency Limiter Pool
// Run tasks with limited concurrency, capturing results in original order.

async function asyncPool<T>(
  concurrency: number,
  tasks: Array<() => Promise<T>>
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let currentIndex = 0;

  async function worker(workerId: number): Promise<void> {
    while (currentIndex < tasks.length) {
      const idx = currentIndex++;
      console.log(\`[Worker \${workerId}] Starting task #\${idx}\`);
      results[idx] = await tasks[idx]();
      console.log(\`[Worker \${workerId}] Completed task #\${idx}\`);
    }
  }

  // Spawn pool of workers up to concurrency limit
  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, (_, i) =>
    worker(i + 1)
  );

  await Promise.all(workers);
  return results;
}

// --- Test Cases ---
const delay = (ms: number, val: string) => () =>
  new Promise<string>((resolve) => setTimeout(() => resolve(val), ms));

const taskList = [
  delay(120, 'Task 1 (120ms)'),
  delay(50, 'Task 2 (50ms)'),
  delay(90, 'Task 3 (90ms)'),
  delay(30, 'Task 4 (30ms)'),
  delay(70, 'Task 5 (70ms)'),
];

console.log('Running 5 tasks with concurrency = 2:');
const output = await asyncPool(2, taskList);
console.log('All completed in order:', output);
`,
  },
  {
    id: 'debounce-throttle',
    title: 'Custom Debounce & Throttle',
    difficulty: 'Medium',
    category: 'Utility Functions',
    description: 'Implement typed debounce and throttle utility functions in TypeScript with cancel options.',
    code: `// Problem: Debounce and Throttle Implementation

function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timer: any = null;

  const debounced = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delayMs);
  };

  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  return debounced;
}

function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let lastRan = 0;
  let timer: any = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRan >= limitMs) {
      fn(...args);
      lastRan = now;
    } else if (!timer) {
      timer = setTimeout(() => {
        fn(...args);
        lastRan = Date.now();
        timer = null;
      }, limitMs - (now - lastRan));
    }
  };
}

// --- Test Cases ---
let count = 0;
const increment = debounce((amount: number) => {
  count += amount;
  console.log('Debounced count:', count);
}, 50);

increment(1);
increment(2);
increment(5); // Only this one should trigger after 50ms with +5

console.log('Dispatched 3 rapid calls. Waiting for debounce...');
await new Promise((r) => setTimeout(r, 80));
console.log('Final count:', count); // Expected: 5
`,
  },
  {
    id: 'flatten-array',
    title: 'Recursive Array Flatten (Any Depth)',
    difficulty: 'Easy',
    category: 'Algorithms',
    description: 'Flatten a nested array of arbitrary depth into a single flat array without using Array.prototype.flat.',
    code: `// Problem: Flatten Array of Arbitrary Depth

type NestedArray<T> = Array<T | NestedArray<T>>;

function customFlat<T>(arr: NestedArray<T>, depth: number = Infinity): T[] {
  const result: T[] = [];

  function helper(current: NestedArray<T>, currentDepth: number) {
    for (const item of current) {
      if (Array.isArray(item) && currentDepth > 0) {
        helper(item, currentDepth - 1);
      } else {
        result.push(item as T);
      }
    }
  }

  helper(arr, depth);
  return result;
}

// --- Test Cases ---
const nested = [1, [2, [3, [4, 5]]], 6, [[7]]];
console.log('Flat (Infinity):', customFlat(nested));      // [1, 2, 3, 4, 5, 6, 7]
console.log('Flat (Depth 1):', customFlat(nested, 1));    // [1, 2, [3, [4, 5]], 6, [7]]
console.log('Flat (Depth 2):', customFlat(nested, 2));    // [1, 2, 3, [4, 5], 6, 7]
`,
  },
  {
    id: 'ts-type-gymnastics',
    title: 'TypeScript Type Gymnastics',
    difficulty: 'Hard',
    category: 'TypeScript Types',
    description: 'Advanced TypeScript type utilities: DeepReadonly, PickByType, and Promisify.',
    code: `// Advanced TypeScript Type Gymnastics

type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends Function
    ? T[K]
    : T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K];
};

type PickByType<T, ValueType> = {
  [K in keyof T as T[K] extends ValueType ? K : never]: T[K];
};

interface UserRecord {
  id: number;
  name: string;
  age: number;
  isActive: boolean;
  profile: {
    avatarUrl: string;
    bio: string;
    stats: {
      followers: number;
    };
  };
}

// Extract only number properties:
type NumberPropsOnly = PickByType<UserRecord, number>;

// Fully immutable record:
type ImmutableUser = DeepReadonly<UserRecord>;

// Runtime demonstration
const user: ImmutableUser = {
  id: 101,
  name: 'TypeScript Wizard',
  age: 28,
  isActive: true,
  profile: {
    avatarUrl: 'https://example.com/avatar.png',
    bio: 'Types all the way down',
    stats: {
      followers: 1250,
    },
  },
};

console.log('User ID:', user.id);
console.log('Followers:', user.profile.stats.followers);
console.log('PickByType resolved properly!');
`,
  },
];
