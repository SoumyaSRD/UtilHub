/**
 * @file registry.js
 * @description Meta-programming Discovery Engine that registers utility modules,
 * analyzes their parameter schemas, and dynamically compiles structured system prompts
 * for Puter.js natural language understanding.
 */

import { antigravityUtil } from './antigravityUtil.js';

/**
 * Utility 2: Cryptographic String Encoder & Converter
 */
export const stringEncoderUtil = {
  meta: {
    id: 'string_encoder',
    name: 'String Encoder & Decoder',
    description: 'Encodes or decodes text using Base64, Hexadecimal, or URL encoding schemes.',
    triggers: ['encode', 'decode', 'base64', 'hex', 'urlencode', 'convert text'],
    parameters: {
      text: {
        type: 'string',
        default: 'Hello UtilityHub',
        description: 'The raw text to encode or decode.',
      },
      encoding: {
        type: 'string',
        enum: ['base64', 'hex', 'url'],
        default: 'base64',
        description: 'The target encoding scheme (base64, hex, or url).',
      },
      mode: {
        type: 'string',
        enum: ['encode', 'decode'],
        default: 'encode',
        description: 'Operation mode: "encode" to convert, or "decode" to restore.',
      },
    },
  },
  execute(params = {}) {
    const text = String(params.text ?? 'Hello UtilityHub');
    const encoding = String(params.encoding || 'base64').toLowerCase();
    const mode = String(params.mode || 'encode').toLowerCase();

    try {
      if (mode === 'encode') {
        if (encoding === 'base64') {
          return `🔏 Base64 Encoded Result: ${btoa(unescape(encodeURIComponent(text)))}`;
        } else if (encoding === 'hex') {
          const hex = Array.from(text)
            .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
            .join('');
          return `🔏 Hex Encoded Result: 0x${hex}`;
        } else if (encoding === 'url') {
          return `🔏 URL Encoded Result: ${encodeURIComponent(text)}`;
        }
      } else {
        if (encoding === 'base64') {
          return `🔓 Base64 Decoded Result: ${decodeURIComponent(escape(atob(text)))}`;
        } else if (encoding === 'hex') {
          const cleanHex = text.replace(/^0x/, '');
          let str = '';
          for (let i = 0; i < cleanHex.length; i += 2) {
            str += String.fromCharCode(parseInt(cleanHex.substr(i, 2), 16));
          }
          return `🔓 Hex Decoded Result: ${str}`;
        } else if (encoding === 'url') {
          return `🔓 URL Decoded Result: ${decodeURIComponent(text)}`;
        }
      }
      return `❌ Unsupported encoding scheme "${encoding}". Supported: base64, hex, url.`;
    } catch (err) {
      return `❌ String encoding error: ${err instanceof Error ? err.message : 'Invalid input format'}`;
    }
  },
};

/**
 * Utility 3: LocalStorage Sanitizer & Inspector
 */
export const localStorageCleanerUtil = {
  meta: {
    id: 'localstorage_cleaner',
    name: 'LocalStorage Sanitizer',
    description: 'Inspects, purges, or cleans browser local storage keys with optional prefix filtering.',
    triggers: ['clear storage', 'clean localstorage', 'purge cache', 'reset storage', 'inspect storage'],
    parameters: {
      keyPrefix: {
        type: 'string',
        default: '',
        description: 'Optional prefix to selectively target keys (e.g. "helper_", "user_"). Empty string targets all.',
      },
      actionType: {
        type: 'string',
        enum: ['purge', 'inspect', 'count'],
        default: 'inspect',
        description: '"inspect" to list stored keys, "purge" to delete, "count" for metrics.',
      },
    },
  },
  execute(params = {}) {
    if (typeof window === 'undefined' || !window.localStorage) {
      return 'Execution skipped: LocalStorage is not accessible.';
    }

    const prefix = String(params.keyPrefix || '').trim();
    const actionType = String(params.actionType || 'inspect').toLowerCase();

    const allKeys = Object.keys(window.localStorage);
    const targetKeys = prefix ? allKeys.filter((k) => k.startsWith(prefix)) : allKeys;

    if (actionType === 'purge') {
      targetKeys.forEach((k) => window.localStorage.removeItem(k));
      return `🧹 LocalStorage Sanitized: Removed ${targetKeys.length} key(s)${prefix ? ` matching prefix "${prefix}"` : ' from local storage'}.`;
    } else if (actionType === 'count') {
      return `📊 Storage Metrics: ${targetKeys.length} matching keys found out of ${allKeys.length} total keys.`;
    }

    // Default inspect
    const previewList = targetKeys.slice(0, 8).join(', ');
    return `🔍 LocalStorage Inspection: Found ${targetKeys.length} key(s)${prefix ? ` with prefix "${prefix}"` : ''}: [${previewList}${targetKeys.length > 8 ? '...' : ''}]`;
  },
};

/**
 * Utility 4: Audio-Visual Feedback & Haptic Ping
 */
export const pingNotificationUtil = {
  meta: {
    id: 'ping_notification',
    name: 'System Alert Ping',
    description: 'Triggers a visual toast or audio-frequency alert tone in the platform.',
    triggers: ['ping', 'beep', 'sound alert', 'notify', 'chime'],
    parameters: {
      message: {
        type: 'string',
        default: 'Operational command executed successfully',
        description: 'Alert message to display or chime.',
      },
      frequency: {
        type: 'number',
        default: 440,
        description: 'Sound frequency in Hertz for synthesizer alert (e.g. 440 = A4, 880 = high beep).',
      },
    },
  },
  execute(params = {}) {
    const msg = String(params.message || 'System ping triggered');
    const freq = Number(params.frequency) || 440;

    // Web Audio API tone synthesis
    if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } catch {
        // audio context blocked or unsupported
      }
    }

    return `🔔 System Ping: "${msg}" (${freq} Hz tone emitted)`;
  },
};

/**
 * Master Registry of all discoverable command modules
 */
export const registeredUtilities = [
  antigravityUtil,
  stringEncoderUtil,
  localStorageCleanerUtil,
  pingNotificationUtil,
];

/**
 * Discovery Engine: Generates the dynamic meta-programmed system prompt
 * by introspecting all registered modules and extracting their parameter schemas.
 *
 * @param {Array} [registry=registeredUtilities] - Array of registered utility objects
 * @returns {string} Compiled rigid system prompt for Puter.js
 */
export function generateSystemPromptFromRegistry(registry = registeredUtilities) {
  const toolsDocumentation = registry
    .map((mod, index) => {
      const { id, name, description, triggers, parameters } = mod.meta;
      const paramSchemaStr = JSON.stringify(parameters, null, 2);
      const triggersStr = triggers ? triggers.join(', ') : 'None';

      return `[TOOL ${index + 1}]:
- ID: "${id}"
- Name: "${name}"
- Description: ${description}
- Trigger Keywords: ${triggersStr}
- Parameters Schema:
${paramSchemaStr}`;
    })
    .join('\n\n');

  return `You are the Autonomous Command Router and Executive AI for the "React Utility Hub" platform.
Your sole responsibility is to evaluate natural language user requests, match them against registered platform tools, extract and cast arguments into strict parameter types, and reply ONLY with a valid, raw JSON payload.

Registered Platform Tools:
==================================================
${toolsDocumentation}
==================================================

CRITICAL INSTRUCTIONS & SCHEMA ENFORCEMENT:
1. You must output ONLY a valid JSON object. Do NOT wrap your response in markdown fences (no \`\`\`json or \`\`\`), and do NOT include any conversational preamble or conversational text outside the JSON.
2. If the user's intent matches any of the registered tools above, you MUST choose its exact "ID" as the "action", extract arguments from the user's prompt (applying default values if unspecified or out of range), and format the response as:
{
  "action": "EXACT_TOOL_ID",
  "parameters": {
    "paramName": value
  },
  "thought": "Brief explanation of how the user's intent was routed"
}

3. For the "antigravity" tool:
   - "intensity": convert user expressions (e.g. "80%", "max", "gentle", "80") into a number from 1 to 100 (default 50).
   - "duration": convert time expressions (e.g. "8 seconds", "8s", "half a minute") into seconds as a number (default 5).
   - "selector": if the user mentions "chatbox", "widget", "this window", or doesn't specify, use ".chatbot-container". If they mention "body", "page", or other elements, use a valid CSS selector.

4. If the user input is a general greeting, question, or does NOT match any registered tool, you MUST return:
{
  "action": "UNKNOWN",
  "reply": "Helpful, friendly response greeting the user or explaining available commands (e.g. Float the chatbox, Encode strings, Sanitize storage, or System ping).",
  "parameters": {}
}

Remember: Output ONLY the raw JSON object. Never return anything else.`;
}

export default registeredUtilities;
