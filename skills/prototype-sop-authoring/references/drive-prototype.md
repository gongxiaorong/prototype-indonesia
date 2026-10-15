# 驱动原型截图（Playwright）

本文件记录「如何用 Playwright 驱动 `index.html` 原型并截出干净的操作图」。范例实现见仓库 `scripts/shoot-merchant-sop.py`，新脚本复制其结构改造，不要从零写。

## 前置条件

- 工作区根目录起本地服务：`python -m http.server 8139`，脚本访问 `http://127.0.0.1:8139/index.html`。
- viewport **560×1010**、`device_scale_factor=2`（保证手机截图清晰，与手册中 248px 图卡匹配）。
- 截图目标为 `#root-merchant`（商户端）/ `#root-user`（用户端）整块，**不要截全屏**——会带进顶部 `#host-bar` 与演示操作栏。

## INIT_JS：切端 + 挂全局助手

```js
(() => {
  // 1) 切到目标端：商户端 single-m（用户端 single-u）
  const b = document.querySelector('#host-bar .modes button[data-mode="single-m"]');
  if (b) b.click();

  // 2) 隐藏演示 chrome（幂等，只注入一次）
  if (!document.getElementById('__shot')) {
    const s = document.createElement('style');
    s.id = '__shot';
    s.textContent = '#host-bar{display:none!important}body{background:#EEF1F5!important}';
    document.head.appendChild(s);
    const s2 = document.createElement('style');
    s2.id = '__shot-ops';
    s2.textContent = '.demo-ops-stack{display:none!important}';
    document.head.appendChild(s2);
  }

  // 3) 挂助手
  window.__T = {
    p() { return document.getElementById('mount-merchant')._vnode.component.proxy; }, // 用户端用 __vs()
    ops(on) { /* 显隐演示操作栏，拍权限面板时放回 */ },
    clear() { const p = window.__T.p(); if (p.toasts) p.toasts.splice(0); },
    scroll(dir) { /* 把所有 overflow-y 为 auto/scroll 且溢出 >4px 的容器归顶/到底 */ },
    snap() { /* 返回关键 overlay 状态快照，用于跑完后核对停在哪一页 */ }
  };
  return 'ok';
})()
```

用户端取 proxy 用页面自带的 `__vs()`；商户端用 `document.getElementById('mount-merchant')._vnode.component.proxy`。

## step() 步骤模式

每一步 = 「改状态 → 清 toast → 截图」：

```python
def step(label, code, wait=350):
    page.evaluate(INIT_JS)                    # 幂等
    page.evaluate(f"() => {{ {code} }}")      # 改目标端状态
    page.evaluate("() => window.__T.clear()") # 清 toast，否则残留污染截图
    page.wait_for_timeout(wait)               # 等 Vue 异步更新
    page.locator('#root-merchant').screenshot(path=os.path.join(OUT, f'{n:02d}-{label}.png'))
```

跑完打印 `FAILS` 列表与图片总数，与事先列好的「步骤 → 状态变量 → 图文件名」清单逐条核对。

## 已知坑位（按出现频率排序）

1. **toast 残留污染截图**：每次截图前必须 `__T.clear()`（`p.toasts.splice(0)`）。
2. **演示 chrome 露脸**：`#host-bar` 与 `.demo-ops-stack` 默认隐藏；需要拍摄权限演示面板时用 `__T.ops(true)` 临时放回，拍完再隐藏。
3. **变量名以源码为准**：例如电池弹窗是 `battMod` 而不是 `battConfirmMod`；`ordersOV` 取值是 `'detail'` / `'docs'` 之类字符串。先 `search_content` 确认真实定义再写脚本。
4. **商户端 `orders` 初始为空**：截图前注入种子订单，否则列表页是空态。
5. **首次登录的「切换系统」页**：不要走 `demoLogin()`（内部先 `showLogin=false`，随后被路由逻辑改回）。直接设：
   `p.showLogin=false; p.firstLogin=false; p.switchSource='first'; p.tab='profile'; p.profileOV=null; p.profileSub='subSwitchSystem'`。
   普通登录态改用 `p.switchSource='settings'; p.profileSub=null; p.demoLogin()`。
6. **改状态后要等一帧再截图**：Vue 异步更新，`wait_for_timeout(250~400)` 再按快门。
7. **弹窗被滚动容器半遮挡**：截图前 `__T.scroll('top')` 或把目标弹窗内滚动容器归零。
8. **同一图多次重跑会覆盖**：命名带序号，重跑前先清空输出目录或接受覆盖。

## 子代理分工建议

- 探查阶段：code-explorer（very thorough）产出「页面 / 弹窗 → overlay 变量 → 驱动函数 → 种子数据」清单与规则原文行号。
- 写手册阶段：再次用子代理按「状态映射 / `v-if` / 校验 / 文案」分组摘录原文，主代理只负责成文，避免上下文被大段源码占满。
