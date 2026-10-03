import fs from 'node:fs';
import postcss from 'postcss';

// Deterministic cascade-equivalence check for a CSS consolidation. Both sides are read as
// one ordered stylesheet. For every (at-rule context, single selector, property) it
// computes the winning declaration (important beats normal, then the last one wins; equal
// selectors have equal specificity), and fails if the winners differ between before and
// after. A declaration that is shadowed by a later one for the same selector is removed
// without changing these per-property winners; this is only a diagnostic model.
// Limit: it compares winners per selector, so it cannot see ordering against *different*
// selectors of equal specificity that match the same element; review moved declarations
// for that separately. It also does not model shorthand expansion, invalid/unsupported
// values or custom-property substitution. Use browser comparisons for acceptance.
// Usage: node scripts/css-cascade-equivalence.mjs <before.css ...> -- <after.css ...>

const args = process.argv.slice(2);
const split = args.indexOf('--');
if (split < 1 || split === args.length - 1) {
  console.error('Usage: css-cascade-equivalence.mjs <before.css ...> -- <after.css ...>');
  process.exit(2);
}

function winners(files) {
  const map = new Map();
  for (const file of files) {
    postcss.parse(fs.readFileSync(file, 'utf8')).walkRules((rule) => {
      const parts = [];
      for (let parent = rule.parent; parent && parent.type !== 'root'; parent = parent.parent) parts.unshift(`@${parent.name} ${parent.params}`);
      const context = parts.join(' > ');
      for (const selector of rule.selectors.map((item) => item.replace(/\s+/g, ' ').trim())) {
        rule.each((child) => {
          if (child.type !== 'decl') return;
          const key = `${context}|${selector}|${child.prop}`;
          const held = map.get(key);
          if (held?.important && !child.important) return;
          map.set(key, { value: child.value, important: child.important === true });
        });
      }
    });
  }
  return map;
}

const before = winners(args.slice(0, split));
const after = winners(args.slice(split + 1));
const differences = [];
for (const [key, a] of before) {
  const b = after.get(key);
  if (!b) differences.push(`removed  ${key} (was ${a.value}${a.important ? ' !important' : ''})`);
  else if (a.value !== b.value || a.important !== b.important) differences.push(`changed  ${key}: ${a.value}${a.important ? ' !important' : ''} -> ${b.value}${b.important ? ' !important' : ''}`);
}
for (const key of after.keys()) if (!before.has(key)) differences.push(`added    ${key}`);

console.log(`cascade winners: before ${before.size}, after ${after.size}, differences ${differences.length}`);
for (const line of differences) console.log(`  ${line}`);
process.exit(differences.length ? 1 : 0);
