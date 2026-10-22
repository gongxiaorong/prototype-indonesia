#!/usr/bin/env node
/**
 * ════════ i18n 语言文件按端拆分 — locales/rent/ → locales/rent-user/ + locales/rent-merchant/
 * ════════ 用法：node scripts/i18n_split.mjs [--write]
 *
 * 默认 dry-run：只打印将生成的文件与统计，不落盘；带 --write 才写入。
 *
 * 拆分映射（key 路径与顶层顺序原样保留）：
 *  - rent-user      = common + user + demo      （每语 669 叶子）
 *  - rent-merchant  = common + merchant + demo  （每语 946 叶子）
 *
 * 输出格式：JSON.stringify(obj, null, 2) + '\n'，UTF-8 无 BOM。
 *
 * 脚本内三条断言（任一失败即打印明细并 exit 1）：
 *  1. 两端每端每语叶子数分别为 669 / 946
 *  2. 每端五语键集合完全一致
 *  3. common + demo 两段在 rent-user 与 rent-merchant 之间 key 集合与五语值逐字一致
 * 另打印总键数守恒：669 + 946 = 1615 = 1226 + 355 + 34
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(ROOT, 'locales', 'rent');
const LANGS = ['zh-CN', 'zh-HK', 'en', 'id', 'th'];
const SHARED_SECTIONS = ['common', 'demo'];

/** 各段叶子数基线（zh-CN 源） */
const SECTION_LEAVES = { common: 355, user: 280, merchant: 557, demo: 34 };

/** 拆分目标：目录名 + 保留段（顺序即输出顶层顺序）+ 每语叶子数 */
const TARGETS = [
  { dir: 'rent-user', sections: ['common', 'user', 'demo'], expected: 669 },
  { dir: 'rent-merchant', sections: ['common', 'merchant', 'demo'], expected: 946 },
];

const WRITE = process.argv.includes('--write');

/** 嵌套 JSON → 点路径扁平表（数组同样展开，与 i18n_check.mjs 口径一致） */
function flat(obj, prefix = '', out = {}) {
  for (const k in obj) {
    const v = obj[k];
    const n = prefix ? prefix + '.' + k : k;
    if (v && typeof v === 'object') flat(v, n, out);
    else out[n] = v == null ? '' : String(v);
  }
  return out;
}

/** 只保留指定顶层段，其余键顺序按源文件原样 */
function pickSections(src, sections) {
  const out = {};
  for (const k of Object.keys(src)) {
    if (sections.includes(k)) out[k] = src[k];
  }
  return out;
}

const errors = [];
const fail = (msg) => errors.push(msg);

/** 读取源目录五语 */
const sources = {};
for (const lang of LANGS) {
  const p = path.join(SRC_DIR, lang + '.json');
  if (!fs.existsSync(p)) {
    fail('源文件缺失：locales/rent/' + lang + '.json');
    continue;
  }
  const raw = fs.readFileSync(p, 'utf8');
  try {
    sources[lang] = JSON.parse(raw);
  } catch (e) {
    fail('源文件解析失败：locales/rent/' + lang + '.json（' + e.message + '）');
  }
}

let sourceTotal = 0;
if (Object.keys(sources).length === LANGS.length) {
  // 源基线：每语 1226 叶子，且各段数量符合 355 / 280 / 557 / 34
  for (const lang of LANGS) {
    const f = flat(sources[lang]);
    const n = Object.keys(f).length;
    if (lang === 'zh-CN') sourceTotal = n;
    if (n !== 1226) fail('源基线不符：locales/rent/' + lang + '.json 叶子数 ' + n + '，期望 1226');
    for (const sec of Object.keys(SECTION_LEAVES)) {
      const c = Object.keys(f).filter((k) => k.indexOf(sec + '.') === 0).length;
      if (c !== SECTION_LEAVES[sec]) {
        fail('源分段不符：' + lang + ' 段 ' + sec + ' 叶子数 ' + c + '，期望 ' + SECTION_LEAVES[sec]);
      }
    }
  }
}

/** 生成产物（内存态），并记录统计 */
const outputs = {};
for (const t of TARGETS) {
  outputs[t.dir] = {};
  for (const lang of LANGS) {
    outputs[t.dir][lang] = pickSections(sources[lang], t.sections);
  }
}

// ── 断言 1：两端每端每语叶子数 669 / 946 ──
for (const t of TARGETS) {
  for (const lang of LANGS) {
    const n = Object.keys(flat(outputs[t.dir][lang])).length;
    if (n !== t.expected) {
      fail('断言1 叶子数不符：locales/' + t.dir + '/' + lang + '.json 为 ' + n + '，期望 ' + t.expected);
    }
  }
}

// ── 断言 2：每端五语键集合完全一致 ──
for (const t of TARGETS) {
  const base = Object.keys(flat(outputs[t.dir]['zh-CN'])).sort();
  for (const lang of LANGS) {
    if (lang === 'zh-CN') continue;
    const cur = Object.keys(flat(outputs[t.dir][lang])).sort();
    const miss = base.filter((k) => cur.indexOf(k) < 0);
    const extra = cur.filter((k) => base.indexOf(k) < 0);
    if (miss.length || extra.length) {
      fail('断言2 键集合不一致：locales/' + t.dir + '/' + lang + '.json' +
        ' 缺 ' + miss.length + ' 条' + (miss.length ? '（' + miss.slice(0, 10).join(', ') + (miss.length > 10 ? ' …' : '') + '）' : '') +
        ' 多 ' + extra.length + ' 条' + (extra.length ? '（' + extra.slice(0, 10).join(', ') + (extra.length > 10 ? ' …' : '' ) + '）' : ''));
    }
  }
}

// ── 断言 3：common + demo 两段两端 key 集合与五语值逐字一致 ──
for (const lang of LANGS) {
  const a = flat(pickSections(outputs['rent-user'][lang], SHARED_SECTIONS));
  const b = flat(pickSections(outputs['rent-merchant'][lang], SHARED_SECTIONS));
  const keys = [...new Set(Object.keys(a).concat(Object.keys(b)))].sort();
  for (const k of keys) {
    if (!(k in a) || !(k in b)) {
      fail('断言3 共享段键缺失：' + lang + ' ' + k + '（rent-user ' + (k in a ? '有' : '无') +
        ' / rent-merchant ' + (k in b ? '有' : '无') + '）');
      continue;
    }
    if (a[k] !== b[k]) {
      fail('断言3 共享段值不一致：' + lang + ' ' + k +
        '\n    rent-user     : ' + JSON.stringify(a[k]) +
        '\n    rent-merchant : ' + JSON.stringify(b[k]));
    }
  }
}

// ── 总键数守恒：669 + 946 = 1615 = 1226 + 355 + 34 ──
const sumTargets = TARGETS.reduce((s, t) => s + t.expected, 0);
const conservation = sourceTotal + SECTION_LEAVES.common + SECTION_LEAVES.demo;
if (sumTargets !== 1615 || conservation !== 1615 || sumTargets !== conservation) {
  fail('总键数守恒失败：' + TARGETS.map((t) => t.expected).join(' + ') + ' = ' + sumTargets +
    '，源 ' + sourceTotal + ' + common ' + SECTION_LEAVES.common + ' + demo ' + SECTION_LEAVES.demo +
    ' = ' + conservation + '，期望均为 1615');
}

// ── 输出 ──
console.log('== i18n 按端拆分 ==' + (WRITE ? ' [--write]' : ' [dry-run]'));
for (const t of TARGETS) {
  for (const lang of LANGS) {
    const rel = 'locales/' + t.dir + '/' + lang + '.json';
    const n = Object.keys(flat(outputs[t.dir][lang])).length;
    const size = Buffer.byteLength(JSON.stringify(outputs[t.dir][lang], null, 2) + '\n', 'utf8');
    console.log('  ' + (WRITE ? '写入' : '将生成') + ' ' + rel + '  ' + n + ' 叶子  ' + size + ' B');
  }
}
console.log('  总键数守恒：' + TARGETS.map((t) => t.expected).join(' + ') + ' = ' + sumTargets +
  ' = ' + sourceTotal + ' + ' + SECTION_LEAVES.common + ' + ' + SECTION_LEAVES.demo + ' = ' + conservation);

if (errors.length) {
  console.log('\n断言失败 ' + errors.length + ' 项：');
  errors.forEach((e) => console.log('  ✗ ' + e));
  process.exit(1);
}
console.log('断言通过：叶子数 669/946、各端五语键集合一致、common+demo 两端逐字一致');

if (!WRITE) {
  console.log('\ndry-run：未落盘（加 --write 写入）');
  process.exit(0);
}

for (const t of TARGETS) {
  const dir = path.join(ROOT, 'locales', t.dir);
  fs.mkdirSync(dir, { recursive: true });
  for (const lang of LANGS) {
    const content = JSON.stringify(outputs[t.dir][lang], null, 2) + '\n';
    fs.writeFileSync(path.join(dir, lang + '.json'), content, 'utf8');
  }
}
console.log('\n写入完成：' + TARGETS.map((t) => 'locales/' + t.dir + '/（5 语）').join('，'));
