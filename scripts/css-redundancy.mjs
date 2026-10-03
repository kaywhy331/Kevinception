import fs from 'node:fs';
import { gzipSync } from 'node:zlib';
import postcss from 'postcss';

// Diagnostic only: lists exact redundancy in a stylesheet (read-only) and what removing
// it might save in gzip bytes. Findings need cascade and browser review before edits.
// Usage: node scripts/css-redundancy.mjs <file.css> [more.css ...]

const gz = (text) => gzipSync(text).length;

// Cross-file pass: the files are treated as one stylesheet in argument order (the import
// order in app/layout.tsx). Candidate redundancy: the same selector/context/importance
// later redeclares the same property. This is not proof of equivalence: unsupported
// values, intentional fallbacks, custom properties and shorthand interactions need review.
{
  const seen = new Map();
  const dead = [];
  let order = 0;
  for (const file of process.argv.slice(2)) {
    const root = postcss.parse(fs.readFileSync(file, 'utf8'));
    root.walkRules((rule) => {
      if (rule.parent?.type === 'atrule' && /keyframes/.test(rule.parent.name)) return;
      const parts = [];
      for (let parent = rule.parent; parent && parent.type !== 'root'; parent = parent.parent) parts.unshift(`@${parent.name} ${parent.params}`);
      const selector = rule.selector.replace(/\s+/g, ' ');
      rule.each((child) => {
        if (child.type !== 'decl') return;
        const key = `${parts.join(' > ')}|${selector}|${child.prop}|${child.important ? '!' : ''}`;
        const here = { file, line: child.source.start.line, value: child.value, order: order++ };
        if (seen.has(key)) dead.push({ key, earlier: seen.get(key), later: here });
        seen.set(key, here);
      });
    });
  }
  console.log(`# cross-file redundancy candidates (same context+selector+prop+importance redeclared later): ${dead.length}`);
  for (const item of dead) {
    const [context, selector, prop] = item.key.split('|');
    const same = item.earlier.value === item.later.value ? 'SAME-VALUE' : 'diff-value';
    console.log(`  ${same} ${context || '-'} ${selector} ${prop}: ${item.earlier.file}:${item.earlier.line} ${item.earlier.value} -> ${item.later.file}:${item.later.line} ${item.later.value}`);
  }
}

for (const file of process.argv.slice(2)) {
  const source = fs.readFileSync(file, 'utf8');
  const root = postcss.parse(source);
  const context = (node) => {
    const parts = [];
    for (let parent = node.parent; parent && parent.type !== 'root'; parent = parent.parent) parts.unshift(`@${parent.name} ${parent.params}`);
    return parts.join(' > ');
  };

  const sameDecl = [];
  const repeatedRules = new Map();
  root.walkRules((rule) => {
    const seen = new Map();
    rule.each((child) => {
      if (child.type !== 'decl') return;
      const key = child.prop;
      if (seen.has(key)) sameDecl.push({ selector: rule.selector, prop: key, context: context(rule), first: seen.get(key), second: `${child.value}${child.important ? '!important' : ''}` });
      seen.set(key, `${child.value}${child.important ? '!important' : ''}`);
    });
    const body = rule.nodes.map((n) => n.toString()).join(';');
    const key = `${context(rule)}|${rule.selector}|${body}`;
    repeatedRules.set(key, (repeatedRules.get(key) ?? 0) + 1);
  });

  const bySelector = new Map();
  root.walkRules((rule) => {
    const key = `${context(rule)}|${rule.selector}`;
    const list = bySelector.get(key) ?? [];
    list.push(rule);
    bySelector.set(key, list);
  });

  const dupRules = [...repeatedRules].filter(([, n]) => n > 1);
  const sameSelector = [...bySelector].filter(([, list]) => list.length > 1);
  console.log(`# ${file}: raw ${source.length}, gzip ${gz(source)}`);
  console.log(`  rules repeated verbatim: ${dupRules.length}; selectors declared more than once in one context: ${sameSelector.length}; props repeated within one rule: ${sameDecl.length}`);
  for (const item of sameDecl.slice(0, 40)) console.log(`  decl-repeat ${item.context} ${item.selector} { ${item.prop}: ${item.first} -> ${item.second} }`);
  for (const [key, n] of dupRules.slice(0, 40)) console.log(`  rule-repeat x${n} ${key.slice(0, 160)}`);
}
