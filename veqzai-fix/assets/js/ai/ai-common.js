/* VEQZAI AI Hub — shared helpers.
 * Everything in the AI Hub runs in the browser. No text typed into these tools is sent anywhere
 * unless you explicitly configure an assistant endpoint (see ai-assistant.js).
 */
(function () {
  'use strict';

  var AI = (window.VeqzaiAI = window.VeqzaiAI || {});

  // Optional runtime config. Set window.VEQZAI_AI_CONFIG before this script to override.
  window.VEQZAI_AI_CONFIG = Object.assign(
    {
      // URL of a server-side proxy that calls an LLM for the support assistant.
      // Never put an API key in this site's front-end code; keep it on the server.
      assistantEndpoint: null
    },
    window.VEQZAI_AI_CONFIG || {}
  );

  AI.escapeHtml = function (s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  AI.clamp = function (n, lo, hi) {
    return Math.min(hi, Math.max(lo, n));
  };

  // Small deterministic RNG so the demo player pool is the same on every load.
  AI.mulberry32 = function (seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  AI.$ = function (sel, root) {
    return (root || document).querySelector(sel);
  };
  AI.$$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };
})();
