/**
 * @file antigravityUtil.js
 * @description Physics simulation utility that applies zero-gravity lift and weightless
 * harmonic oscillation to target DOM elements.
 */

// Unique ID for injected keyframes stylesheet
const STYLE_TAG_ID = '__antigravity_physics_styles__';

/**
 * Injects required keyframes for weightless floating and settling into document head
 */
function ensureKeyframeStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_TAG_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_TAG_ID;
  style.textContent = `
    @keyframes antigravity-float-bob {
      0% {
        transform: translateY(var(--ag-lift-negative)) rotate(0deg);
      }
      25% {
        transform: translateY(calc(var(--ag-lift-negative) - 10px)) rotate(-1.5deg);
      }
      50% {
        transform: translateY(calc(var(--ag-lift-negative) + 6px)) rotate(1.2deg);
      }
      75% {
        transform: translateY(calc(var(--ag-lift-negative) - 8px)) rotate(-0.8deg);
      }
      100% {
        transform: translateY(var(--ag-lift-negative)) rotate(0deg);
      }
    }

    .antigravity-active {
      transition: transform 0.85s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.85s ease !important;
      box-shadow: 0 28px 60px rgba(99, 102, 241, 0.35), 0 0 40px rgba(56, 189, 248, 0.25) !important;
      will-change: transform, box-shadow;
      z-index: 9999 !important;
    }

    .antigravity-floating {
      animation: antigravity-float-bob 2.8s ease-in-out infinite !important;
    }

    .antigravity-settling {
      transition: transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 1.2s ease !important;
      transform: translateY(0) rotate(0deg) !important;
    }
  `;
  document.head.appendChild(style);
}

export const antigravityUtil = {
  meta: {
    id: 'antigravity',
    name: 'Antigravity Physics Simulator',
    description:
      'Simulates zero-gravity physics on DOM elements with dynamic elevation, weightless harmonic bobbing, and gentle gravitational settling.',
    triggers: ['float', 'lift', 'zero-g', 'fly', 'levitate', 'antigravity', 'weightless', 'hover'],
    parameters: {
      intensity: {
        type: 'number',
        min: 1,
        max: 100,
        default: 50,
        description: 'Percentage strength of the antigravity lift (1 to 100). Higher values elevate further.',
      },
      duration: {
        type: 'number',
        default: 5,
        description: 'Duration of the zero-gravity suspension in seconds before descending.',
      },
      selector: {
        type: 'string',
        default: '.chatbot-container',
        description: 'CSS selector of the target DOM element to suspend weightlessly.',
      },
    },
  },

  /**
   * Executes the antigravity physics effect on target elements
   * @param {Object} params
   * @param {number} [params.intensity=50] - 1 to 100
   * @param {number} [params.duration=5] - Seconds
   * @param {string} [params.selector='.chatbot-container'] - Target selector
   * @returns {string} Detailed result message
   */
  execute(params = {}) {
    if (typeof document === 'undefined') {
      return 'Execution skipped: Running in non-browser environment.';
    }

    ensureKeyframeStyles();

    // Sanitize & normalize parameters
    const intensity = Math.min(100, Math.max(1, Number(params.intensity) || 50));
    const duration = Math.max(1, Number(params.duration) || 5);
    const selector = params.selector && typeof params.selector === 'string'
      ? params.selector.trim()
      : '.chatbot-container';

    // Locate targets with fallback
    let elements = document.querySelectorAll(selector);
    if (!elements || elements.length === 0) {
      // Fallback to chatbot container or body child
      elements = document.querySelectorAll('.chatbot-container');
    }

    if (!elements || elements.length === 0) {
      return `⚠️ Target element '${selector}' was not found in the active DOM tree.`;
    }

    // Calculate dynamic lift distance (30px at 1% -> 180px at 100%)
    const liftPx = Math.round(30 + (intensity / 100) * 150);
    const durationMs = duration * 1000;

    elements.forEach((el) => {
      // Store original inline properties to restore later
      const originalTransform = el.style.transform || '';
      const originalTransition = el.style.transition || '';
      const originalBoxShadow = el.style.boxShadow || '';

      // Set CSS variable for keyframe animation
      el.style.setProperty('--ag-lift-negative', `-${liftPx}px`);

      // 1. Ascend phase (Lift up smoothly)
      el.classList.remove('antigravity-settling');
      el.classList.add('antigravity-active');
      el.style.transform = `translateY(-${liftPx}px) rotate(-1deg)`;

      // 2. Start weightless floating bob after initial lift animation completes
      const bobTimer = setTimeout(() => {
        el.classList.add('antigravity-floating');
      }, 850);

      // 3. Descend phase (Settle back to original state)
      const settleTimer = setTimeout(() => {
        el.classList.remove('antigravity-floating');
        el.classList.add('antigravity-settling');
        el.style.transform = originalTransform || 'translateY(0) rotate(0deg)';

        // Cleanup classes after settling transition finishes
        setTimeout(() => {
          el.classList.remove('antigravity-active', 'antigravity-settling');
          el.style.transform = originalTransform;
          el.style.transition = originalTransition;
          el.style.boxShadow = originalBoxShadow;
          el.style.removeProperty('--ag-lift-negative');
        }, 1200);
      }, durationMs);

      // Save timers on element in case of re-triggering before completion
      if (el.__ag_timers) {
        clearTimeout(el.__ag_timers.bob);
        clearTimeout(el.__ag_timers.settle);
      }
      el.__ag_timers = { bob: bobTimer, settle: settleTimer };
    });

    return `🚀 Zero-G Physics Activated: Suspended ${elements.length} element(s) matching '${selector}' at ${intensity}% intensity (-${liftPx}px) for ${duration}s.`;
  },
};

export default antigravityUtil;
