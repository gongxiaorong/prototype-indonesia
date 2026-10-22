#!/usr/bin/env node
/**
 * i18n 翻译对照表生成器（零依赖）
 *
 * 扫描 locales/<目录>/ → 按「对照表分组」产出 <分组名>-translation-reference.html（写到仓库根目录）。
 * 分组口径：rent 两端（rent-user + rent-merchant）合并为一张 rent 对照表，swap 单独一张。
 * 模板与运行时分别来自同目录下的 i18n_reference_page.html / i18n_reference_app.js，本脚本只做占位符注入。
 *
 * 设计口径：
 * - 词条不内联：页面运行时 fetch `locales/<目录>/<语言>.json`，故需 http(s) 访问，file:// 会给出提示。
 * - 只读产物：不动 locales/*.json、index.html、swap.html。
 * - 表格用 TDesign t-table：语言列开关交给内置 columnController，缺失/同源/关键词高亮走 columns[].cell 渲染函数；
 *   刻意不传 scroll 属性，避免虚拟滚动让浏览器 Ctrl+F 查不到未渲染行。
 * - 模板放在 <script type="text/x-template">，避开 HTML 解析器把 camelCase 属性小写化。
 *
 * 用法：node scripts/i18n_reference.mjs
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT_DIR = join(ROOT, 'scripts');
const LOCALES = join(ROOT, 'locales');

/** 语言清单：顺序即列顺序；zh-CN 为唯一权威源，固定第一列且不可隐藏 */
const LANGS = [
  { code: 'zh-CN', label: '简体中文（源）', source: true },
  { code: 'en', label: 'English' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'th', label: 'ไทย' },
  { code: 'zh-HK', label: '繁體中文（香港）' },
];
const SRC = 'zh-CN';

/** 对照表分组：rent 两端合并为一张表（其余目录各自一张） */
const GROUP_OF = (dir) => (dir.startsWith('rent-') ? 'rent' : dir);

const pageTpl = readFileSync(join(SCRIPT_DIR, 'i18n_reference_page.html'), 'utf8');
const appJs = readFileSync(join(SCRIPT_DIR, 'i18n_reference_app.js'), 'utf8');

const fill = (tpl, from, to) => tpl.split(from).join(to);

function buildPage(name, dirs) {
  const cfg = {
    dir: name,
    dirs,
    src: SRC,
    langs: LANGS.map((l) => ({ code: l.code, label: l.label, source: !!l.source })),
    hideable: LANGS.filter((l) => !l.source).map((l) => l.code),
  };
  const srcLabel = LANGS.find((l) => l.source).label;
  let html = pageTpl;
  html = fill(html, '{{DIR}}', name);
  html = fill(html, '{{LOCALES}}', dirs.map((d) => 'locales/' + d).join(' 与 '));
  html = fill(html, '{{SRC_LABEL}}', srcLabel);
  html = fill(html, '{{CONFIG}}', JSON.stringify(cfg));
  html = fill(html, '{{APP_JS}}', appJs.trimEnd());
  return html;
}

/** §6 自检 1：注入的 <script> 必须能编译 */
function checkScripts(html, dir) {
  const bad = [];
  const re = /<script(?![^>]*type="text\/x-template")[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    const code = m[1];
    if (!code.trim()) continue;
    try {
      new Function(code);
    } catch (e) {
      bad.push(dir + ': ' + e.message);
    }
  }
  return bad;
}

/** §6 自检 2：标签配平（仅常见容器/组件标签，栈式） */
function checkTags(html, dir) {
  const voidTags = new Set(['link', 'meta', 'br', 'hr', 'img', 'input', 'col', 'source']);
  const stack = [];
  const re = /<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g;
  let m;
  while ((m = re.exec(html))) {
    const closing = m[1] === '/';
    const tag = m[2].toLowerCase();
    const selfClose = m[4] === '/';
    if (voidTags.has(tag) || selfClose) continue;
    if (closing) {
      const top = stack.pop();
      if (top !== tag) return [dir + ': 标签不配平，遇到 </' + tag + '> 但栈顶是 ' + (top || '空')];
    } else {
      stack.push(tag);
    }
  }
  if (stack.length) return [dir + ': 未闭合标签 ' + stack.join(',')];
  return [];
}

function flattenObj(json, prefix, out) {
  for (const k of Object.keys(json)) {
    const v = json[k];
    const n = prefix ? prefix + '.' + k : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flattenObj(v, n, out);
    else out[n] = v;
  }
  return out;
}

/** 合并一组目录的语言文件（rent 两端合并后 common/demo 同值覆盖，无副作用） */
function mergedOf(dirs, code) {
  const out = {};
  let found = false;
  for (const dir of dirs) {
    const p = join(LOCALES, dir, code + '.json');
    if (!existsSync(p)) continue;
    found = true;
    Object.assign(out, flattenObj(JSON.parse(readFileSync(p, 'utf8')), '', {}));
  }
  return found ? out : null;
}

function summarize(dirs) {
  const src = mergedOf(dirs, SRC);
  if (!src) return { total: 0, lines: ['缺 ' + SRC + '.json（跳过统计）'] };
  const keys = Object.keys(src);
  const lines = [];
  for (const l of LANGS) {
    if (l.source) continue;
    const other = mergedOf(dirs, l.code);
    if (!other) { lines.push(l.code + ' 文件缺失'); continue; }
    let miss = 0;
    for (const k of keys) {
      if (!Object.prototype.hasOwnProperty.call(other, k)) miss++;
    }
    lines.push(l.code + ' 缺失=' + miss);
  }
  return { total: keys.length, lines };
}

/* ────────────────────────── 主流程 ────────────────────────── */

const dirs = readdirSync(LOCALES, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
if (!dirs.length) {
  console.error('locales/ 下没有目录，未生成任何文件');
  process.exit(1);
}

/** 目录 → 分组（rent-user + rent-merchant → rent）；组内按「用户端在前」排序，仅影响提示文案顺序 */
const groups = new Map();
for (const dir of dirs) {
  const name = GROUP_OF(dir);
  if (!groups.has(name)) groups.set(name, []);
  groups.get(name).push(dir);
}
for (const list of groups.values()) {
  list.sort((a, b) => (a.endsWith('-user') ? 0 : 1) - (b.endsWith('-user') ? 0 : 1) || a.localeCompare(b));
}

const problems = [];
for (const [name, groupDirs] of groups) {
  const html = buildPage(name, groupDirs);
  const out = join(ROOT, name + '-translation-reference.html');
  writeFileSync(out, html, 'utf8');
  problems.push(...checkScripts(html, name), ...checkTags(html, name));
  const info = summarize(groupDirs);
  const merged = groupDirs.length > 1 ? '（合并 ' + groupDirs.join(' + ') + '）' : '';
  console.log('[生成] ' + name + '-translation-reference.html  源词条 ' + info.total + ' 条' + merged);
  info.lines.forEach((l) => console.log('        ' + l));
}

if (problems.length) {
  console.error('\n自检未通过：');
  problems.forEach((p) => console.error('  - ' + p));
  process.exit(1);
}
console.log('\n自检通过：脚本可编译、标签配平。产物共 ' + groups.size + ' 个，运行时 fetch locales/<目录>/*.json（需 http 访问）。');