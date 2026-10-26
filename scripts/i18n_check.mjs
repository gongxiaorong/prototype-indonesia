#!/usr/bin/env node
/**
 * ════════ i18n 校验 — 按 locales/{rent-user,rent-merchant,swap} 三目录分组检查五语一致性
 * ════════ 用法：node scripts/i18n_check.mjs
 *
 * 口径对齐 AGENTS.md §5：
 *  - 目录代替项目前缀命名空间：rent-user/（common./user./demo.）、
 *    rent-merchant/（common./merchant./demo.）、swap/
 *  - zh-CN.json 为唯一权威源，en/id/th/zh-HK 单向派生
 *  - 某目录无 zh-CN.json 或内容为空时跳过该目录
 *  - rent-user / rent-merchant 的 common.* 与 demo.* **各自独立维护**，不要求键集镜像；
 *    两端只要中文相同（zh-CN 值逐字一致），其它语言译法必须一致（由 TERM 覆盖）
 *
 * 硬错误（计入退出码，exit 1）：
 *  - MISSING     某语言缺键
 *  - ORPHAN      某语言多出 zh-CN 没有的键
 *  - PLACEHOLDER 占位符 {name}/%s 集合与源不一致（运行时渲染必错）
 *  - SUFFIX      数字后缀残留键：末段去掉末尾数字后「同名键也存在」才算
 *                （menu.home0 vs menu.home 并存）；days7 / billingRules.3 / tianneng72V20 属合法业务名，不报
 *  - TERM        跨目录同义中文（zh-CN 值逐字相同）译法不一致，见 AGENTS.md §5
 *                「跨目录术语一致性」。判定**锚点是中文值、不是 key 路径**：
 *                同句中文即使 key 完全不同，en/id/th/zh-HK 也必须一致；
 *                反之 key 同名但中文不同的不算漂移。
 *                三对独立比对：rent-user↔swap、rent-merchant↔swap、rent-user↔rent-merchant。
 *                demo.* 与 TERM_ALLOW（品牌专名）已排除；口径见 AGENTS.md §5
 *                （common.* 同此口径：两端键集可不同，同中文译法须一致）
 *
 * 人工复核项（不计入退出码）：
 *  - NUMBER      数字集合与源不一致。中文常以汉字表示（百公里 / 两位 / 一张），
 *                译文写阿拉伯数字（100 km / 2 / 1）；日期本地化（7月 → Jul）同理。需人眼扫一遍
 *  - STATUS      与中文逐字相同。rent-user / rent-merchant 实测来源：demo.* 演示假数据、品牌专名（2C2P）、
 *                繁简同形词（押金 / 退款 / 重置），通常无需处理
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIRS = ['rent-user', 'rent-merchant', 'swap'];
const LANGS = ['zh-CN', 'en', 'id', 'th', 'zh-HK'];
const SRC = 'zh-CN';

/** 嵌套 JSON → 点路径扁平表（对象与数组均展开） */
function flat(obj, prefix = '', out = {}) {
  for (const k in obj) {
    const v = obj[k];
    const n = prefix ? prefix + '.' + k : k;
    if (v && typeof v === 'object') flat(v, n, out);
    else out[n] = v == null ? '' : String(v);
  }
  return out;
}

/** 读取某目录某语言；文件不存在、解析失败或内容为空对象 → null */
function load(dir, lang) {
  const p = path.join(ROOT, 'locales', dir, lang + '.json');
  if (!fs.existsSync(p)) return null;
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.log('  [' + lang + '] JSON 解析失败：' + e.message);
    return null;
  }
  if (!raw || typeof raw !== 'object') return null;
  const f = flat(raw);
  return Object.keys(f).length ? f : null;
}

const ph = (s) => ((String(s).match(/\{[^}]+\}|%[sd]/g)) || []).sort().join('|');
const nums = (s) => ((String(s).match(/\d+/g)) || []).sort().join(',');
const short = (s) => String(s).replace(/\s+/g, ' ').slice(0, 32);
/** 跨目录译法一致的声明例外：品牌与专名（AGENTS.md §5「允许不同」），命中子串的同中文不参与 TERM 比对 */
const TERM_ALLOW = ['2C2P', 'YADEA'];
/** 数字后缀残留：末段末尾数字可剥离，且剥离后同名键确实存在（排除纯数字段＝数值键对象） */
function isSuffixKey(k, all) {
  const seg = k.split('.').pop() || '';
  if (/^\d+$/.test(seg)) return false;
  const m = /^(.*?)(\d+)$/.exec(seg);
  if (!m || !m[1]) return false;
  return all.has(k.slice(0, k.length - seg.length) + m[1]);
}

let failures = 0;
const dirFull = {}; /* { dir: { lang: flatMap } } —— 供跨目录同义中文比对复用 */

for (const dir of DIRS) {
  const src = load(dir, SRC);
  if (!src) {
    console.log('== ' + dir + '/ == 跳过（无 zh-CN.json 或内容为空）\n');
    continue;
  }
  dirFull[dir] = { [SRC]: src };
  const keys = Object.keys(src).sort();
  console.log('== ' + dir + '/ == 源（zh-CN）' + keys.length + ' 键');

  for (const lang of LANGS) {
    if (lang === SRC) continue;
    const f = load(dir, lang);
    if (!f) {
      console.log('  ' + lang + ': 缺失整个语言文件');
      failures++;
      continue;
    }
    dirFull[dir][lang] = f;
    const all = new Set(keys.concat(Object.keys(f)));
    const miss = keys.filter((k) => !(k in f));
    const orphan = Object.keys(f).filter((k) => !(k in src)).sort();
    const phBad = keys.filter((k) => k in f && ph(f[k]) !== ph(src[k]));
    const numBad = keys.filter((k) => k in f && nums(f[k]) !== nums(src[k]));
    /* demo.* 为演示假数据（zs 张三 / zs10 郑十 这类同前缀不同语义），不适用数字后缀禁令 */
    const suffix = Object.keys(f).filter((k) => k.indexOf('demo.') !== 0 && isSuffixKey(k, all));
    const same = keys.filter((k) => k in f && f[k] === src[k]);

    const hard = miss.length + orphan.length + phBad.length + suffix.length;
    failures += hard;
    console.log('  ' + lang + ': MISSING=' + miss.length + ' ORPHAN=' + orphan.length +
      ' PLACEHOLDER=' + phBad.length + ' SUFFIX=' + suffix.length +
      ' | 复核 NUMBER=' + numBad.length + ' STATUS=' + same.length);
    if (miss.length) console.log('      缺: ' + miss.slice(0, 8).join(', ') + (miss.length > 8 ? ' …' : ''));
    if (orphan.length) console.log('      多: ' + orphan.slice(0, 8).join(', ') + (orphan.length > 8 ? ' …' : ''));
    if (phBad.length) phBad.slice(0, 6).forEach((k) => console.log('      占位符 ' + k + '：' + short(src[k]) + ' → ' + short(f[k])));
    if (suffix.length) console.log('      数字后缀: ' + suffix.slice(0, 8).join(', '));
    if (numBad.length) numBad.slice(0, 6).forEach((k) => console.log('      数字 ' + k + '：' + short(src[k]) + ' → ' + short(f[k])));
    const sameReal = same.filter((k) => k.indexOf('demo.') !== 0);
    if (sameReal.length) console.log('      同源(非 demo.*): ' + sameReal.slice(0, 6).join(', ') + (sameReal.length > 6 ? ' …' : ''));
  }
  console.log('');
}

// ── 跨目录同义中文译法一致性（AGENTS.md §5：同一句中文任意两目录译法必须一致）──
// 口径：按 zh-CN 值分组（**不看 key 路径**），同一组中文在两目录的译文集合必须相同。
// 三对独立比对（rent 已按端拆分，故除 swap 两对外还要比对 rent-user ↔ rent-merchant）。
// 差异计入硬错误 TERM。demo.* 整体排除；TERM_ALLOW（品牌专名）命中项排除。
// 说明：common 段不要求跨目录键集镜像——同句中文 key 各异也按本规则比对，key 同名而中文不同不算漂移。
const TERM_PAIRS = [
  ['rent-user', 'swap'],
  ['rent-merchant', 'swap'],
  ['rent-user', 'rent-merchant'],
];

/** 「同义中文」分组：zh-CN 值 → 该目录下所有 key（排除 demo.* 与 TERM_ALLOW 命中项） */
function termGroup(dir) {
  const m = new Map();
  const src = dirFull[dir][SRC];
  for (const k of Object.keys(src)) {
    if (k.startsWith('demo.')) continue;
    const zh = (src[k] || '').trim();
    if (TERM_ALLOW.some((t) => zh.includes(t))) continue;
    if (!m.has(zh)) m.set(zh, []);
    m.get(zh).push(k);
  }
  return m;
}

/** 比对一对目录，返回 { shared, rows } */
function termCompare(a, b) {
  const others = LANGS.filter((l) => l !== SRC);
  const am = termGroup(a);
  const bm = termGroup(b);
  const sharedZh = [...am.keys()].filter((zh) => bm.has(zh));
  const perLang = {};
  const rows = [];
  for (const zh of sharedZh) {
    const hit = [];
    for (const lang of others) {
      const av = [...new Set(am.get(zh).map((k) => dirFull[a][lang]?.[k] ?? '<缺>'))].sort();
      const bv = [...new Set(bm.get(zh).map((k) => dirFull[b][lang]?.[k] ?? '<缺>'))].sort();
      if (av.join('\u0000') !== bv.join('\u0000')) {
        perLang[lang] = (perLang[lang] || 0) + 1;
        hit.push(lang + ' ' + a + '「' + av.join(' / ') + '」' + b + '「' + bv.join(' / ') + '」');
      }
    }
    if (hit.length) rows.push({ zh, ak: am.get(zh), bk: bm.get(zh), hit });
  }
  return { sharedZh, perLang, rows };
}

for (const [a, b] of TERM_PAIRS) {
  const title = '== 跨目录同义中文译法（' + a + ' vs ' + b + '）==';
  if (!dirFull[a] || !dirFull[b]) {
    console.log(title + ' 跳过（某一目录为空占位）');
    continue;
  }
  const { sharedZh, perLang, rows } = termCompare(a, b);
  console.log(title);
  console.log('  共有同中文 ' + sharedZh.length + ' 条，译法不一致 ' + rows.length +
    ' 条（TERM，计入退出码）：' +
    LANGS.filter((l) => l !== SRC).map((l) => l + '=' + (perLang[l] || 0)).join(' '));
  rows.slice(0, 12).forEach((r) => {
    console.log('    · ' + short(r.zh) + '  [' + r.ak[0] + ' ↔ ' + r.bk[0] + ']');
    r.hit.forEach((h) => console.log('        ' + h));
  });
  if (rows.length > 12) console.log('    …其余 ' + (rows.length - 12) + ' 条未展开');
  failures += rows.length;
}

// ── common.* / demo.* 不做键集镜像校验 ──
// 两端 common.* 各自独立维护（任一端可单独增删键），同一句中文的译法一致性已由上面的 TERM 校验覆盖。

console.log('\n结果：' + (failures
  ? '失败 ' + failures + ' 项（MISSING/ORPHAN/PLACEHOLDER/SUFFIX/TERM）'
  : '通过：无硬错误') + '；NUMBER / STATUS 为人工复核项，不影响退出码');
process.exit(failures ? 1 : 0);