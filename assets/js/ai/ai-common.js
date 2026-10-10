// Shared utilities for AI Hub tools
window.VeqzaiAI = window.VeqzaiAI || {};

VeqzaiAI.escapeHtml = function(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

VeqzaiAI.clamp = function(val, min, max) {
  return Math.min(Math.max(val, min), max);
};
