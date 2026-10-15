# 手册结构与样式规范

本文件是 `docs/<端>-rental-sop/index.html` 的完整规范。直接复用下方 CSS 与骨架；目录相关规则已内置历史修复，**不要回退**。

## 目录布局

```
docs/<端>-rental-sop/
├── index.html      # 单文件手册（样式 + 正文 + 少量 JS）
└── images/         # <两位序号>-<语义>.png，例：30-order-list.png
```

手册内只写相对路径 `images/xx-xxx.png`，不要写绝对路径。

## 规范 CSS（直接整段复用）

```css
:root{
  --ink:#1F1B18; --ink-2:#57504A; --ink-3:#8E857D; --line:#EDE7E2;
  --brand:#FF5F00; --brand-ink:#D94F00; --brand-soft:#FFF4EC; --brand-line:#FFE2D1;
  --bg:#F8F6F4; --card:#fff;
}
*{box-sizing:border-box}
body{
  margin:0; background:var(--bg); color:var(--ink);
  font:15px/1.75 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;
  -webkit-font-smoothing:antialiased;
}
a{color:var(--brand-ink); text-decoration:none}
a:hover{text-decoration:underline}
.layout{display:flex; align-items:flex-start; gap:32px; max-width:1180px; margin:0 auto; padding:0 28px 80px}

/* 封面 */
.cover{background:linear-gradient(135deg,#FF7A1F 0%,#FF5F00 55%,#D94900 100%); color:#fff; padding:56px 0 48px; margin-bottom:28px}
.cover .inner{max-width:1124px; margin:0 auto; padding:0 28px}
.cover .kicker{font-size:13px; letter-spacing:.18em; opacity:.7; text-transform:uppercase}
.cover h1{font-size:32px; line-height:1.3; margin:14px 0 10px; font-weight:700}
.cover p{margin:0; opacity:.82; font-size:14px}
.cover .meta{display:flex; flex-wrap:wrap; gap:10px; margin-top:24px}
.cover .meta span{background:rgba(255,255,255,.14); border:1px solid rgba(255,255,255,.2); border-radius:999px; padding:5px 14px; font-size:12.5px}

/* 目录：超出视口时独立滚动（高度上限 = 100vh − 上下留白 28px×2），标题栏吸顶常驻
   顶距放在 summary 的 padding 上（而非容器 padding），吸顶时白底才能完整遮住滚过的条目 */
.toc{position:sticky; top:28px; flex:0 0 232px; max-height:calc(100vh - 56px); overflow-y:auto; scrollbar-width:thin; scrollbar-color:#DCD4CE transparent; background:var(--card); border:1px solid var(--line); border-radius:14px; padding:0 16px 18px}
.toc::-webkit-scrollbar{width:6px}
.toc::-webkit-scrollbar-thumb{background:#DCD4CE; border-radius:3px}
.toc::-webkit-scrollbar-track{background:transparent}
.toc>summary{position:sticky; top:0; z-index:2; background:var(--card); padding:18px 0 0; font-size:13px; margin:0 0 12px; color:var(--ink-3); letter-spacing:.08em; font-weight:600; cursor:pointer; list-style:none; display:flex; align-items:center; justify-content:space-between; gap:8px; user-select:none}
.toc>summary::-webkit-details-marker{display:none}
.toc>summary::after{content:''; width:7px; height:7px; border-right:2px solid var(--ink-3); border-bottom:2px solid var(--ink-3); transform:rotate(45deg); transition:transform .2s; margin:0 3px 4px 0}
.toc:not([open])>summary{margin-bottom:0}
.toc:not([open])>summary::after{transform:rotate(-45deg); margin-bottom:-2px}
/* 目录不显示 ol 自动序号：条目本身已带「第 N 章 / x.y」编号，避免出现「2. 第 1 章」「1. 1.1」式重复 */
.toc ol{margin:0; padding-left:0; list-style:none; font-size:13.5px}
.toc li{margin:7px 0}
.toc ol ol{padding-left:14px; font-size:13px; margin-top:6px; list-style:none}
.toc ol ol li{margin:5px 0; color:var(--ink-2)}

main{flex:1; min-width:0}

section.chapter, section.plain{background:var(--card); border:1px solid var(--line); border-radius:16px; padding:30px 32px; margin-bottom:24px}
h2.ch{font-size:21px; margin:0 0 6px; font-weight:700}
.ch-sub{color:var(--ink-3); font-size:13.5px; margin:0 0 22px; padding-bottom:16px; border-bottom:1px solid var(--line)}
h3.step{font-size:16px; margin:28px 0 10px; padding-left:12px; border-left:3px solid var(--brand); font-weight:700}
h3.step:first-of-type{margin-top:6px}
h4{font-size:14.5px; margin:20px 0 8px; font-weight:700}
p{margin:8px 0}
ul,ol{margin:8px 0; padding-left:22px}
li{margin:5px 0}
code{background:var(--brand-soft); border:1px solid var(--brand-line); color:var(--brand-ink); border-radius:5px; padding:1px 6px; font-size:13px; font-family:ui-monospace,Consolas,Menlo,monospace}
b,strong{font-weight:700}

/* 图片 */
.shots{display:flex; flex-wrap:wrap; gap:20px; margin:16px 0 4px}
figure{margin:0; text-align:center}
figure img{width:248px; height:auto; border-radius:22px; border:1px solid var(--line); background:#fff; box-shadow:0 6px 20px rgba(146,80,30,.10); display:block}
figcaption{font-size:12.5px; color:var(--ink-3); margin-top:9px; line-height:1.55}
figure.wide img{width:268px}

/* 提示块 */
.tip{border-radius:12px; padding:14px 16px; margin:14px 0; font-size:13.5px; border:1px solid}
.tip.info{background:#F8F6F3; border-color:#EDE7E2}
.tip.rule{background:var(--brand-soft); border-color:var(--brand-line)}
.tip.warn{background:#FFF6F3; border-color:#F8DCD3}
.tip .t{display:block; font-weight:700; margin-bottom:5px; font-size:13px}
.tip.rule .t{color:var(--brand-ink)}
.tip.info .t{color:var(--brand-ink)}
.tip.warn .t{color:#C0341C}
.tip p:first-of-type{margin-top:0}
.tip p:last-child{margin-bottom:0}

/* 流程徽标 */
.flow{display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin:14px 0 6px; font-size:13px; color:var(--ink-2)}
.flow i{font-style:normal; background:var(--brand-soft); border:1px solid var(--brand-line); color:var(--brand-ink); border-radius:7px; padding:3px 10px}
.flow em{font-style:normal; color:var(--ink-3)}

/* FAQ */
details.faq{border:1px solid var(--line); border-radius:12px; padding:14px 16px; margin:10px 0; background:#fff}
details.faq[open]{background:#FFFCFA}
details.faq summary{cursor:pointer; font-weight:600; font-size:14px; outline:none}
details.faq p{margin:10px 0 2px; color:var(--ink-2); font-size:13.5px}

/* 速查表 */
.tw{overflow-x:auto; -webkit-overflow-scrolling:touch; margin:14px 0; border-radius:10px}
.tw table{margin:0; min-width:440px}
table{width:100%; border-collapse:collapse; margin:14px 0; font-size:13.5px}
th,td{border:1px solid var(--line); padding:9px 12px; text-align:left; vertical-align:top}
th{background:var(--brand-soft); color:#7A3D00; font-weight:600; white-space:nowrap}
td:first-child{white-space:nowrap}

footer{text-align:center; color:var(--ink-3); font-size:12.5px; padding:8px 0 40px}

/* 回到顶部（移动端） */
#toTop{position:fixed; right:16px; bottom:20px; width:42px; height:42px; border-radius:50%; border:1px solid var(--line); background:#fff; color:var(--brand); font-size:17px; line-height:1; padding:0; box-shadow:0 6px 18px rgba(146,80,30,.18); cursor:pointer; display:none; z-index:60}
#toTop.on{display:block}

@media (max-width:900px){
  body{font-size:15px}
  .cover{padding:38px 0 32px; margin-bottom:18px}
  .cover h1{font-size:23px}
  .layout{display:block; padding:0 16px 56px}
  .toc{position:sticky; top:0; z-index:20; margin:0 -16px 16px; padding:0 16px 12px; border-radius:0; border-width:0 0 1px; box-shadow:0 2px 10px rgba(146,80,30,.07)}
  .toc>summary{padding-top:12px}
  .toc[open]{max-height:calc(100vh - 24px); overflow-y:auto; -webkit-overflow-scrolling:touch}
  .toc ol{font-size:14px}
  .toc li{margin:9px 0}
  .toc ol ol li{margin:7px 0}
  section.chapter, section.plain{padding:22px 18px; border-radius:14px; margin-bottom:16px}
  h2.ch{font-size:19px}
  .ch-sub{font-size:13px; margin-bottom:18px; padding-bottom:14px}
  h3.step{font-size:15.5px; margin:24px 0 8px}
  .shots{gap:16px; justify-content:center}
  figure img{width:100%; max-width:300px; margin:0 auto}
  table{font-size:13px}
  th,td{padding:8px 10px}
  .tw table{min-width:400px}
  .tip{font-size:13.5px; padding:13px 14px}
  .flow{font-size:12.5px}
}
@media (max-width:420px){
  .layout{padding:0 12px 48px}
  .toc{margin:0 -12px 16px; padding:0 12px 12px}
  section.chapter, section.plain{padding:18px 14px}
  .cover h1{font-size:20px}
  .cover p{font-size:13px}
  figure img{border-radius:18px}
  .shots{gap:12px}
}
@media print{
  body{background:#fff}
  #toTop{display:none!important}
  .cover{background:#FF5F00 !important; -webkit-print-color-adjust:exact; print-color-adjust:exact}
  .toc{display:none}
  .tw{overflow:visible}
  .tw table{min-width:0}
  .layout{display:block; max-width:none; padding:0}
  section.chapter, section.plain{border:0; border-radius:0; padding:0 0 18px; margin-bottom:18px; break-inside:auto}
  h3.step{break-after:avoid}
  figure{break-inside:avoid}
  figure img{box-shadow:none}
  .shots{gap:14px}
  figure img{width:210px}
}
```

目录 CSS 中已内置四条修复，**改动前先读懂注释**：

1. 两级 `.toc ol` 均 `list-style:none` —— 去掉与条目文本重复的自动序号。
2. `.toc` 的 `max-height` + `overflow-y:auto` —— 目录可独立滚动，不影响正文。
3. `summary` 吸顶 + 顶距放在 `summary` 的 `padding-top` —— 容器 `padding-top` 必须为 0，否则滚过的条目会从标题上方露出。
4. 不用 `overscroll-behavior:contain`，滚动条可见。

## HTML 骨架

```html
<header class="cover">
  <div class="inner">
    <div class="kicker">YADEA RENTAL · MERCHANT GUIDE</div>
    <h1>雅迪租车 · 商户端运营操作手册</h1>
    <p>一句话说明适用对象与覆盖范围。</p>
    <div class="meta">
      <span>适用范围：商户端</span><span>示例币种：印尼盾 Rp</span>
      <span>文档版本：v1.0</span><span>更新日期：2026-10-13</span>
    </div>
  </div>
</header>

<div class="layout">
  <details class="toc" open>
    <summary>目录</summary>
    <ol>
      <li><a href="#ch0">阅读指引</a></li>
      <li><a href="#ch1">第 1 章 登录与系统选择</a>
        <ol>
          <li><a href="#s1-1">1.1 登录方式</a></li>
        </ol>
      </li>
    </ol>
  </details>

  <main>
    <section class="chapter" id="ch0">…阅读指引…</section>
    <section class="chapter" id="ch1">
      <h2 class="ch">第 1 章 登录与系统选择</h2>
      <p class="ch-sub">本章一句话摘要。</p>
      <h3 class="step" id="s1-1">1.1 登录方式</h3>
      <p>正文…</p>
      <div class="shots">
        <figure>
          <img src="images/01-login.png" alt="登录">
          <figcaption>图 1　账号密码登录</figcaption>
        </figure>
      </div>
    </section>

    <section class="plain" id="ch9">
      <h2 class="ch">第 9 章 常见问题</h2>
      <details class="faq"><summary>Q1　…</summary><p>…</p></details>
    </section>

    <section class="plain" id="ch10">
      <h2 class="ch">附录　规则速查</h2>
      <div class="tw"><table>…</table></div>
    </section>
  </main>
</div>

<button id="toTop" aria-label="回到顶部">↑</button>
<footer>…</footer>
```

## 约定

| 项 | 约定 |
| --- | --- |
| 章节 id | `ch0`（阅读指引）、`ch1..chN`、FAQ 与附录接续编号 |
| 步骤 id | `sN-M`，标题文本 `N.M 标题`，与目录条目一致 |
| 图文件名 | `<两位序号>-<语义>.png`，序号全局连续，一个弹窗一张 |
| 图注 | `图 N　标题`（全角空格分隔），与文件名序号一致 |
| 提示块 | `.tip.rule` 规则 / `.tip.warn` 注意 / `.tip.info` 说明 |
| 流程条 | `.flow` 用 `<i>步骤</i><em>›</em>` 串联主链路 |
| 表格 | 一律包 `.tw` 容器，窄屏可横向滚动；`.tw table{min-width:440px}` |
| 文案 | 全中文；金额 `Rp` 千分位（如 Rp 3.240.000）；日期 `2026-10-13` |

## 页尾 JS（原样保留）

```js
/* 截图：点击查看原图 */
document.querySelectorAll('figure img').forEach(function (img) {
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', function () {
    window.open(img.getAttribute('src'), '_blank', 'noopener');
  });
});

/* 目录：窄屏默认收起，点击条目后自动收起 */
var toc = document.querySelector('details.toc');
if (toc) {
  var mq = window.matchMedia('(max-width: 900px)');
  var sync = function () {
    if (mq.matches) { toc.removeAttribute('open'); } else { toc.setAttribute('open', ''); }
  };
  sync();
  if (mq.addEventListener) { mq.addEventListener('change', sync); }
  toc.addEventListener('click', function (e) {
    if (e.target.tagName === 'A' && mq.matches) { toc.removeAttribute('open'); }
  });
}

/* 回到顶部 */
var btn = document.getElementById('toTop');
if (btn) {
  var onScroll = function () {
    if (window.scrollY > 600) { btn.classList.add('on'); } else { btn.classList.remove('on'); }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
}
```

## 大文件写入方式

1. `write_to_file` 写骨架：`<head>` + 完整 CSS + 封面 + 目录 + 阅读指引 + 第 1～2 章 + `<!--APPEND-->` 占位 + 页尾。
2. 之后每章一次 `replace_in_file`，把 `<!--APPEND-->` 替换为「新章节 + 新的 `<!--APPEND-->`」。
3. 全部写完后确认 `APPEND` 字符串计数为 0。

## 校验清单

静态（一次性 python 脚本，跑完即删）：

- `re.findall(r'src="(images/[^"]+)"')` 全部命中磁盘文件，无缺失、无冗余。
- `APPEND` 计数为 0。
- 标签配平：`section / figure / figcaption / table / details / div / tr / td / ol / li / p` 开闭数一致。
- TOC `<a href="#...">` 数量 == `section` 数 + `h3.step` 数，且每个锚点都有对应元素。

实机（Playwright MCP，file:// 直接打开）：

- `document.images` 全部 `naturalWidth > 0`。
- 桌面 1280×900 与 iPhone 13 两档各截一张，核对：封面渐变、目录（桌面展开 / 移动端通栏收起）、表格横向滚动、图片排列、回顶按钮。
- 目录三项实机断言（改 `scrollTop` 后验证）：
  - `toc.scrollHeight > toc.clientHeight`（可滚动）；
  - `window.scrollY` 保持 0（滚目录不带动页面）；
  - `summary` 顶端与容器顶端差 ≤ 1px（吸顶贴合），且滚过的条目不越过 `summary` 顶端。
