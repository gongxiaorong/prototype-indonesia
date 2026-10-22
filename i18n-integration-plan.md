# index.html 多语言（i18n）真实接入方案

> 范围：`index.html` + `locales/rent-user/*.json` + `locales/rent-merchant/*.json`。`swap.html` / `locales/swap/` 本次不接入。
> 配套需同步修订 `AGENTS.md §5 / §8`，建议条文见 §8。
> 2026-10-22 追加授权 A：接入期（key 化改写前）**允许对命名不合理的 key 重命名**（判定标准 / 硬约束 / 登记见 §5.1）。
> 2026-10-22 追加授权 B：**用户端 / 商户端语言文件拆分开**——`locales/rent/` 拆为 `locales/rent-user/`（common+user+demo）与 `locales/rent-merchant/`（common+merchant+demo），key 前缀保留；设计见 §3.1，实施为 Step 1。
> 2026-10-22 执行调整 C：**翻译对照表不拆端**——租车保持一张 `rent-translation-reference.html`（运行时并发读取 `rent-user` + `rent-merchant` 并扁平合并展示），`swap` 仍单独一张；下文凡提「rent 两张对照表」均按此口径执行。

## 1. 目标

1. **真实切换**：切换语言后，当前可见界面的文案（标题、列表项、按钮、输入框占位、卡片标签、说明文字、弹窗标题与按钮、轻提示）整体按所选语言呈现，无残留中文、无空白、不外露 key。
2. **补齐泰语**：语言列表 4 项 → 5 项，新增「ไทย」；各选项始终以自身语言名称显示，不随界面语言翻译。
3. **日期随语言**：流水等处日期时间由固定中文格式改为跟随所选语言。
4. **首期试点**：用户端登录页 + 登录内「切换语言」页、用户端首页、用户端「我的 → 设置 / 切换语言页」；商户端登录页、首页、设置/语言页。
5. **约束不变**：沿用零构建链路（`AGENTS.md §8`），保持**双击 file:// 直接打开可用**；布局/层级/动效/滚动与共享组件外观不变；未纳入试点的页面仍以中文正常显示。
6. **key 命名可修正**（2026-10-22 追加授权 A）：接入期（key 化改写之前）对**命名不合理**的 key 允许**重命名**，不再被迫沿用历史键名；判定标准、硬约束与登记流程见 §5.1。
7. **语言文件按端拆分**（2026-10-22 追加授权 B）：多语言文件由单一 `locales/rent/` 拆为 `locales/rent-user/` 与 `locales/rent-merchant/`，每端一套完整五语文件；key 路径不变（保留 `user.` / `merchant.` 前缀），`locales/rent/` 迁移校验后删除；详见 §3.1、Step 1。
8. **本次不做**：语言选择持久化（刷新回落 `zh-CN`）、货币金额随语言联动（`MONEY` 保持独立开关）、`demo.*` 演示面板翻译。

## 2. 现状核实（2026-10-22）

| 事实 | 位置 |
| --- | --- |
| 全文 **0 处** `t()` / `createI18n`；文案全为中文字面量 | `index.html` 全文 |
| CDN 引入区：UnoCSS L7 / Vue 3 生产构建（带 `onerror` 回退 unpkg）L8-9 / lucide L10 | L7-10 |
| `<html lang="zh-CN">` L2；`<title>` 中文 L6 | 切换时需同步 |
| **双端是两个独立 app**：用户端 `createApp` L7305、`registerSheetKit` L8553、`mount` L8554；商户端 `createApp` L8565、`directive('swipe-close')` L11470、`mount` L11472 | 同文件同页面 |
| 用户端：`appLang` L7803、`langOptions` L7804（**无 th**）、`appLangLabel` L7805；`loginOpenLang` L7894、`selectLangFromLogin` L7895、`selectLang` L8360（三者**均已设 `appLang`**） | 用户端 setup |
| 商户端：`appLang` L8568、`langOptions` L10360（**无 th**）、**`appLangLabel` L10361 恒返回 `'简体中文'`**；**`selectLang` L10362、`selectLangFromLogin` L10456 均未设 `appLang`** | 商户端 setup |
| ↑ 结论：**商户端语言选择当前完全无效**（标签也不变），属既有缺陷，本次一并修复 | 同上 |
| 语言入口 UI：用户端 chip L406、登录内语言页 L573-582、设置行 L2388-2391、语言 page L2701-2711；商户端 chip L3235、登录内语言页 L3406-3418、设置行 L6554-6557、语言 page L6573-6583 | 模板 |
| Tab 标签硬编码：用户端 L2722（首页/我的爱车/我的）；商户端 L6616（首页/车辆/电池/我的） | 模板数组字面量 |
| 首页区段：用户端 `tab==='home'` L2971（外层模板 L2955）；商户端 `tab==='home'` L3425 | 模板 |
| 日期硬编码 `toLocaleString('zh-CN',…)` | L2790、L2840 |
| 演示面板 `demo-ops-section` | L6801、L6817、L6825 等（不改） |
| `MONEY` L7012 / `fmtRp` L7014 | 本次不联动 |
| 文案源（拆分前）：`locales/rent/zh-CN.json` **1226 叶子词条** = `common` 355 + `user` 280 + `merchant` 557 + `demo` 34；en/id/th/zh-HK 齐全 | `locales/rent/` |
| 文案源（拆分后）：`rent-user` = 355+280+34 = **669**；`rent-merchant` = 355+557+34 = **946**（`common` 与 `demo` 各重复一份，两端合计 1615） | `locales/rent-user/`、`locales/rent-merchant/` |
| `i18n_check.mjs` **硬编码** `DIRS=['rent','swap']`（L34），且 `TERM` 段**硬编码** `if (dirFull.rent && dirFull.swap)`（L130）→ 目录一改必须改造 | `scripts/i18n_check.mjs` |
| `i18n_reference.mjs` 用 `readdirSync(locales)` **自动扫描一级目录**、产物名 `<目录名>-translation-reference.html`（L132/L141）→ 拆目录后自动出两张对照表；旧 `rent-translation-reference.html` 需删 | `scripts/i18n_reference.mjs` |
| `swap/` 顶层：`common` 356 / `user` 196 / `merchant` 312 / `demo` 146 / `demoOps` 78 / `action` / `appName` / `frame` / `label` / `pageTitle` / `placeholder` —— 跨目录 `TERM` 口径受拆分影响（§3.1） | `locales/swap/` |
| `locales/rent` 被 **6 个文件**引用：`AGENTS.md`、`i18n-cross-drift.md`、`i18n-key-naming.md`、`i18n-internal-align.md`、`notify-events-timing.md`、本方案 | 拆分后路径需同步 |
| 工具链：`scripts/i18n_check.mjs`（五语硬校验）、`scripts/i18n_reference.mjs`（对照表，需 http） | 拆分后**需改造**（§3.1） |

## 3. 架构决策

| 项 | 决策 |
| --- | --- |
| 运行库 | CDN **vue-i18n v11 全局生产构建**（`legacy:false` + `globalInjection:true`），引入写法同现有 Vue（含 `onerror` 回退） |
| 语言包产物 | **两个**：`locales/rent-user/i18n.rent-user.js`（`window.__RENT_I18N_USER__`）+ `locales/rent-merchant/i18n.rent-merchant.js`（`window.__RENT_I18N_MERCHANT__`）；经典 script + 全局变量，**提交入库**；用户端实例只用 USER 包、商户端只用 MERCHANT 包 |
| 权威源 | 拆为两目录：`locales/rent-user/*.json`（common+user+demo）、`locales/rent-merchant/*.json`（common+merchant+demo）；各自 `zh-CN.json` 即该端权威源，JSON 改动后重跑生成脚本 |
| 新增脚本 1 | `scripts/i18n_split.mjs`（一次性拆分迁移 + 断言，见 §3.1），零依赖 Node ESM |
| 新增脚本 2 | `scripts/i18n_bundle.mjs`（JSON → 两端语言包），零依赖 Node ESM |
| 新增脚本 3 | `scripts/i18n_keyize.mjs`（试点区段比对 / 改写 / 核对报告；兼 **key 命名体检与重命名落盘**，见 §5.1），零依赖 Node ESM |
| key 重命名 | **允许**（接入期窗口，key 化前执行）；判定标准 / 五语同改 / 映射表 / 登记见 §5.1 |
| 既有脚本 | **需改造**：`i18n_check.mjs`（目录列表 / `TERM` 三对比对 / 新增 `SHARED` 硬错误）、`i18n_reference.mjs`（路径与产物名同步，扫描逻辑天然自适应） |
| 构建链路 | 不引入 npm / 打包 / typecheck |

### 3.1 语言文件拆分（2026-10-22 决策 B）

**布局与内容映射**

| 目录 | 内容 | zh-CN 叶子数 |
| --- | --- | --- |
| `locales/rent-user/` | `common.*` + `user.*` + `demo.*` | 355 + 280 + 34 = **669** |
| `locales/rent-merchant/` | `common.*` + `merchant.*` + `demo.*` | 355 + 557 + 34 = **946** |
| `locales/rent/`（旧） | 迁移校验通过后**删除**，避免双权威源 | 1226 |

- **key 前缀保留**：端文件内仍是完整点路径（`user.home.title` / `common.action.confirm` / `merchant.home.*`），故 `index.html` 的 `t()` 写法与 §5.1 重命名的路径口径**完全不变**，HTML 侧零风险。
- **共享段双份**：`common.*`（355）与 `demo.*`（34）在两端各存一份（已确认）；后续新增/修改这两段**必须两端同改**。
- **补强校验 `SHARED`（新增硬错误，计入 exit code）**：`common.*` + `demo.*` 段在 `rent-user` ↔ `rent-merchant` 之间，**key 集合与五语值必须逐字相同**。必要性：`MISSING` / `ORPHAN` 只比对"同目录内 源 ↔ 派生"，`TERM` 只按 zh-CN 值锚点比对"两端共有的同中文"，二者都**抓不到**「某端 common 段单独多/少一个 key」这类漂移。
- **迁移工具** `scripts/i18n_split.mjs`（幂等、默认 dry-run，`--write` 落盘）：读 `locales/rent/*.json` → 生成两端各 5 个文件（保序、2 空格缩进、无 BOM、结尾换行），并断言：两端叶子数 `669 / 946`、五语键集合一致、`common` + `demo` 段两端逐字一致。
- **语言包**：由 `i18n_bundle.mjs` 一次生成两个产物；`index.html` 引两个 `<script src>`。
- **体积影响（如实记录）**：两端包合计 **1615** 条，比原单包 1226 条多 **389 条（+32%）**，因 `common` 与 `demo` 各重复一份——这是"每端一套完整文件"的既定代价。旧产物 `locales/rent/i18n.rent.js`、`rent-translation-reference.html` 迁移后一并删除。

**跨目录 `TERM` 口径的连带变化（须预期）**：改造后 `TERM` 由「`rent` ↔ `swap`」一对扩展为三对——`rent-user ↔ swap`、`rent-merchant ↔ swap`（等价于原口径）、以及**新增的** `rent-user ↔ rent-merchant`（原同目录内不比对端段中文译法）。首次运行可能暴露既有的"用户端段 ↔ 商户端段"同中文译法漂移，处理口径：以一端为准修正译文，或按 §7 登记例外。

**受影响文档（路径同步）**：`AGENTS.md`、`i18n-cross-drift.md`、`i18n-key-naming.md`、`i18n-internal-align.md`、`notify-events-timing.md` 中的 `locales/rent/` 引用改为新目录名；**条目内容与键名本身不变**。

**为何用经典 script**：`file://` 下 `fetch()` 与 `<script type="module">` 的 import 均受 CORS 限制，而项目要求双击直开。

**实例与注入**：各端各建实例（与"两端各一份 `appLang`"语义一致，互不影响）；**messages 各取本端语言包**（用户端 `__RENT_I18N_USER__`、商户端 `__RENT_I18N_MERCHANT__`，见 §3.1）。

```js
/* mountUser 内取 window.__RENT_I18N_USER__；mountMerchant 内取 window.__RENT_I18N_MERCHANT__
   均在 app.mount(root) 之前 */
const i18n=VueI18n.createI18n({legacy:false,globalInjection:true,locale:'zh-CN',
  fallbackLocale:'zh-CN',messages:window.__RENT_I18N_USER__||{}});
app.use(i18n);
const {t}=VueI18n.useI18n({useScope:'global'});
/* 模板内一律 $t('key')（globalInjection 后 in-DOM 模板与子组件模板均可用，
    参照 luci 走 globalProperties 兜底的既有结论 L7111-7116）；JS 内用 t('key') */
```

**语言标识映射**：`zh-CN→zh-CN`、`zh-HK→zh-HK`、`en→en`（Intl 用 `en-US`）、`id→id`（Intl 用 `id-ID`）、`th→th`（Intl 用 `th-TH`）。

**语言列表**：双端 `langOptions` 保持现有相对顺序、**末尾追加 th**（避免既有截图/断言位移）：`en / zh-CN / zh-HK / id / th`，label 用自称 `English / 简体中文 / 繁體中文（中國香港）/ Bahasa Indonesia / ไทย`。

## 4. 实施步骤

**Step 0 基线**：记录双端 `.sheet-root` 计数、试点页截图、控制台错误数。挂载失败**不得**用 `app._instance`（生产构建为 `null`）判定，用 DOM 判据（`AGENTS.md §6.3/6.4`）。

**Step 1 拆分语言文件**（`scripts/i18n_split.mjs`，见 §3.1）
- 读 `locales/rent/*.json` → 生成 `locales/rent-user/*.json`（`common` + `user` + `demo`）与 `locales/rent-merchant/*.json`（`common` + `merchant` + `demo`），五语齐全，**key 路径原样保留**。
- 断言：两端叶子数 `669 / 946`、各端五语键集合一致、`common` + `demo` 段两端逐字一致。
- 通过后**删除** `locales/rent/` 与旧 `rent-translation-reference.html`。
- 判据：`git status` 仅"新增两目录 + 删除旧目录"；总键数守恒（669 + 946 = 1615 = 1226 + 355 + 34）。

**Step 2 改造校验工具链**
- `i18n_check.mjs`：`DIRS = ['rent-user','rent-merchant','swap']`；`TERM` 由硬编码的 `dirFull.rent && dirFull.swap` 改为三对（`rent-user↔swap`、`rent-merchant↔swap`、`rent-user↔rent-merchant`）；**新增 `SHARED` 硬错误**（`common` + `demo` 两端 key 集合与五语值逐字一致）。
- `i18n_reference.mjs`：扫描逻辑（`readdirSync(locales)`）无需改，跑一次即生成 `rent-user-translation-reference.html` / `rent-merchant-translation-reference.html`，确认 `{{DIR}}` 注入的 fetch 路径正确。
- 判据：`node scripts/i18n_check.mjs` exit 0；两张对照表生成、可 http 打开。
- 若出现新增 `TERM`（端间译法漂移）：**先按 §3.1 口径修正译文再继续**，不带着报错做 key 化。

**Step 3 生成两端语言包**（`scripts/i18n_bundle.mjs`）
- 输入两端各 5 个 JSON → 输出 `locales/rent-user/i18n.rent-user.js`（`window.__RENT_I18N_USER__`）与 `locales/rent-merchant/i18n.rent-merchant.js`（`window.__RENT_I18N_MERCHANT__`）：`{ 'zh-CN':{…}, en:{…}, … };`
- 要求：零依赖、UTF-8 **无 BOM**、结尾换行、**幂等**、按固定 `LANGS` 顺序输出；脚本内附一次 key 集合一致性提示（不替代 `i18n_check.mjs`）。
- 命令 `node scripts/i18n_bundle.mjs`；判据：两个产物均存在且无 BOM，二次运行 `git diff` 为空。

**Step 4 引入运行库 + 注入 i18n（不动任何文案）**
- L8-9 之后新增 vue-i18n CDN（含 `onerror` 回退）+ 两个语言包 `<script src>`；双端按 §3 各自建实例（用户端 messages 取 USER 包、商户端取 MERCHANT 包）。
- 判据：**可见文案与接入前逐字一致**，控制台 0 错误，`.sheet-root` 计数不变。

**Step 5 key 命名体检与重命名（先做，排在 key 化改写之前；判定标准见 §5.1）**
- `node scripts/i18n_keyize.mjs --audit`：扫批次区段命中的 key，按 §5.1 输出候选清单（命中规则 / 旧 key / 建议新 key / 理由）。
- 人工逐条确认后 `--apply-rename rename-map.json --write`：**按端写入**（用户端 → `rent-user`，商户端 → `rent-merchant`），`common.*` / `demo.*` 变更**两端同改**；默认 dry-run，未带 `--write` 不落盘。
- 判据：五语叶子键数与改名前一致、键集合一致、`i18n_check.mjs` exit 0（含 `SHARED`）；结果登记进 `i18n-key-naming.md`。
- 该窗口不可后移：key 化一旦落盘，改名需同步改 HTML 全部引用（成本显著上升）。

**Step 6 key 化（三批：登录页 + 登录内语言页 → 首页含 Tab → 设置/语言页；用户端先做，商户端同口径）**
- `scripts/i18n_keyize.mjs` 扫批次行区间，产出映射报告：**命中**（按 zh-CN 值锚定匹配 key，`AGENTS.md §5` 判定锚点即中文值；已按 Step 5 改名者一律用**新 key**；用户端区段只查 `rent-user`，商户端区段只查 `rent-merchant`）/ **未命中**（待新建）。
- 改写形态：文本节点 → `{{ $t('k') }}`；静态属性 → `:title="$t('k')"` / `:placeholder="$t('k')"`（`nav-bar title="切换语言"` L2702/L6574/L575 等属此类）；JS 字符串（`toast(...)`、`loginErr`、computed 映射）→ `t('k')`。
- 含变量的文案用 vue-i18n `{name}` 占位符（如 `已选 {n} 张`），不得字符串拼接。
- **必须逐条人工核对**改动清单后再落盘（L11044 行文件的大规模改写风险点：标签配平、`new Function(code)` 语法自检、in-DOM 模板对 `{{ }}` 的解析）。
- 判据：每批改完立即跑 Step 9 自检，批次内可见文案随语言切换而变化。

**Step 7 切换链路改造**
- 双端 `selectLang` / `selectLangFromLogin` 追加 `i18n.global.locale.value=id` 与 `document.documentElement.lang=id`；修复商户端 L10361 `appLangLabel` 恒值缺陷与 L10362/L10456 未设 `appLang` 缺陷。
- `langOptions` 补 th（双端）。
- 日期本地化：L2790 / L2840 的 `toLocaleString('zh-CN',…)` 改为按当前语言取 Intl locale（§3 映射表）。
- 判据：五语逐一切换，试点页文案 + 日期 + 语言列表勾选 + chip 标签同步变化；未试点页面保持中文且无报错。

**Step 8 缺失词条补齐**
- 新建 key 归属：用户端 `user.*`（写 `rent-user`）、商户端 `merchant.*`（写 `rent-merchant`）、通用 `common.*`（**两端同改**）；遵守 §5 术语基线（车辆/押金/退款、货币简称 CNY/HKD/IDR、VIN/KYC/SN 在 en/id/th 保持原文）。
- 五语必须齐（否则 `i18n_check.mjs` 报 `MISSING`）；初稿允许机翻但须标注 **「机器初翻·待复核」**，并输出复核清单（建议 `i18n-pending-review.md`）。
- 完成后**重跑 Step 3 生成脚本**；判据：无 `MISSING/ORPHAN/PLACEHOLDER/SUFFIX/TERM/SHARED` 硬错误（exit 0）。

**Step 9 自检与验收**（按 `AGENTS.md §6`）
1. 内联脚本语法：提取 `<script>` 跑 `new Function(code)`。
2. 标签配平（栈式校验 div/page/transition，避免注释内示例标签误报）。
3. 挂载冒烟：双端 `.sheet-root` 计数符合预期，静置 `.sheet-panel` 为 0。
4. 浏览器逐页抽查：五语各看一遍试点页 + 弹窗 + toast，控制台 0 错误。
5. `node scripts/i18n_bundle.mjs`（幂等）、`node scripts/i18n_check.mjs`（全绿）。

**Step 10 规范落地**
- 修订 `AGENTS.md §5 / §8`（§8）；同步 5 份既有文档中的 `locales/rent/` 路径引用（§3.1）；新增事实文档（建议 `i18n-integration-facts.md`）记录 key 化批次、排除清单、待复核清单——**明细写事实文档，规则写 AGENTS.md**。

## 5. key 化规则

- **命中优先复用**：以 zh-CN 值锚定现有 key，不重复造 key；同句中文已受"一句中文一个译法"约束，映射唯一。
- 改写形态：文本 → `{{ $t('k') }}`；静态属性 → `:attr="$t('k')"`；JS 字符串 → `t('k')`；带变量 → 占位符。
- **必须排除**：`data-*`（`data-page-node-id` / `data-od-id` / `data-cp`）、`class` / `style`、HTML 注释、`v-html="luci(...)"` 调用、`demo.*` 演示假数据、`langOptions` 的语言自称、`toLocaleString` 参数、正则与技术标识符、`new Date(...)` 字面量。
- **写入位置按端归属**（拆分后）：用户端区段的 key 落 `locales/rent-user/*.json`；商户端区段落 `locales/rent-merchant/*.json`；通用文案落两端 `common.*` 段且**必须两端同改**（§3.1 的 `SHARED` 为硬错误）。
- **复用范围限于本端表**：用户端区段不复用"只存在于商户端"的 key（反之亦然）；若确认该文案属通用语义，按 §5.1 判定升为 `common.*`（两端同加）。

### 5.1 key 重命名（2026-10-22 授权 A）

**窗口期**：`index.html` 当前 0 处 `t()` 引用，key 无任何代码引用，重命名只动 JSON；key 化落盘后每次改名都要同步改 HTML 引用，成本显著上升。故命名体检**必须排在 key 化改写之前**（Step 5）。

**判定标准**——「不合理」= 命中以下任一（依据 `i18n-key-naming.md` + `AGENTS.md §5`）：
1. **通用文案挂在专有语境位**：值 ∈ 通用词表（确定 / 取消 / 完成 / 至 / 其他 / 保存成功 / 复制成功 / 我知道了 / 收起 / 排序 / 启用 / 禁用 / 处理中…）却落在 `common.orders.*` / `common.profile.*` / `user.*` / `merchant.*`，应迁至 `common.action.*` / `common.label.*` / `common.dateTime.*` / `common.toast.*` / `common.status.*`（该口径 2026-09-29 已落地 19 条，可作历史参照）。
2. **键名与值语义已不符**：值改过多轮而键名停在旧语义（历史实例：`deductReminderBody → renewSuccessBody`、`channelOs → channelPhone`、`messagePush → messageNotify`、`categoryOrderRenewDesc → categoryOrderStatusDesc`）。
3. **数字后缀残留**（`menu.home0` 类）：`AGENTS.md §5` 口径为「出现即改/删」。
4. **命名空间层级错位**：本属 `common.*` 的共用术语却只在单端重复定义，造成同一句中文多键并存。
5. **键名无语义或缩写歧义**，无法从键名推定其承载文案。
- **不算不合理（不改）**：描述式长键名（如 `continuousPaymentFailed`）、`demo.*` 演示数据键、已成对约定的 `*Title` / `*Body` 与 `categoryXxx` 前缀。

**硬约束**：
- **五语同路径改名**（`zh-CN / zh-HK / en / id / th` 同步）——否则 `i18n_check.mjs` 立即报 `MISSING` + `ORPHAN`。
- **只改键路径，不改值**（改值属另一议题）；改后同句中文仍只有一份译法，无新增漂移。
- 跨目录 `TERM` 以 **zh-CN 值为锚点**，键名变化不影响判定；若重命名伴随**并键 / 删键**导致某句中文在相应端目录消失，按既有做法在 `i18n-cross-drift.md` 登记。
- `common.*` / `demo.*` **在 `rent-user` ↔ `rent-merchant` 之间必须镜像**（§3.1 的 `SHARED` 硬错误）→ 这两段的重命名**必须两端同改**；与 `swap/` 之间仍**不要求**键集镜像，本次不动 `swap/`。
- **范围收敛**：只处理「Step 6 批次命中集 + 全局明显违规项（数字后缀、键名与值明显不符）」，不做全量大改名（避免 diff 失控、超出试点边界）；跨语言集的全局改名留待全量阶段。
- **必须产出映射表并逐条人工核对**（旧 key / 新 key / 理由 / 命中规则 / 目标端），**不允许脚本无审核自动改名**。
- 落盘后必跑四件事：`node scripts/i18n_check.mjs`（硬错误全 0，含 `SHARED`）→ `node scripts/i18n_bundle.mjs` 重生成两端语言包 → `node scripts/i18n_reference.mjs` 重生成两张对照表 → 确认 `swap/` 未被改动。

**工具**：`scripts/i18n_keyize.mjs` 兼任 `--audit`（体检报告，dry-run）与 `--apply-rename <map.json> --write`（按映射表改**目标端**五语 JSON：保序、2 空格缩进、无 BOM、结尾换行，并断言「五语叶子键数与改名前一致」；`common.*` / `demo.*` 自动两端同改）。`i18n_check.mjs` 已按 Step 2 改造（目录 / `TERM` 三对 / `SHARED`），`i18n_reference.mjs` 随目录自适应。

**登记**：重命名结果追加登记到 `i18n-key-naming.md`——该文件是 key 命名口径的登记处，历史各轮修订（含 `channelOs → channelPhone` 等）均登记于此。

## 6. 验收清单

- [ ] 双击 `index.html`（`file://`）可正常打开，双端挂载正常、控制台 0 错误。
- [ ] 五语切换后，试点四处（用户端登录/语言页、首页、设置/语言页；商户端同口径）文案真实变化，无残留中文与空白。
- [ ] 语言列表 5 项、选项自称显示、勾选与 chip 标签正确（含商户端既有缺陷已修）。
- [ ] 流水日期随语言变化；`<html lang>` 同步。
- [ ] 语言文件已拆为 `locales/rent-user/`（669 条）与 `locales/rent-merchant/`（946 条）两目录、五语齐全；旧 `locales/rent/` 与旧产物已删除。
- [ ] `SHARED` 校验通过：`common.*` + `demo.*` 两端 key 集合与五语值逐字一致。
- [ ] 两个语言包产物（USER / MERCHANT）已生成、无 BOM、幂等；`index.html` 双 `<script src>` 生效，两端各用自己那份。
- [ ] 两张对照表（`rent-user-` / `rent-merchant-translation-reference.html`）已生成且可打开；旧 `rent-translation-reference.html` 已删。
- [ ] `node scripts/i18n_check.mjs` exit 0（`MISSING/ORPHAN/PLACEHOLDER/SUFFIX/TERM/SHARED` 全 0）；`node scripts/i18n_bundle.mjs` 幂等。
- [ ] 未试点页面仍为中文、无报错；布局/动效/滚动与改动前一致。
- [ ] 新增词条均有五语，机翻初稿已标注并列出复核清单。
- [ ] key 重命名（如有）已五语同改、有映射表与人工核对记录、目标端正确、已在 `i18n-key-naming.md` 登记，且五语叶子键数与改名前一致。
- [ ] 5 份既有文档（`AGENTS.md` / `i18n-cross-drift.md` / `i18n-key-naming.md` / `i18n-internal-align.md` / `notify-events-timing.md`）中的 `locales/rent/` 引用已同步为新目录名；`swap/` 未受影响。

## 7. 风险与回滚

| 风险 | 应对 |
| --- | --- |
| 11044 行文件大规模改写导致标签配平/语法错误 | 分三批小步提交；每批跑 §6.1/6.2 自检；保留批次清单便于回滚 |
| 重命名过早扩散或漏改某语言，引发 `MISSING` / `ORPHAN` | 五语同路径同改 + 脚本断言键数一致 + 落盘后立即跑 `i18n_check.mjs`；范围收敛在批次命中集 |
| 重命名打乱既有文档中的键名引用（`i18n-key-naming.md` / `notify-events-timing.md` / `i18n-cross-drift.md` 等） | 映射表即改名单；按需在受影响文档补记「旧名 → 新名」，历史条目不回改 |
| 按中文值匹配误命中（同句不同义） | 报告逐条人工核对；存疑项不自动改写 |
| 机翻初稿质量 | 全部标注「机器初翻·待复核」+ 清单；术语基线自动校验（`TERM`） |
| 语言包产物与 JSON 漂移 | 产物由脚本生成并入库；`i18n_bundle.mjs` 幂等 + 提交前重跑 |
| `$t` 在 in-DOM 模板不可用 | 依赖 `globalInjection:true`；若失效，退回 `globalProperties.$t` 兜底（同 `luci` 既有做法） |
| 拆分后 `common` / `demo` 双份漂移（某端单独增删 key） | 新增 `SHARED` 硬错误纳入 exit code；这两段改动必须两端同改，每次校验都会拦截 |
| 拆分裂出的 `rent-user ↔ rent-merchant` `TERM` 比对暴露既有端间译法漂移 | 确属漂移：以一端为准修正译文；确属合理差异：登记进 `i18n-cross-drift.md`，不留长期红灯 |
| 拆分导致 5 份文档 + 2 个脚本中的 `locales/rent/` 路径引用失效 | Step 1/2/10 集中同步；以 `locales/rent-user\|rent-merchant` 精确检索复核无遗漏 |
| 语言包体积增大（1615 条 vs 1226 条，+32%） | 如实记录为「每端一套完整文件」的既定代价；若后续要求瘦身，再评估"共享段单文件 + 运行时合并"（本次不做） |

## 8. AGENTS.md 修订口径（建议条文）

**§5「多语言（i18n）」**——将"两端 HTML 都不写 `t('key')` 调用，保持中文字面量"改为**分状态表述**：

- `rent-user/` + `rent-merchant/`（`index.html`）：**已接入 vue-i18n**，模板文案一律 `$t('key')`、JS 文案一律 `t('key')`，禁止中文字面量硬编码；`locales/rent-user/*.json` 与 `locales/rent-merchant/*.json` 为各端权威源，`i18n.rent-user.js` / `i18n.rent-merchant.js` 为**生成产物**（不得手改，JSON 变更后必须重跑 `node scripts/i18n_bundle.mjs`）；`common.*` / `demo.*` 在两端**必须镜像**（`SHARED` 硬错误）。
- `swap/`（`swap.html`）：**待接入**，仍保持中文字面量，`locales/swap/*` 为分离文案源。

同节"变更流程"中「禁止机翻直接入库」调整为：**新增词条允许机翻初稿入库，但必须在译文或清单中标注「机器初翻·待复核」并输出复核清单**；禁止的是"无标注的机翻"与"中文常驻译文"。

**§5「目录与命名空间划分」同步**：目录口径由「`rent/`（`user.` / `merchant.` / `demo.`）+ `swap/`」改为「`rent-user/`（`common.` + `user.` + `demo.`）+ `rent-merchant/`（`common.` + `merchant.` + `demo.`）+ `swap/`」；补充说明：`common.*` 与 `demo.*` 在 rent 两端之间**必须镜像**、与 `swap/` 之间仍不要求键集镜像。

**§8「命令与环境」**——"无构建链路"补充：允许新增**零依赖 Node 脚本**（`scripts/i18n_split.mjs`、`scripts/i18n_bundle.mjs`、`scripts/i18n_keyize.mjs`），不引入 npm/打包/typecheck；命令表更新：

| 用途 | 命令 |
| --- | --- |
| 拆分语言文件（一次性迁移，幂等） | `node scripts/i18n_split.mjs --write`（默认 dry-run） |
| 生成两端语言包（JSON → JS） | `node scripts/i18n_bundle.mjs`（改任一端 `*.json` 后必跑） |
| 五语校验（含 `SHARED`） | `node scripts/i18n_check.mjs` |
| 生成两张对照表 | `node scripts/i18n_reference.mjs` |

并新增事实文档条目：`i18n-integration-facts.md`（key 化批次、排除清单、待复核清单）。

**§5「命名空间划分」补充**（配合 §5.1）：key 命名遵循 `i18n-key-naming.md` 的通用子命名空间口径；**接入期（key 化改写前）允许对命名不合理的 key 重命名**——须五语同路径同改、产出映射表、经人工逐条核对、按端写入（`common.*` / `demo.*` 两端同改），并登记进 `i18n-key-naming.md`；禁止脚本无审核自动改名。

## 9. 后续全量推广（试点验收后再议）

- 试点通过后按同样三批制把剩余页面（用户端车辆/我的/订单、商户端电池/车辆/我的及各详情页与弹窗）纳入 key 化范围。
- 全量阶段仍可继续重命名，但彼时 key 已被 `index.html` 引用，改名须同步改 HTML 引用并重跑全部自检、成本更高——故**命名体检集中在试点窗口期完成**。
- 拆分后按端交付翻译、按端增量替换语言包都更直接；若共享段（`common.*` / `demo.*`）继续膨胀，可再评估"共享段单文件 + 生成期合并"（本次按双份执行）。
- `swap.html` / `locales/swap/` 是否按同一机制接入（含是否同样按端拆分），另行决定。
- 语言持久化、货币与语言联动为独立议题（本次明确不做）。