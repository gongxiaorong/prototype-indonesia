// i18n_bundle.mjs - 将租车系统 i18n 语言包打包为浏览器可直接加载的 JS 文件
// 读取 locales/rent-user/*.json → 输出 locales/rent-user/i18n.rent-user.js
// 读取 locales/rent-merchant/*.json → 输出 locales/rent-merchant/i18n.rent-merchant.js
// 零依赖，Node ESM。产物稳定可复现（同输入二次运行字节完全相同）。

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

// 固定语言顺序，产物内 key 顺序与之保持一致
const LANGS = ['zh-CN', 'en', 'id', 'th', 'zh-HK'];

// 读取单个语言 JSON（UTF-8，顺带剔除可能存在的 BOM）
function readLangFile(dir, lang) {
  const filePath = path.join(PROJECT_ROOT, dir, `${lang}.json`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const text = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  return JSON.parse(text);
}

// 收集对象全部叶子路径，用于检查各语言 key 集合是否一致
function collectLeafKeys(obj, prefix = '', result = new Set()) {
  if (obj === null || typeof obj !== 'object') {
    result.add(prefix);
    return result;
  }
  for (const [key, value] of Object.entries(obj)) {
    collectLeafKeys(value, prefix ? `${prefix}.${key}` : key, result);
  }
  return result;
}

// 轻量提示：仅打印差异，不中断流程（正式校验由 i18n_check.mjs 负责）
function reportKeyConsistency(bundle) {
  const keySets = {};
  for (const lang of LANGS) keySets[lang] = collectLeafKeys(bundle[lang]);

  const baseKeys = keySets[LANGS[0]];
  const diffs = [];
  for (const lang of LANGS.slice(1)) {
    const keys = keySets[lang];
    for (const key of baseKeys) {
      if (!keys.has(key)) diffs.push(`${lang} 缺失 ${key}`);
    }
    for (const key of keys) {
      if (!baseKeys.has(key)) diffs.push(`${lang} 多余 ${key}`);
    }
  }

  if (diffs.length) {
    console.warn(`  ! 五语 key 集合存在 ${diffs.length} 处差异（仅提示，不退出）：`);
    for (const line of diffs) console.warn(`    - ${line}`);
    console.warn('    如需正式校验请运行 node scripts/i18n_check.mjs');
  } else {
    console.log('  ✓ 五语 key 集合一致');
  }

  return Object.fromEntries(LANGS.map((lang) => [lang, keySets[lang].size]));
}

// 打包一组语言并写出产物
function buildBundle(srcDir, varName, outFile) {
  console.log(`[bundle] ${srcDir} → ${outFile}`);

  const bundle = {};
  for (const lang of LANGS) {
    bundle[lang] = readLangFile(srcDir, lang);
  }

  const counts = reportKeyConsistency(bundle);

  // 单行注释头 + 一行赋值；JSON.stringify 保证稳定可复现，结尾换行
  const output =
    '// 由 scripts/i18n_bundle.mjs 生成，勿手改\n' +
    `${varName}=${JSON.stringify(bundle)};\n`;

  const outPath = path.join(PROJECT_ROOT, srcDir, outFile);
  fs.writeFileSync(outPath, output, 'utf-8');

  // 自检：产物首字节不得为 BOM，末尾必须是换行
  const written = fs.readFileSync(outPath);
  if (written[0] === 0xef && written[1] === 0xbb && written[2] === 0xbf) {
    throw new Error(`产物包含 BOM：${outPath}`);
  }
  if (written[written.length - 1] !== 0x0a) {
    throw new Error(`产物未以换行结尾：${outPath}`);
  }

  const countText = LANGS.map((lang) => `${lang}=${counts[lang]}`).join(', ');
  console.log(`  ✓ 已写入 ${outPath} (${written.length} bytes)`);
  console.log(`  ✓ 叶子数：${countText}`);
}

buildBundle('locales/rent-user', 'window.__RENT_I18N_USER__', 'i18n.rent-user.js');
buildBundle('locales/rent-merchant', 'window.__RENT_I18N_MERCHANT__', 'i18n.rent-merchant.js');
