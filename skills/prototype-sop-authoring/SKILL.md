---
name: prototype-sop-authoring
description: 为本仓库的 Vue3 单文件原型（index.html / swap.html）制作带实机截图的端到端操作手册（SOP / 使用说明）。当用户提出「制作 XX 端的 SOP」「生成操作手册」「给原型写使用文档」「批量截取原型页面」，或需要新增、修订 docs 目录下某一端的使用手册时使用。涵盖范围确认、Playwright 驱动原型截图、手册结构与样式规范、目录与 H5 适配坑位、静态与实机双重校验。
---

# 原型 SOP 操作手册制作

## Overview

为单文件 Vue3 原型产出「带实机截图 + 业务规则准确」的操作手册：先驱动原型走完全链路截图，再按既定样式规范写成单文件 HTML 手册，最后做静态与实机双重校验。产物固定落在 `docs/<端>-rental-sop/`（`index.html` + `images/`）。

## 适用场景

- 用户端手册已存在（`docs/user-rental-sop/`），需新增另一端（如商户端）手册。
- 原型改版后需同步更新手册截图或正文。
- 为单个模块（订单、告警、设备）单独出子手册。

## Workflow

### Step 0 先与用户确认范围

动手前必须确认两点，不要默认：

1. **模块范围**：全模块完整版 / 指定模块子集。
2. **弹窗深度**：全部细分弹窗逐个截图（订单资料、退款记录、改价记录、费用明细、支付渠道拆分等）/ 仅主流程页面。

### Step 1 摸清目标端的页面与驱动函数

用 code-explorer 子代理（thoroughness: very thorough）探查 `index.html`，输出「步骤 → 状态变量 → 截图目标」清单：

- 目标端模板行域（`#root-user` 用户端 / `#root-merchant` 商户端）与 setup 逻辑行域。
- 每个页面/弹窗的 overlay 变量真实名称（如 `ordersOV` / `ordersMod` / `roOV` / `profileOV` / `profileSub` / `battMod`）与驱动函数名。
- 种子数据与初始状态（商户端 `orders` 初始为空，截图前需注入）。
- 关键规则原文位置（状态映射、`v-if` 条件、校验、确认文案）。

踩坑记录：源码变量名常与直觉不同（电池弹窗是 `battMod` 而非 `battConfirmMod`）。一律以 `search_content` 搜到的真实定义为准，不要凭命名猜。

### Step 2 编写截图脚本

复制 `scripts/shoot-merchant-sop.py` 的结构改造，不要从零写。核心约定见 [references/drive-prototype.md](references/drive-prototype.md)：

- `sync_playwright`，viewport 560×1010，`device_scale_factor=2`，本地 `python -m http.server 8139`。
- `INIT_JS`：点击 `#host-bar .modes button[data-mode="single-m"]` 切端；注入样式隐藏 `#host-bar` 与 `.demo-ops-stack`；挂 `window.__T`（`p()` 取 proxy、`clear()` 清 toasts、`ops(on)` 显隐操作栏、`scroll()`、`snap()`）。
- `step(label, code)` 模式：执行状态 JS → `clear()` → 截图目标根节点。
- 图片命名 `<两位序号>-<语义>.png`，序号连续，每个弹窗单独一步。

### Step 3 跑图并抽查

跑完先看 `FAILS`，再逐张打开抽查关键图（首页 / 列表 / 详情 / 每个弹窗）至少 10 张。常见污染：toast 残留（截图前必须 `clear()`）、演示操作栏露出、页面停在错误 tab。发现即修脚本重跑，不要带病进入写文档阶段。

### Step 4 提取业务规则原文

再用子代理按「状态映射 / 操作入口 `v-if` / 校验规则 / 确认与提示文案」分组摘录源码原文。手册中每条规则都必须能对应源码，禁止凭印象编写。

### Step 5 撰写手册正文

以 `docs/user-rental-sop/index.html` 为样式模板，`docs/merchant-rental-sop/index.html` 为结构范例。完整规范见 [references/handbook-conventions.md](references/handbook-conventions.md)：

- 结构：封面 `header.cover` → `details.toc` 目录 → 阅读指引 `#ch0` → 每章 `<section class="chapter" id="chN">` → 步骤 `<h3 class="step" id="sN-M">` → `<figure>` 引图（图注「图 N　标题」）→ FAQ `<details class="faq">` → 附录速查表。
- 大文件分次写入：先写骨架并留 `<!--APPEND-->` 占位，再逐章 `replace_in_file` 替换占位，避免单次输出超限。
- 视觉基调：主色 `#FF5F00`，金额用印尼盾 `Rp` 千分位，全中文文案，图片 248px 圆角卡片。

### Step 6 双重校验

静态（写一次性 python 脚本，跑完即删）：

- `src="images/..."` 全部命中，无缺失、无冗余；`APPEND` 占位清零。
- 标签配平（`section/figure/figcaption/table/details/div/tr/td/ol/li/p`）；TOC 链接数 == 章节数 + 步骤数。

实机（Playwright MCP）：

- 所有 `img` 的 `naturalWidth` 非 0（无坏图）。
- 桌面 1280 与 iPhone 13 两档截图核对封面、吸顶目录、表格横向滚动、图片排布、回顶按钮。
- 目录硬规则逐条在浏览器里验证（见下）。

### Step 7 清理

删除临时校验脚本（`scripts/_check_*.py`）与 `_verify` 截图目录，`docs/` 下只留正式产物。全程只读探查 `index.html` / `swap.html`，不得修改。

## 目录硬规则（每次必查）

1. **序号重复**：`<ol>` 自带自动序号，会与条目文本的「第 N 章 / x.y」撞成「2. 第 1 章」。两级 `.toc ol` 都要 `list-style:none`。
2. **独立滚动**：`.toc` 需 `max-height:calc(100vh - 56px)` + `overflow-y:auto`；`summary` 用 `position:sticky; top:0` + 白底常驻。
3. **吸顶不穿帮**：顶距必须放 `summary` 的 `padding-top`，不能放容器 `padding-top`；否则滚过的条目会从标题上方露出。移动端断点同理（容器 `padding:0 16px 12px` + `summary{padding-top:12px}`）。
4. **不用 `overscroll-behavior:contain`**：目录滚到底后滚轮会被吃掉，正文跟着滚不动。滚动条必须可见（`scrollbar-width:thin` + `::-webkit-scrollbar` 样式）。

## 其他硬规则

- 手册规则必须溯源到 `index.html` 原文；拿不准回读源码，不猜。
- 截图脚本与手册分离：脚本留在 `scripts/`，图片留在 `docs/<端>-rental-sop/images/`，手册只写相对路径 `images/`。
- 二进制图片提交前确认数量与命名；手册改动与原型改动分成两个 commit。
- 临时脚本 / 截图目录用后即删。

## Resources

- [references/drive-prototype.md](references/drive-prototype.md) — Playwright 驱动原型的最小可用骨架、`__T` 助手、截图步骤模式与已知坑位。
- [references/handbook-conventions.md](references/handbook-conventions.md) — 手册完整 CSS、HTML 骨架、ID / 图注约定、移动端与打印适配、校验清单。
- 仓库内范例：`scripts/shoot-merchant-sop.py`（截图脚本）、`docs/user-rental-sop/index.html`（样式模板）、`docs/merchant-rental-sop/index.html`（最全结构范例）。
