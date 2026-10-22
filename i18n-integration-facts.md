# index.html i18n 接入事实

> 规则见 `AGENTS.md §5 / §8`；本文件只记录事实（目录、脚本、批次、排除项、验证结果），不重复规则条文。
> 时间：2026-10-22　｜　范围：`index.html` + `locales/rent-user/` + `locales/rent-merchant/` + `scripts/i18n_*.mjs`；`swap.html` / `locales/swap/` 零改动。

## 1. 目录拆分

| 目录 | 内容 | zh-CN 叶子 | 五语文件 |
| --- | --- | --- | --- |
| `locales/rent-user/` | `common.*` + `user.*` + `demo.*` | 673 | zh-CN / en / id / th / zh-HK |
| `locales/rent-merchant/` | `common.*` + `merchant.*` + `demo.*` | 952 | 同上 |

- 拆分前 `locales/rent/` 1226 叶子（common 355 / user 280 / merchant 557 / demo 34），已删除；旧 `rent-translation-reference.html` 已删除。
- `common.*` + `demo.*` 两端镜像：389 键（拆分时点），`SHARED=0`。
- 生成产物：`locales/rent-user/i18n.rent-user.js`（`window.__RENT_I18N_USER__`）、`locales/rent-merchant/i18n.rent-merchant.js`（`window.__RENT_I18N_MERCHANT__`）；UTF-8 无 BOM、结尾换行、二次运行字节一致。

## 2. 脚本

| 脚本 | 作用 |
| --- | --- |
| `scripts/i18n_split.mjs` | 一次性拆分迁移（默认 dry-run，`--write` 落盘）；断言 669/946、五语键集一致、共享段逐字一致 |
| `scripts/i18n_bundle.mjs` | JSON → 两端经典 script 语言包；固定 `LANGS` 顺序，幂等 |
| `scripts/i18n_keyize.mjs` | `--audit` 批次区间体检（命中 / 未命中 / 命名候选）；`--apply-rename <map.json> [--write]` 按映射五语同改 |
| `scripts/i18n_check.mjs` | 改造：目录集 `['rent-user','rent-merchant','swap']`；`TERM` 三对；新增 `SHARED` 硬错误 |
| `scripts/i18n_reference.mjs` | 按分组产出：`rent-user` + `rent-merchant` 合并为**一张** `rent-translation-reference.html`（运行时并发读取两目录并扁平合并），`swap/` 单独一张 |

拆分后首次校验曾修正 7 处端间译法（均为同句中文两端不一致，改 `rent-merchant` 或 `rent-user` 侧译文，不改中文/键名）：

- `merchant.chargingDevice.empty`（en / id）
- `merchant.profile.searchStore`（en / id）
- `merchant.chargingOrder.title`（en）
- `user.search.placeholder`（en / id，为与 `swap` 及 `rent-merchant` 对齐，改的是 `rent-user` 侧；`swap/` 未改）

## 3. 运行期接入

- CDN：`vue-i18n@11` 全局生产构建（jsdelivr + `onerror` 回退 unpkg），位于 `index.html` L11-12。
- 语言包：L13-14 两个经典 `<script src>`（`file://` 可直接加载）。
- 实例：用户端 / 商户端各一个（`legacy:false` + `globalInjection:true` + `locale:'zh-CN'` + `fallbackLocale:'zh-CN'`），messages 各取本端包；`app.mount()` 前 `app.use(i18n)`。
- setup 内 `const t=(k,...a)=>i18n.global.t(k,...a)`；模板一律 `$t('key')`。
- 切换：`selectLang` / `selectLangFromLogin` 同步 `appLang`、`i18n.global.locale.value`、`document.documentElement.lang`；商户端既有缺陷（`appLangLabel` 恒「简体中文」、未设 `appLang`）已修复。
- `langOptions` 五语：en / zh-CN / zh-HK / id / th（末位追加 `ไทย`，label 为语言自称）。
- 日期：用户端流水两处 `toLocaleString(intlLocale, …)`；映射 `zh-CN→zh-CN`、`zh-HK→zh-HK`、`en→en-US`、`id→id-ID`、`th→th-TH`。

## 4. key 化批次（试点）

| 批次 | 用户端 | 商户端 |
| --- | --- | --- |
| 一 · 登录页 + 登录内语言页 | 登录模板（手机号/邮箱/账号三模式标签与 placeholder、获取验证码、协议、登录/注册、模式切换、选择环境、切换语言标题）；`LOGIN_MODE_OPTS`、`loginSwitchEntries`、`MSG`（computed）、登录相关 toast | 同口径 + `loginValid()` 12 条错误文案 |
| 二 · 首页 + Tab | 搜索地点、扫码充电、租赁入口、下拉刷新、未登录横幅、Tab（首页/我的爱车/我的） | 首页区块标题、订单/设备入口、告警类型与状态标签（`_ALERT_TYPE_MAP` / `ST_L` 改 computed + `t`）、`bizStats` / `vehStats` / `orderEntries`、Tab（首页/车辆/电池/我的） |
| 三 · 设置/语言页 + 版本弹窗 | 系统设置、通用设置、切换语言、当前版本、退出登录、退出 toast、版本弹窗 5 处 | 同口径（含 `protoForceUpdate` 分支） |

改写形态：文本 `{{ $t('k') }}`；静态属性 `:title` / `:placeholder`；JS `t('k')`；Tab `:items` 表达式内 `label:$t('k')`；占位符 `$t('k',{version})`（`common.version.latestVersion`）。

## 5. 排除清单（保持中文 / 不改）

- `data-*`（`data-page-node-id` / `data-od-id` / `data-cp` / `data-*`）、`class`、`style`、HTML 注释。
- `v-html="luci(...)"` 与图标名。
- `demo.*` 演示数据与「原型操作」面板文案（含 `demoLogin` / `demoLogout` 的 toast）。
- `langOptions` 语言自称、`toLocaleString` 参数、`new Date(...)` 字面量、正则、版本号（`V1.30.0` / `V1.3.8`）。
- 业务数据（门店名、VIN、告警 ID、时间值等）。
- 用户端首页 banner 标题（`rentBanners` / `homeBanners` 的 `title`，模板不渲染该字段）。
- 未纳入试点的其余页面（车辆/订单/钱包/换电等）仍为中文，不做 key 化。

## 6. 验证结果（2026-10-22）

- 内联脚本语法：1 个脚本块 `node --check` 通过。
- 标签配平：栈式校验通过（剔除注释、`<script>`、`<style>`）。
- 挂载冒烟：`.sheet-root` 111、静置 `.sheet-panel` 0（接入前基线同为 111 / 0），控制台 0 错误。
- 五语实机（Playwright）：双端登录页与首页、设置/语言页文案与 `$t` 期望值逐条一致；`<html lang>` 与所选语言一致；chip 标签与勾选跟随；商户端 chip 不再恒为「简体中文」。
- 英文首页残留中文：用户端仅「原型操作」面板；商户端仅门店名（业务数据）与「原型操作」面板。
- `node scripts/i18n_check.mjs` exit 0（MISSING / ORPHAN / PLACEHOLDER / SUFFIX / TERM / SHARED 全 0）；`node scripts/i18n_bundle.mjs` 幂等。

## 7. 已知边界 / 后续

- 语言选择为内存态，刷新回落 `zh-CN`（本次明确不做持久化）。
- 货币金额不随语言联动（`MONEY` / `fmtRp` 独立开关）。
- 同值多键归并（`merchant.chargingOrder.*` ↔ `common.*` 等）留待全量阶段；`common.orderStatus` 三个枚举键按「改值不改键」保留。
- 全量推广（其余页面 + 详情弹窗）另行决策；`swap.html` 是否接入另议。
