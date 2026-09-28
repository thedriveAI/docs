#!/usr/bin/env node
// Docs truth lint. Zero dependencies, Node >= 18.
//
//   node scripts/lint.mjs
//
// Applies scripts/lint-rules.json to the pages listed in docs.json navigation.
// Prints one line per violation as `file:line rule message`, then a summary,
// and exits 1 if anything failed. The backend re-implements these checks from
// the same JSON (agent:sync-docs refuses to snapshot a tree that fails them),
// so keep the semantics here and there in step.
//
// Checks:
//   nav-missing        every navigation page resolves to <page>.mdx or <page>.md
//   frontmatter        every page has a non-empty `title` and `description`
//   retired:<id>       no line of a page body matches a retired pattern
//                      (unless the page is listed in that rule's allowIn)
//   required-page      every requiredPages entry is in the navigation
//   generated-header   every file in generatedDir carries generatedHeader in
//                      its first 3 lines
//   broken-link        internal links `](/path)` and `href="/path"` resolve to a
//                      navigation page or an existing file
//   redirect           redirect sources are not live pages; destinations resolve
//
// Navigation entries of the form "METHOD /path" (for example
// "POST /api/v1/extract") are OpenAPI operations rendered from openapi.json,
// not files, and are skipped by the file checks.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OPENAPI_ENTRY = /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+\//i;
const PAGE_EXTS = ['.mdx', '.md'];

const violations = [];
const report = (file, line, rule, message) => violations.push({ file, line, rule, message });

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    console.error(`${relative(ROOT, path)}:1 config ${err.message}`);
    process.exit(1);
  }
}

const rules = readJson(join(ROOT, 'scripts', 'lint-rules.json'));
const docs = readJson(join(ROOT, 'docs.json'));

// ---- navigation --------------------------------------------------------------

/** Every string under a `pages` array anywhere in the navigation, in order. */
function collectNavPages(node, out = []) {
  if (Array.isArray(node)) {
    for (const item of node) collectNavPages(item, out);
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === 'pages' && Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === 'string') out.push(item);
          else collectNavPages(item, out);
        }
      } else if (value && typeof value === 'object') {
        collectNavPages(value, out);
      }
    }
  }
  return out;
}

const navEntries = collectNavPages(docs.navigation ?? {});
const navPages = navEntries.filter((p) => !OPENAPI_ENTRY.test(p)).map(normalizePage);
const navSet = new Set(navPages);

function normalizePage(p) {
  return p.replace(/^\/+/, '').replace(/\.(mdx|md)$/, '').replace(/\/+$/, '');
}

function pageFile(page) {
  for (const ext of PAGE_EXTS) {
    const candidate = join(ROOT, page + ext);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

// ---- frontmatter -------------------------------------------------------------

/** Returns { data, bodyStartLine, lines } where bodyStartLine is 0-based. */
function splitFrontmatter(text) {
  const lines = text.split(/\r?\n/);
  if (lines[0]?.trim() !== '---') return { data: null, bodyStart: 0, lines };
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
  if (end === -1) return { data: null, bodyStart: 0, lines };
  const data = {};
  for (const line of lines.slice(1, end)) {
    const m = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
    if (!m) continue;
    let value = m[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    data[m[1]] = value.trim();
  }
  return { data, bodyStart: end + 1, lines };
}

// ---- links -------------------------------------------------------------------

const LINK_PATTERNS = [/\]\((\/[^)\s]*)\)/g, /href\s*=\s*["'](\/[^"']*)["']/g];
const IGNORED_LINK_PREFIXES = ['/images/', '/logo/'];

function linkResolves(raw) {
  const path = raw.split('#')[0].split('?')[0];
  if (path === '' || path === '/') return true;
  if (IGNORED_LINK_PREFIXES.some((p) => path.startsWith(p))) return true;
  const page = normalizePage(path);
  if (navSet.has(page)) return true;
  const direct = join(ROOT, path);
  if (existsSync(direct) && statSync(direct).isFile()) return true;
  return false;
}

// ---- retired rules -----------------------------------------------------------

const retired = (rules.retired ?? []).map((r) => {
  let regex;
  try {
    regex = new RegExp(r.pattern, r.flags ?? '');
  } catch (err) {
    report('scripts/lint-rules.json', 1, `retired:${r.id}`, `invalid pattern: ${err.message}`);
    return null;
  }
  return { ...r, regex, allow: new Set((r.allowIn ?? []).map(normalizePage)) };
}).filter(Boolean);

// ---- checks ------------------------------------------------------------------

const seen = new Set();
for (const page of navPages) {
  if (seen.has(page)) continue;
  seen.add(page);
  const file = pageFile(page);
  if (!file) {
    report('docs.json', 1, 'nav-missing', `navigation page "${page}" has no ${page}.mdx or ${page}.md`);
    continue;
  }
  const rel = relative(ROOT, file);
  const { data, bodyStart, lines } = splitFrontmatter(readFileSync(file, 'utf8'));
  if (!data) {
    report(rel, 1, 'frontmatter', 'missing frontmatter (--- title/description ---)');
  } else {
    if (!data.title) report(rel, 1, 'frontmatter', 'frontmatter has no non-empty title');
    if (!data.description) report(rel, 1, 'frontmatter', 'frontmatter has no non-empty description');
  }

  for (let i = bodyStart; i < lines.length; i++) {
    const line = lines[i];
    for (const r of retired) {
      if (r.allow.has(page)) continue;
      r.regex.lastIndex = 0;
      const m = r.regex.exec(line);
      if (m) {
        const instead = r.instead ? ` Use: ${r.instead}.` : '';
        report(rel, i + 1, `retired:${r.id}`, `"${m[0]}" — ${r.why}${instead}`);
      }
    }
    for (const pattern of LINK_PATTERNS) {
      pattern.lastIndex = 0;
      let m;
      while ((m = pattern.exec(line))) {
        if (!linkResolves(m[1])) {
          report(rel, i + 1, 'broken-link', `internal link "${m[1]}" is not a navigation page or an existing file`);
        }
      }
    }
  }
}

for (const required of rules.requiredPages ?? []) {
  if (!navSet.has(normalizePage(required))) {
    report('docs.json', 1, 'required-page', `required page "${required}" is not in the navigation`);
  }
}

if (rules.generatedDir && rules.generatedHeader) {
  const dir = join(ROOT, rules.generatedDir);
  if (existsSync(dir)) {
    for (const name of readdirSync(dir)) {
      const file = join(dir, name);
      if (!statSync(file).isFile()) continue;
      const head = readFileSync(file, 'utf8').split(/\r?\n/).slice(0, 3);
      if (!head.some((l) => l.includes(rules.generatedHeader))) {
        report(relative(ROOT, file), 1, 'generated-header', `generated file must carry "${rules.generatedHeader}" in its first 3 lines`);
      }
    }
  }
}

for (const r of docs.redirects ?? []) {
  const source = normalizePage(r.source ?? '');
  if (navSet.has(source)) {
    report('docs.json', 1, 'redirect', `redirect source "${r.source}" is still a navigation page`);
  }
  if (!linkResolves(r.destination ?? '')) {
    report('docs.json', 1, 'redirect', `redirect destination "${r.destination}" is not a navigation page`);
  }
}

// ---- output ------------------------------------------------------------------

for (const v of violations) console.log(`${v.file}:${v.line} ${v.rule} ${v.message}`);
if (violations.length) {
  const files = new Set(violations.map((v) => v.file)).size;
  console.log(`\n${violations.length} violation(s) in ${files} file(s); ${seen.size} page(s) checked.`);
  process.exit(1);
}
console.log(`docs lint: OK — ${seen.size} page(s) checked, ${retired.length} retired rule(s), ${(rules.requiredPages ?? []).length} required page(s).`);
