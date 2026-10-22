#!/usr/bin/env node
/**
 * ════════ i18n key 命名体检 / 按映射重命名 — 零依赖 Node ESM
 * ════════
 * 两个能力（默认 dry-run，不写任何文件）：
 *
 *   A. --audit
 *      node scripts/i18n_keyize.mjs --audit --end user \
 *        --ranges 400:584,939:1003,2387:2408,2705:2715,2719:2727
 *      node scripts/i18n_keyize.mjs --audit --end merchant \
 *        --ranges 3234:3424,3429:3519,6551:6570,6575:6585,6617:6618
 *
 *      - 从 index.html 指定行区间提取中文字面量：文本节点 / title|placeholder|aria-label
 *        静态属性 / 单引号 JS 字符串（含绑定属性与 {{ }} 表达式内的字符串）。
 *      - 排除：HTML 注释、class/style/data-*、v-html="luci(...)"、v-if/v-show/v-for、
 *        :class/:style 等非文案绑定、语言自称（模板里本就是 {{ l.label }} 变量）、
 *        正则、纯标识符、demo.* 演示数据。
 *      - 按 zh-CN 值锚点匹配本端语言文件：--end user 只查 locales/rent-user/zh-CN.json，
 *        --end merchant 只查 locales/rent-merchant/zh-CN.json；同值多 key 全部列出。
 *      - 输出：区间统计 / 命中表 / 未命中表 / 命名候选表 / 归并观察项。
 *        报告同时打印到 stdout 与写入系统 TEMP（不落仓库）。
 *
 *   B. --apply-rename <map.json> [--write]
 *      map.json = [{"from":"a.b.c","to":"a.b.d","end":"user"|"merchant"|"common","reason":"..."}]
 *      - end=user 只改 locales/rent-user 五语；merchant 只改 rent-merchant；
 *        common 表示 key 位于 common.* / demo.*，必须两端同改。
 *      - 只改键路径不改值；同父级改名在原位置替换键名（保持顺序），跨父级移动在目标父级末尾插入。
 *      - 断言：五语键集合一致、每端叶子键数改名前一致、from 必须存在、to 必须不存在；
 *        任一断言失败即报错退出，不落盘。默认 dry-run，仅 --write 写文件。
 *
 * 口径对齐 AGENTS.md §5 与 i18n-integration-plan.md §5.1（五条判定标准）。
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const LANGS = ['zh-CN', 'zh-HK', 'en', 'id', 'th'];
const SRC = 'zh-CN';

/** 端 → 语言目录 / 本端 key 前缀 */
const ENDS = {
  user: { dir: 'rent-user', prefix: 'user.' },
  merchant: { dir: 'rent-merchant', prefix: 'merchant.' },
};

/** 试点批次行区间（行号含首尾，1 基）；--ranges 可覆盖 */
const DEFAULT_RANGES = {
  user: '400:584,939:1003,2387:2408,2705:2715,2719:2727',
  merchant: '3234:3424,3429:3519,6551:6570,6575:6585,6617:6618',
};

const CJK = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/;

// ══════════════════════════════════════════════════════════════════════
// 通用工具：JSON 扁平化 / 读写 / CLI
// ══════════════════════════════════════════════════════════════════════

/** 嵌套 JSON → 点路径扁平表（与 i18n_check.mjs 同口径） */
function flat(obj, prefix = '', out = {}) {
  for (const k in obj) {
    const v = obj[k];
    const n = prefix ? prefix + '.' + k : k;
    if (v && typeof v === 'object') flat(v, n, out);
    else out[n] = v == null ? '' : String(v);
  }
  return out;
}

const leafKeys = (obj) => Object.keys(flat(obj)).sort();

function readJson(p) {
  let raw = fs.readFileSync(p, 'utf8');
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1); // 容忍输入 BOM，输出统一无 BOM
  return JSON.parse(raw);
}

/** 2 空格缩进 + 结尾换行 + UTF-8 无 BOM */
function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function deepGet(root, segs) {
  let cur = root;
  for (const s of segs) {
    if (!cur || typeof cur !== 'object' || !(s in cur)) return undefined;
    cur = cur[s];
  }
  return cur;
}

function deepHas(root, segs) {
  return deepGet(root, segs) !== undefined;
}

function deletePath(root, segs) {
  const parent = deepGet(root, segs.slice(0, -1));
  if (!parent || typeof parent !== 'object') return false;
  const last = segs[segs.length - 1];
  if (!(last in parent)) return false;
  delete parent[last];
  return true;
}

function setPath(root, segs, value) {
  const parent = segs.length === 1 ? root : deepGet(root, segs.slice(0, -1));
  if (!parent || typeof parent !== 'object') throw new Error('目标父级不存在：' + segs.join('.'));
  parent[segs[segs.length - 1]] = value;
}

/** 同父级改名：重建父对象条目，键在原位置替换（JS 对象字符串键保持插入顺序） */
function renameInParent(parent, fromKey, toKey) {
  const entries = Object.entries(parent);
  for (const k of Object.keys(parent)) delete parent[k];
  for (const [k, v] of entries) parent[k === fromKey ? toKey : k] = v;
}

function parseRangeSpec(spec) {
  return String(spec || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const m = /^(\d+):(\d+)$/.exec(s);
      if (!m) throw new Error('区间格式应为 start:end（行号 1 基）：' + s);
      const a = Number(m[1]);
      const b = Number(m[2]);
      if (a < 1 || b < a) throw new Error('非法区间：' + s);
      return { start: a, end: b, label: a + '-' + b };
    });
}

function usage() {
  console.log(`用法：
  node scripts/i18n_keyize.mjs --audit --end user|merchant [--ranges 400:584,939:1003]
  node scripts/i18n_keyize.mjs --apply-rename <map.json> [--write]

说明：
  --audit        体检（默认模式；不写仓库文件，仅 stdout + 系统 TEMP 报告）
  --end          指定本端（user → rent-user / merchant → rent-merchant）
  --ranges       行区间（1 基含首尾）；不传使用该端试点默认区间
  --apply-rename 按映射重命名；默认 dry-run
  --write        仅配合 --apply-rename，实际落盘`);
}

function parseArgs(argv) {
  const args = { audit: false, write: false, end: '', ranges: '', map: '', help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--audit') args.audit = true;
    else if (a === '--write') args.write = true;
    else if (a === '--help' || a === '-h') args.help = true;
    else if (a === '--end') {
      args.end = argv[++i] || '';
      if (!ENDS[args.end]) throw new Error('--end 只能是 user 或 merchant');
    } else if (a === '--ranges') args.ranges = argv[++i] || '';
    else if (a === '--apply-rename') args.map = argv[++i] || '';
    else throw new Error('未知参数：' + a);
  }
  if (args.help) return args;
  if (args.map && args.audit) throw new Error('--audit 与 --apply-rename 不能同时使用');
  if (!args.map && !args.end) throw new Error('--audit 需要 --end user|merchant');
  return args;
}

// ══════════════════════════════════════════════════════════════════════
// A. 体检：index.html 中文字面量提取
// ══════════════════════════════════════════════════════════════════════

const ENTITY_MAP = { '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };

function decodeEntities(s) {
  return String(s)
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (m) => ENTITY_MAP[m] ?? m);
}

/**
 * 文本节点归一：两侧空白 + 句读标点（，。：；、!? 等）去掉。
 * 不剥离「…」与书名号，避免破坏「刷新中…」「《用户隐私政策》」这类值。
 */
function normalizeText(s) {
  return String(s)
    .replace(/\u00a0/g, ' ')
    .trim()
    .replace(/^[\s,，.。:：;；、!！?？]+/, '')
    .replace(/[\s,，.。:：;；、!！?？]+$/, '');
}

/** 注释替换为等长空白（保留换行，行号不漂移） */
function maskHtmlComments(text) {
  return text.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '));
}

/** 扫描标签（引号内的 > 不截断），返回 [{start,end,raw}] */
function findTags(text) {
  const tags = [];
  let i = 0;
  while (i < text.length) {
    const lt = text.indexOf('<', i);
    if (lt < 0) break;
    if (!/[a-zA-Z/!]/.test(text[lt + 1] || '')) {
      i = lt + 1;
      continue;
    }
    let quote = null;
    let j = lt + 1;
    for (; j < text.length; j++) {
      const c = text[j];
      if (quote) {
        if (c === quote) quote = null;
        continue;
      }
      if (c === '"' || c === "'") {
        quote = c;
        continue;
      }
      if (c === '>') break;
    }
    if (j >= text.length) break;
    tags.push({ start: lt, end: j + 1, raw: text.slice(lt, j + 1) });
    i = j + 1;
  }
  return tags;
}

/** JS 字符串扫描：跳过注释与正则字面量，收集含中文的单引号 / 反引号字符串 */
function scanJsStrings(code) {
  const out = [];
  let i = 0;
  const isRegexStart = (s, k) => {
    let p = k - 1;
    while (p >= 0 && /\s/.test(s[p])) p--;
    return p < 0 || '([{,;:=!?&|+-*%^~<>'.includes(s[p]);
  };
  const skipRegex = (s, k) => {
    let j = k + 1;
    let inClass = false;
    for (; j < s.length; j++) {
      const c = s[j];
      if (c === '\\') { j++; continue; }
      if (c === '[') inClass = true;
      else if (c === ']') inClass = false;
      else if (c === '/' && !inClass) return j + 1;
      else if (c === '\n') return j; // 未闭合，按普通字符继续
    }
    return j;
  };
  while (i < code.length) {
    const c = code[i];
    if (c === '/' && code[i + 1] === '/') {
      const nl = code.indexOf('\n', i);
      i = nl < 0 ? code.length : nl + 1;
      continue;
    }
    if (c === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2);
      i = end < 0 ? code.length : end + 2;
      continue;
    }
    if (c === '/' && isRegexStart(code, i)) {
      i = skipRegex(code, i);
      continue;
    }
    if (c === "'" || c === '`') {
      let j = i + 1;
      let value = '';
      let closed = false;
      for (; j < code.length; j++) {
        const ch = code[j];
        if (ch === '\\') { value += code[j + 1] || ''; j++; continue; }
        if (ch === c) { closed = true; break; }
        if (ch === '\n' && c === "'") break; // JS 单引号不允许裸换行
        value += ch;
      }
      if (closed) {
        if (CJK.test(value)) out.push(value);
        i = j + 1;
      } else {
        i++;
      }
      continue;
    }
    i++;
  }
  return out;
}

/** 静态 / 绑定属性中的文案提取（按 AGENTS/规格的排除清单收敛） */
const STATIC_COPY_ATTRS = new Set(['title', 'placeholder', 'aria-label']);
const BOUND_COPY_ATTRS = new Set([
  ':title', 'v-bind:title', ':placeholder', 'v-bind:placeholder', ':aria-label', 'v-bind:aria-label',
  ':text', 'v-bind:text', ':label', 'v-bind:label', ':desc', 'v-bind:desc', ':sub', 'v-bind:sub',
  ':tip', 'v-bind:tip', ':items', 'v-bind:items', ':options', 'v-bind:options',
  ':confirm-text', 'v-bind:confirm-text', ':cancel-text', 'v-bind:cancel-text',
]);

function shouldSkipAttr(name) {
  const n = name.toLowerCase();
  if (n === 'class' || n === 'style' || n.startsWith('data-') || n === 'v-html' || n === 'v-text') return true;
  if (n.startsWith(':class') || n.startsWith(':style') || n.startsWith(':data-')) return true;
  if (/^(v-if|v-else-if|v-show|v-for|v-model|v-slot|v-swipe-close|v-sheet-drag)$/.test(n)) return true;
  return false;
}

function scanAttrs(tagRaw, add) {
  const attrRe = /([^\s"'<>/=]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let m;
  while ((m = attrRe.exec(tagRaw))) {
    const name = m[1];
    const value = m[2] !== undefined ? m[2] : m[3];
    if (!name || shouldSkipAttr(name)) continue;
    const lower = name.toLowerCase();
    if (STATIC_COPY_ATTRS.has(lower)) {
      const v = normalizeText(decodeEntities(value));
      if (v && CJK.test(v)) add(v, 'attr');
      continue;
    }
    if (lower.startsWith(':') || lower.startsWith('v-bind:')) {
      if (!BOUND_COPY_ATTRS.has(lower)) continue;
    } else if (lower.startsWith('v-')) {
      continue; // 其余指令一律不看
    } else if (!lower.startsWith('@') && !lower.startsWith('v-on:')) {
      continue; // 非标题类静态属性（id/type/oid/data-* 等）
    }
    for (const s of scanJsStrings(value)) {
      const v = normalizeText(s);
      if (v && CJK.test(v)) add(v, 'js');
    }
  }
}

/** 文本段：拆 {{ }}，表达式内按 JS 字符串收集，表达式外按文本节点收集 */
function scanTextSegment(seg, add, inScript) {
  if (inScript) {
    for (const s of scanJsStrings(seg)) {
      const v = normalizeText(s);
      if (v && CJK.test(v)) add(v, 'js');
    }
    return;
  }
  const re = /\{\{([\s\S]*?)\}\}/g;
  let last = 0;
  let m;
  const pushText = (raw) => {
    const t = normalizeText(decodeEntities(raw));
    if (t && CJK.test(t)) add(t, 'text');
  };
  while ((m = re.exec(seg))) {
    pushText(seg.slice(last, m.index));
    for (const s of scanJsStrings(m[1])) {
      const v = normalizeText(s);
      if (v && CJK.test(v)) add(v, 'js');
    }
    last = re.lastIndex;
  }
  pushText(seg.slice(last));
}

/**
 * 提取某区间内的中文值。
 * @returns {Map<string,{value:string,count:number,types:Set<string>,lines:Set<number>}>}
 */
function extractRange(maskedLines, range) {
  const out = new Map();
  const add = (value, type, line) => {
    const key = value;
    if (!out.has(key)) out.set(key, { value, count: 0, types: new Set(), lines: new Set() });
    const rec = out.get(key);
    rec.count++;
    rec.types.add(type);
    rec.lines.add(line);
  };
  const chunk = maskedLines.slice(range.start - 1, range.end).join('\n');
  const tags = findTags(chunk);
  const lineAt = (pos) => range.start + (chunk.slice(0, pos).match(/\n/g) || []).length;
  let cursor = 0;
  let inScript = false;

  // 文本段按行拆分后再扫（避免把两行独立文案拼成一条），标签属性整块扫（兼容跨行标签）
  const scanSegment = (seg, basePos) => {
    let off = basePos;
    for (const lineText of seg.split('\n')) {
      if (lineText.trim()) scanTextSegment(lineText, (v, ty) => add(v, ty, lineAt(off)), inScript);
      off += lineText.length + 1;
    }
  };

  for (const t of tags) {
    if (t.start > cursor) scanSegment(chunk.slice(cursor, t.start), cursor);
    scanAttrs(t.raw, (v, ty) => add(v, ty, lineAt(t.start)));
    if (/^<script[\s>]/i.test(t.raw)) inScript = true;
    else if (/^<\/script/i.test(t.raw)) inScript = false;
    cursor = t.end;
  }
  if (cursor < chunk.length) scanSegment(chunk.slice(cursor), cursor);
  return out;
}

// ══════════════════════════════════════════════════════════════════════
// A2. 命名候选（规格 §5.1 五条判定标准）
// ══════════════════════════════════════════════════════════════════════

/** 规则 1：通用词表 → 通用子命名空间（i18n-integration-plan.md §5.1-1） */
const GENERIC_TARGET = {
  确定: 'common.action.confirm',
  取消: 'common.action.cancel',
  完成: 'common.action.done',
  至: 'common.dateTime.rangeTo',
  其他: 'common.label.other',
  保存成功: 'common.toast.saveSuccess',
  复制成功: 'common.toast.copySuccess',
  我知道了: 'common.action.iKnow',
  收起: 'common.action.collapse',
  排序: 'common.action.sort',
  启用: 'common.status.enabled',
  禁用: 'common.status.disabled',
  处理中: 'common.status.processing',
};
const GENERIC_NS = /^common\.(action|label|dateTime|toast|status)\./;

/** 规则 2：键名与值语义已不符（人工核对过的明显项，保守清单） */
const SEMANTIC_RULES = [
  {
    key: 'common.orderStatus.pickup',
    to: 'common.orderStatus.pendingBind',
    reason: '键名 pickup（取车）与值「待绑定」语义不符',
  },
  {
    key: 'common.orderStatus.return',
    to: 'common.orderStatus.expiring',
    reason: '键名 return（归还）与值「即将到期」语义不符',
  },
  {
    key: 'common.orderStatus.overdue',
    to: 'common.orderStatus.expired',
    reason: '值已改为「已到期」，键名 overdue（逾期）停留在旧语义',
  },
  {
    key: 'common.label.chargeOrder',
    to: 'common.label.rechargeOrder',
    reason: '键名 chargeOrder（充电订单）与值「充值订单」不符，且与 user.charge.*（充电）语境冲突',
  },
];

/** 保守不列为候选的既有通用子命名空间 / 成对约定 / 演示键 */
const DUP_SKIP_NS = [/^common\.login\./, /^common\.tab\./, /^common\.profile\./];
const DUP_SKIP_KEY = /(?:Title|Body)$/;

function isSuffixKey(k, all) {
  const seg = k.split('.').pop() || '';
  if (/^\d+$/.test(seg)) return false; // 纯数字段＝数组/数值键
  const m = /^(.*?)(\d+)$/.exec(seg);
  if (!m || !m[1]) return false;
  return all.has(k.slice(0, k.length - seg.length) + m[1]);
}

function endOfKey(k) {
  if (k.startsWith('common.') || k.startsWith('demo.')) return 'common';
  if (k.startsWith('user.')) return 'user';
  if (k.startsWith('merchant.')) return 'merchant';
  return 'common';
}

/** 同值多键归并时的“保留键”优先级：越靠前越适合作为公共键 */
function canonicalRank(k) {
  if (k.startsWith('common.label.')) return 0;
  if (k.startsWith('common.status.')) return 1;
  if (k.startsWith('common.action.')) return 2;
  if (k.startsWith('common.orders.')) return 3;
  if (k.startsWith('common.')) return 4;
  if (k.startsWith('user.')) return 5;
  return 6;
}

/**
 * 生成命名候选。
 * @param {object} ctx { dir, end, srcFlat, hitKeys }
 * @returns {{rows:Array, observations:Array}}
 */
function buildCandidates(ctx) {
  const { srcFlat, hitKeys } = ctx;
  const keys = Object.keys(srcFlat);
  const all = new Set(keys);
  const rows = [];
  const seen = new Map(); // oldKey → row（便于合并多条规则）
  const renameMap = new Map(); // 规则 2 已建议的新 key，供规则 4 的保留键跟随

  const push = (row) => {
    if (seen.has(row.oldKey)) {
      const cur = seen.get(row.oldKey);
      if (!cur.rules.includes(row.rule)) cur.rules.push(row.rule);
      if (row.reason && !cur.reason.includes(row.reason)) cur.reason += '；' + row.reason;
      return;
    }
    const r = { ...row, rules: [row.rule], batch: hitKeys.has(row.oldKey) };
    seen.set(row.oldKey, r);
    rows.push(r);
  };

  // 规则 2：键名与值语义不符（全端扫描，含批次命中集）
  for (const rule of SEMANTIC_RULES) {
    if (!(rule.key in srcFlat)) continue;
    renameMap.set(rule.key, rule.to);
    push({
      oldKey: rule.key,
      to: rule.to,
      rule: 'R2',
      end: endOfKey(rule.key),
      reason: rule.reason + '（值「' + srcFlat[rule.key] + '」）',
    });
  }

  // 规则 3：数字后缀残留
  for (const k of keys) {
    if (k.startsWith('demo.')) continue;
    if (!isSuffixKey(k, all)) continue;
    const seg = k.split('.').pop();
    const to = k.slice(0, k.length - seg.length) + /^(.*?)(\d+)$/.exec(seg)[1];
    push({ oldKey: k, to, rule: 'R3', end: endOfKey(k), reason: '数字后缀残留（' + seg + '），应指向已有语义键' });
  }

  // 规则 1：通用文案挂在专有语境位
  for (const k of keys) {
    if (k.startsWith('demo.')) continue;
    const target = GENERIC_TARGET[srcFlat[k]];
    if (!target) continue;
    if (GENERIC_NS.test(k) || k.startsWith('common.')) continue; // 已在 common 通用位（含 common 根）不列为候选
    push({
      oldKey: k,
      to: target,
      rule: 'R1',
      end: endOfKey(k),
      reason: '通用文案「' + srcFlat[k] + '」挂在专有语境位，应归通用子命名空间',
    });
  }

  // 规则 4：同句中文在单端多键并存（仅短标签；长句/带标点不参与，避免噪声）
  const groups = new Map();
  for (const k of keys) {
    if (k.startsWith('demo.')) continue;
    if (DUP_SKIP_KEY.test(k)) continue; // 已成对的 *Title / *Body
    if (DUP_SKIP_NS.some((re) => re.test(k))) continue; // 既有通用子命名空间
    if (/\.category[A-Z]/.test(k)) continue; // categoryXxx 前缀（既有约定）
    const v = srcFlat[k];
    if (!v || v.length > 12 || /[，。！？；{}\n]/.test(v)) continue;
    if (!groups.has(v)) groups.set(v, []);
    groups.get(v).push(k);
  }
  const observations = [];
  for (const [value, ks] of groups) {
    if (ks.length < 2) continue;
    const sorted = ks.slice().sort((a, b) => canonicalRank(a) - canonicalRank(b) || a.localeCompare(b));
    const commonKeys = sorted.filter((k) => k.startsWith('common.'));
    if (!commonKeys.length) {
      // 无同端 common 键：归并需新建 common 键（会牵动 SHARED 镜像），只登记不提议
      observations.push({ value, keys: sorted, reason: '无同端 common.* 键可复用；新建 common 键需两端同加并满足 SHARED 镜像' });
      continue;
    }
    let canonical = commonKeys[0];
    if (renameMap.has(canonical)) canonical = renameMap.get(canonical);
    for (const k of sorted) {
      if (k === canonical) continue;
      // 若该键本身已有规则 2 的改名建议，则以其建议键参与归并说明
      push({
        oldKey: k,
        to: canonical,
        rule: 'R4',
        end: endOfKey(k),
        reason: '同句中文「' + value + '」在本端多键并存，建议归并到 ' + canonical,
      });
    }
  }

  // 批次优先、规则编号排序
  rows.sort((a, b) => Number(b.batch) - Number(a.batch) || a.rules.join().localeCompare(b.rules.join()) || a.oldKey.localeCompare(b.oldKey));
  return { rows, observations };
}

// ══════════════════════════════════════════════════════════════════════
// A3. 体检主流程
// ══════════════════════════════════════════════════════════════════════

function runAudit(args) {
  const end = args.end;
  const dir = ENDS[end].dir;
  const ranges = parseRangeSpec(args.ranges || DEFAULT_RANGES[end]);
  const srcPath = path.join(ROOT, 'locales', dir, SRC + '.json');
  const srcObj = readJson(srcPath);
  const srcFlat = flat(srcObj);
  const keys = Object.keys(srcFlat);

  // zh-CN 值 → key[]（同值多 key 全列）
  const valueToKeys = new Map();
  for (const k of keys) {
    const v = srcFlat[k];
    if (!valueToKeys.has(v)) valueToKeys.set(v, []);
    valueToKeys.get(v).push(k);
  }

  const htmlPath = path.join(ROOT, 'index.html');
  const masked = maskHtmlComments(fs.readFileSync(htmlPath, 'utf8'));
  const lines = masked.split('\n');

  // 提取 + 匹配
  const perRange = [];
  const valueAgg = new Map(); // value → { types:Set, count, ranges:Set, hitKeys:Set }
  for (const r of ranges) {
    if (r.end > lines.length) {
      throw new Error('区间超出 index.html 行数（' + lines.length + '）：' + r.label);
    }
    const rec = extractRange(lines, r);
    const rows = [...rec.values()].sort((a, b) => a.value.localeCompare(b.value));
    const hit = [];
    const miss = [];
    let occurrences = 0;
    for (const item of rows) {
      occurrences += item.count;
      const hitKeys = valueToKeys.get(item.value) || [];
      const agg = valueAgg.get(item.value) || { types: new Set(), count: 0, ranges: new Set(), hitKeys: new Set() };
      item.types.forEach((t) => agg.types.add(t));
      agg.count += item.count;
      agg.ranges.add(r.label);
      hitKeys.forEach((k) => agg.hitKeys.add(k));
      valueAgg.set(item.value, agg);
      if (hitKeys.length) hit.push({ ...item, keys: hitKeys.slice().sort() });
      else miss.push(item);
    }
    perRange.push({ range: r, totalValues: rows.length, occurrences, hit, miss });
  }

  const hitKeys = new Set();
  for (const agg of valueAgg.values()) agg.hitKeys.forEach((k) => hitKeys.add(k));
  const { rows: candidates, observations } = buildCandidates({ dir, end, srcFlat, hitKeys });

  const out = [];
  const p = (s = '') => out.push(s);

  p('════ i18n keyize 体检报告 · ' + end + ' ════');
  p('源文件：locales/' + dir + '/zh-CN.json（' + keys.length + ' 叶子）');
  p('扫描：index.html 区间 ' + ranges.map((r) => r.label).join(', '));
  p('口径：按 zh-CN 值锚点精确匹配；文本节点 / title|placeholder|aria-label / 单引号 JS 字符串；排除注释、class/style/data-*、v-html(luci)、指令表达式、语言自称、正则。');
  p('');

  p('【区间统计】');
  p('区间 | 唯一中文值 | 出现次数 | 命中值 | 未命中值');
  for (const r of perRange) {
    p(r.range.label + ' | ' + r.totalValues + ' | ' + r.occurrences + ' | ' + r.hit.length + ' | ' + r.miss.length);
  }
  p('合计 | ' + valueAgg.size + ' | ' + [...valueAgg.values()].reduce((n, a) => n + a.count, 0) + ' | ' +
    [...valueAgg.values()].filter((a) => a.hitKeys.size).length + ' | ' +
    [...valueAgg.values()].filter((a) => !a.hitKeys.size).length);
  p('');

  p('【命中表】');
  p('区间 | 行 | 中文值 | 类型 | 命中 key');
  for (const r of perRange) {
    for (const h of r.hit) {
      p(r.range.label + ' | ' + [...h.lines].sort((a, b) => a - b).join(',') + ' | ' + h.value + ' | ' +
        [...h.types].sort().join('+') + ' | ' + h.keys.join(' ; '));
    }
  }
  p('');

  p('【未命中表】（后续 Task 9 新建词条）');
  p('区间 | 中文值 | 出现次数 | 类型');
  let missTotal = 0;
  for (const r of perRange) {
    for (const m of r.miss) {
      missTotal++;
      p(r.range.label + ' | ' + m.value + ' | ' + m.count + ' | ' + [...m.types].sort().join('+'));
    }
  }
  if (!missTotal) p('（无）');
  p('');

  const batchCands = candidates.filter((c) => c.batch);
  const globalCands = candidates.filter((c) => !c.batch);

  p('【命名候选 · A 批次命中集相关】');
  if (!batchCands.length) p('（无）');
  else {
    p('（R4 为同值归并：目标键已存在或需新建 common 键，不适用 --apply-rename 的 1:1 改名）');
    p('# | 旧 key | 建议新 key | 规则 | 目标端 | 理由');
    batchCands.forEach((c, i) => p((i + 1) + ' | ' + c.oldKey + ' | ' + c.to + ' | ' + c.rules.join('+') + ' | ' + c.end + ' | ' + c.reason));
  }
  p('');

  p('【命名候选 · B 全局明显违规项（非批次命中）】');
  if (!globalCands.length) p('（无）');
  else {
    p('（R4 为同值归并：目标键已存在或需新建 common 键，不适用 --apply-rename 的 1:1 改名）');
    p('# | 旧 key | 建议新 key | 规则 | 目标端 | 理由');
    globalCands.forEach((c, i) => p((i + 1) + ' | ' + c.oldKey + ' | ' + c.to + ' | ' + c.rules.join('+') + ' | ' + c.end + ' | ' + c.reason));
  }
  p('');

  p('【归并观察项】（同值多键但无同端 common.* 可复用，不提议改名）');
  if (!observations.length) p('（无）');
  else for (const o of observations) p(o.value + ' | ' + o.keys.join(' ; ') + ' | ' + o.reason);
  p('');

  p('【统计】');
  p('区间数 ' + perRange.length + '；唯一中文值 ' + valueAgg.size + '（命中 ' +
    [...valueAgg.values()].filter((a) => a.hitKeys.size).length + '，未命中 ' +
    [...valueAgg.values()].filter((a) => !a.hitKeys.size).length + '）；' +
    '候选 ' + candidates.length + ' 条（批次 ' + batchCands.length + ' / 全局 ' + globalCands.length + '）；' +
    '归并观察 ' + observations.length + ' 组');
  p('');
  p('说明：描述式长键名、demo.*、已成对的 *Title/*Body、categoryXxx 前缀、' +
    'common.login.* / common.tab.* / common.profile.* 等既有通用子命名空间已按保守口径跳过。');

  const text = out.join('\n') + '\n';
  console.log(text);

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const tmp = path.join(os.tmpdir(), 'i18n-keyize-audit-' + end + '-' + stamp + '.txt');
  fs.writeFileSync(tmp, text, 'utf8');
  console.log('报告已写入系统临时目录：' + tmp);
}

// ══════════════════════════════════════════════════════════════════════
// B. 按映射重命名（默认 dry-run）
// ══════════════════════════════════════════════════════════════════════

function loadMap(mapPath) {
  const raw = readJson(mapPath);
  if (!Array.isArray(raw)) throw new Error('map.json 顶层必须是数组');
  const seenFrom = new Set();
  return raw.map((e, i) => {
    if (!e || typeof e !== 'object') throw new Error('第 ' + (i + 1) + ' 条不是对象');
    const from = String(e.from || '').trim();
    const to = String(e.to || '').trim();
    const end = String(e.end || '').trim();
    if (!from || !to) throw new Error('第 ' + (i + 1) + ' 条缺 from / to');
    if (from === to) throw new Error('第 ' + (i + 1) + ' 条 from 与 to 相同：' + from);
    if (!['user', 'merchant', 'common'].includes(end)) throw new Error('第 ' + (i + 1) + ' 条 end 非法：' + end);
    if (seenFrom.has(from)) throw new Error('from 重复：' + from);
    seenFrom.add(from);
    // 端归属校验：common.* / demo.* 只能走 common，且必须两端同改；
    // 单端改名禁止跨到 common.*（否则该 common 键只在一端存在，SHARED 必红）
    const isShared = from.startsWith('common.') || from.startsWith('demo.');
    const toShared = to.startsWith('common.') || to.startsWith('demo.');
    if (end === 'common' && !isShared) throw new Error('end=common 但 from 不在 common.* / demo.*：' + from);
    if (end === 'user' && !from.startsWith('user.')) throw new Error('end=user 但 from 不在 user.*：' + from);
    if (end === 'merchant' && !from.startsWith('merchant.')) throw new Error('end=merchant 但 from 不在 merchant.*：' + from);
    if (isShared && end !== 'common') throw new Error('common.* / demo.* 必须 end=common（两端同改）：' + from);
    if (end === 'user' && !to.startsWith('user.')) throw new Error('end=user 的 to 必须仍在 user.*（跨到 common 会破坏 SHARED）：' + to);
    if (end === 'merchant' && !to.startsWith('merchant.')) throw new Error('end=merchant 的 to 必须仍在 merchant.*：' + to);
    if (end === 'common' && !toShared) throw new Error('end=common 的 to 必须在 common.* / demo.*：' + to);
    return { from, to, end, reason: String(e.reason || '') };
  });
}

function renamePath(root, from, to) {
  const f = from.split('.');
  const t = to.split('.');
  const sameParent = f.slice(0, -1).join('\u0000') === t.slice(0, -1).join('\u0000');
  if (sameParent) {
    const parent = deepGet(root, f.slice(0, -1));
    if (!parent || typeof parent !== 'object') throw new Error('父级不存在：' + from);
    if (!(f[f.length - 1] in parent)) throw new Error('from 不存在：' + from);
    if (t[t.length - 1] in parent) throw new Error('to 已存在：' + to);
    renameInParent(parent, f[f.length - 1], t[t.length - 1]);
    return;
  }
  const val = deepGet(root, f);
  if (val === undefined) throw new Error('from 不存在：' + from);
  let cursor = root;
  for (const s of t.slice(0, -1)) {
    if (!(s in cursor) || typeof cursor[s] !== 'object' || cursor[s] === null) cursor[s] = {};
    cursor = cursor[s];
  }
  if (t[t.length - 1] in cursor) throw new Error('to 已存在：' + to);
  deletePath(root, f);
  cursor[t[t.length - 1]] = val;
}

function runApply(args) {
  const mapPath = path.resolve(args.map);
  if (!fs.existsSync(mapPath)) throw new Error('map 文件不存在：' + mapPath);
  const map = loadMap(mapPath);

  // 按目录分组：common → 两端；user / merchant 各一端
  const plans = { 'rent-user': [], 'rent-merchant': [] };
  for (const e of map) {
    if (e.end === 'common') {
      plans['rent-user'].push(e);
      plans['rent-merchant'].push(e);
    } else {
      plans[ENDS[e.end].dir].push(e);
    }
  }

  const summary = [];
  for (const dir of Object.keys(plans)) {
    const entries = plans[dir];
    if (!entries.length) continue;
    // 先读入全部语言（内存内完成改名与断言，全部通过才落盘）
    const docs = {};
    for (const lang of LANGS) {
      const p = path.join(ROOT, 'locales', dir, lang + '.json');
      if (!fs.existsSync(p)) throw new Error('缺语言文件：' + p);
      docs[lang] = readJson(p);
    }
    const keysBefore = {};
    for (const lang of LANGS) keysBefore[lang] = leafKeys(docs[lang]);
    const srcSet = new Set(keysBefore[SRC]);
    for (const lang of LANGS) {
      if (keysBefore[lang].join('\u0000') !== keysBefore[SRC].join('\u0000')) {
        throw new Error(dir + '/' + lang + ' 键集合与 zh-CN 不一致，拒绝改名');
      }
    }
    const countBefore = keysBefore[SRC].length;

    // 校验 from 存在 / to 不存在（以 zh-CN 为基准，五语同路径已断言一致）
    for (const e of entries) {
      const fSegs = e.from.split('.');
      const tSegs = e.to.split('.');
      if (!srcSet.has(e.from)) throw new Error(dir + ' 中 from 不存在：' + e.from);
      if (srcSet.has(e.to)) throw new Error(dir + ' 中 to 已存在：' + e.to);
      if (!deepHas(docs[SRC], fSegs)) throw new Error(dir + ' 中 from 路径无效：' + e.from);
      if (deepHas(docs[SRC], tSegs)) throw new Error(dir + ' 中 to 路径已存在：' + e.to);
    }

    // 五语同步改名
    for (const lang of LANGS) {
      for (const e of entries) renamePath(docs[lang], e.from, e.to);
    }

    // 落盘前断言：叶子键数不变、五语键集合一致
    const keysAfter = {};
    for (const lang of LANGS) keysAfter[lang] = leafKeys(docs[lang]);
    for (const lang of LANGS) {
      if (keysAfter[lang].length !== countBefore) {
        throw new Error(dir + '/' + lang + ' 叶子键数变化：' + countBefore + ' → ' + keysAfter[lang].length);
      }
      if (keysAfter[lang].join('\u0000') !== keysAfter[SRC].join('\u0000')) {
        throw new Error(dir + '/' + lang + ' 改名后键集合与 zh-CN 不一致');
      }
    }

    if (args.write) {
      for (const lang of LANGS) writeJson(path.join(ROOT, 'locales', dir, lang + '.json'), docs[lang]);
    }
    summary.push({ dir, entries, countBefore, countAfter: keysAfter[SRC].length, written: args.write });
  }

  console.log('════ i18n keyize 重命名 ' + (args.write ? '（已落盘）' : '（dry-run，未写文件）') + ' ════');
  for (const s of summary) {
    console.log('== ' + s.dir + ' == ' + s.entries.length + ' 条改名；叶子键 ' +
      s.countBefore + ' → ' + s.countAfter + (s.countBefore === s.countAfter ? '（守恒）' : '（异常）'));
    for (const e of s.entries) console.log('  ' + e.from + ' → ' + e.to + (e.reason ? '  // ' + e.reason : ''));
  }
  if (!args.write) console.log('\n未带 --write，未写入任何文件。');
}

// ══════════════════════════════════════════════════════════════════════
// 入口
// ══════════════════════════════════════════════════════════════════════

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
      usage();
      return;
    }
    if (args.map) runApply(args);
    else runAudit(args);
  } catch (e) {
    console.error('错误：' + e.message);
    process.exitCode = 1;
  }
}

main();
