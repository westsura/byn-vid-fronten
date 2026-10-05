// Interface text from data/text/en.json. t('log.moveOrder', { unit }) looks up a
// dotted key and fills in {placeholders}. Before the text is loaded (headless
// tests) the key itself is returned, so logic never depends on the wording.
let texts = {};

export function setText(t) {
  texts = t || {};
}

export function t(key, params = {}) {
  const v = key.split('.').reduce((o, k) => o?.[k], texts);
  if (typeof v !== 'string') return v ?? key;
  return v.replace(/\{(\w+)\}/g, (_, k) => (params[k] ?? `{${k}}`));
}
