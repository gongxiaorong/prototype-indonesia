# 商户端「统计」能力方案（待评审）

> **文档状态**：仅方案，**未实施**。实施前需清空 §9「待确认清单」。
> **改动范围**：`index.html` 商户端（`#root-merchant` / `#mount-merchant`）。用户端（`#root-user` / `mountUser`）与 `swap.html` **零改动**；`locales/**` 本轮不改（见 §7）。
> **行号基线**：当前工作区（含未提交的 `M index.html`）。行号只作**锚点引用**，不作为修改动作；实施时以实际文件为准。
> **唯一待沟通项**：§5「统计页与门店维度入口布局」——本轮只列选项与代价，**不做决定**，待文档评审时口头确认。

---

## 1. 需求与目标

- **现状**：首页「经营数据」（今日收款 / 本月收款 / 租赁中 / 即将到期）与「车辆运营」（在线 / 离线车辆）是 6 个**写死的演示数字**（`3240 / 28500 / 18 / 8 / 42 / 8`），与页面上真实存在的 50 条订单、4 台车辆没有任何关系；页面上也没有门店维度。
- **目标**：
  1. 把 6 个数字全部改为**按真实数据 + 既定口径计算**；
  2. 引入**门店维度**（全部门店 / 单店），使看板随所选门店收敛；
  3. 新增**独立统计页**：营收趋势、按门店 / 车型 / 渠道拆分、续租收入、退款额。
- **非目标**（本轮明确不做）：
  - 不改门店主数据的增删改，不改用户端任何页面；
  - 不接真实后端，仍跑演示数据；但**统计口径必须按真实业务定义**，以便将来换数据源时不返工；
  - 不为多语言做文案缩写（见 §7 与 §8）。
- **交付物**：本文档一份。**零代码改动**（§2.6 的我的页菜单改造是已完成的相邻改动，非本文档产出）。

---

## 2. 现状事实基线

> 全部锚点均已在本工作区按行号核对，可用 grep 命中。`index.html` 为唯一权威源。

### 2.1 首页看板（模板）

| 项目 | 位置 | 现状 |
| --- | --- | --- |
| 首页模板根 | `3327` | `<template v-if="tab==='home'">`（商户端；另有 `2880` 为用户端同名模板，勿改） |
| 首页头部 | `3328–3333` | `pt-14 px-5 pb-3.5 bg-white shrink-0`；`3329` 已是 `flex justify-between items-center` 且**右侧为空**；`3330` 为 `<h1 class="text-[22px] font-bold tracking-[-.3px]">{{ store.name }}</h1>`，**无 `truncate`** |
| 经营数据块 | `3337–3348` | `3337` 为 `can('home.stats.business')`；`3339` 为 `transition-group name="item" tag="div"` + `grid grid-cols-2 gap-2.5`；2×2 统计卡消费 `bizStats`（`3340`），每项字段 `s.label / s.value / s.trend` |
| 车辆运营块 | `3349–3357` | `3349` 为 `can('home.stats.vehicle')`、`3357` 为 `</template>`（**仅到此处，不含下方订单/设备/告警三块**）；`3351` 为 `transition-group`，2×2 可点卡（`3352`）消费 `vehStats` + `goHomeVehStat` |
| 首页空态 | `3412` | `!can('home.stats.business')&&!can('home.stats.vehicle')&&!can('alarm.list')&&!orderEntries.length&&!can('recharge_order.list')` |
| 订单管理卡 | `3358–3375` | 已改 `kv-card` 承载（`3359`，标题走组件 `title`）；卡内 `grid grid-cols-4`（`3360`）；最多 5 项（3 个 `orderEntries` + 充电订单 + 充值订单）→ 实排 **4+1**（次行残 1 格） |
| 设备管理卡 | `3376–3384` | 已改 `kv-card` 承载；单入口「充电桩」，`grid-cols-4` → 占首格、右侧 3 格留空 |
| 最近告警 | `3385–3411` | 消费 `recent`（`8411`）+ `pendingAlertCount`（`8412`） |

### 2.2 首页看板（脚本）

| 项目 | 位置 | 现状 |
| --- | --- | --- |
| 门店名常量 | `8349` | `const store=computed(()=>({name:'测试门店'}))`——**写死，与门店主数据 4 家门店完全脱钩** |
| 经营数据 | `8350` | `bizStats`：`今日收款 fmtRp(3240)` / `本月收款 fmtRp(28500)` / `租赁中 '18'` / `即将到期 '8'`，每项带 `trend:null` |
| 车辆运营 | `8351` | `vehStats`：`在线车辆 '42' online:true` / `离线车辆 '8' danger:true online:false` |
| 卡片点击 | `8352` | `goHomeVehStat(s)`：`vehFsOnline` 取 `s.online`，跳 `tab='vehicles'` |

### 2.3 数据源与字段（口径定义的事实依据）

**订单 `orders`（`6945` 声明 `Vue.ref([])`，`10895` 注入 50 条，`10953` 按状态排序）**

单条字段（实测）：`id, vin, customer, phone, plan, amount, status, type, item, created, payment, paySt, rentStart, account, deposit, paymentSplit, paySplitAudits, email, idNo, driverNo, shopId, store`，部分单含 `renewSubOrders` / `battNo`。

- `status` 取值 = `created / pickup / progress / return / overdue / breach / complete / cancelled`；文案映射见 `ORDER_ST_TEXT`（`6911`）：`progress='租赁中'`、`return='即将到期'`、`cancelled='已取消'`。
- `paySt` 取值 = `paid / pending / partialRefund / fullRefund`（**数据层小写词表**，`10973` 的 `_paidSt=['paid','partialRefund','fullRefund']` 与之一致）。
- `amount` = 租金；`deposit` = 押金（`10954` 统一补默认 500）。
- 门店归属：`10971–10979` 按 `id` 确定性散列补 `shopId`（`(h % stores.value.length) + 1`）与 `store`（`storeNameOf(shopId)`）；同时**只对「非取消且 paySt ∈ 已付三态」的单补 `payTime = created`**（`10978`），未支付 / 已取消单**不补**，避免虚增营收。
- `renewSubOrders`（续租子单）字段：`subOrderNo, renewType, rentType, rentCount, newRentStart, newRentEnd, renewRentFee, subPayStatus, payTime, paymentSplit{rentSplit,depositSplit}`；`subPayStatus` 取值含 `已支付 / 待支付 / 退款中 / 部分退款 / 全部退款`，取消标记为 `cancelRenew`。

**充值订单 `CZ_ORDERS`（`6993`）**：字段 `orderNo, storeName, createTime, payChannel, payStatus, payTime, account, phone, email, amount, giftAmount, refundAmount, refundGiftAmount, shopId`；门店归属对齐见 `10980–10985`（`payStatus` 用**大写**词表：`UNPAID/PAYING/PAID/REFUNDING/…`）。

**车辆 `vehicles`（`6896–6901`，4 条）**：字段 `vin, shopId, ctrl, model, plate, account, phone, email, status, online, batteryMain, batterySub, time, lost, lat, lng, location`。**`shopId` 分布 = 1×2 / 2×1 / 3×1，没有 shopId 4 的车。**

**电池 `batteries`（`6902–6909`，6 条）**：均有 `shopId`（1×2 / 2×2 / 3×2）。本方案不计入首页看板。

**门店主数据 `stores`（`6946` 声明，`10962–10967` 注入 4 条，`10969–10970` 补手机号）**：`{name, addr, phone}`，**无 id**；id 约定 = 下标 + 1，实现于 `storeNameOf`（`10539`，越界返回「未分配门店」）。4 家门店名：
1. 雅迪电动车(双流区雅和北路店)
2. 雅迪电动车(锦江区春熙路店)
3. 雅迪电动车(武侯区磨子桥店)
4. 雅迪电动车(高新区天府大道店)

**退款 `orderRefunds`（`9451–9472`，按订单 id 分组，共 8 条记录，涉及 6 张订单）**：字段 `refundNo, refundTime, finishTime, operator, reason, rentAmount, depositAmount, refundSource, refundStatus, items[{part,method,amount}]`；`refundStatus` 取值 `SUCCESS / FAILED / REFUNDING`（大写英文）。消费方 `curRefunds`（`9474–9479`，按 `refundTime` 倒序，可被 `refRecScope` 的 `targetNo` 过滤）。

**时间归一（演示数据的时间可信性前提）**
- `SYS_recent(n, ords, czs, cos)`：`6996`，把订单 / 充值订单 / 充电订单的 `created / payTime / rentStart / pickupTime / createTime / cancelTime` 重铺到**近 n 天**。
- `SYS_recent_ext(n, ords, refs)`：`7001`，把`续租子单的 newRentStart / newRentEnd / payTime` 与**退款的 `refundTime / finishTime`** 同步重铺。
- 调用点：`11019`（`SYS_recent(15,…)`）、`11020`（`SYS_recent_ext(15,…)`）。
- **副作用（重要）**：`payTime` 被铺到 `now - 0.9d ~ now - 14.85d`，因此「今日收款」只可能命中极少数单、「本月收款」随运行日期漂移（见 §2.7 实测）。

### 2.4 金额与状态口径 helper（必须复用，禁止另造第二套）

| helper | 位置 | 语义 |
| --- | --- | --- |
| `orderMainTotal(o)` | `6924` | 主订单租金 + 押金（`deposit==null` 时按 500） |
| `orderPayTotal(o)` | `6925` | 应付 = 主订单 + Σ 未取消续租单 `renewRentFee` |
| `orderPaidAmount(o)` | `6926` | 已付 = 主订单（`paySt` 为 `pending`/`processing` 记 0）+ Σ `subPayStatus==='已支付'` 且未取消的续租费 |
| `orderUnpaidAmount(o)` | `6927` | 待付 = 应付 − 已付 |
| `orderPaidAmountOf(o)` / `orderUnpaidAmountOf(o)` | `9301` / `9302` | 模板包装，`fmtRp` 后输出 |

金额格式化统一走 `fmtRp`（`6889`，随 `MONEY.cur` 切换）。口径注释见 `6920–6923`。

### 2.5 权限与暴露表

| 项目 | 位置 |
| --- | --- |
| `ALL_PERM_CODES` | `8831` 起；`8832` 含 `'home.view','home.stats.business','home.stats.vehicle'` |
| `TAB_PERM_ITEMS` | `8849`（底部 Tab 级：`home.view / vehicle.list / battery.list`） |
| `permGroups` | `8858` 起；`8859–8861` 为首页分组；`8919` 为演示页首页分组（`home.stats.business / home.stats.vehicle / …`） |
| 首页模板权限门 | `3337` / `3349` / `3412` |
| 车辆卡点击的权限兜底 | `8352`（`home.stats.vehicle` + `vehicle.list`，无权限 `deny()`） |
| setup 返回表 | `11036` 起；`11038` 暴露 `store, bizStats, vehStats, goHomeVehStat, recent, allAlerts, pendingAlertCount, homeOV, homeRefreshing, …`；`11040` 暴露 `vehicles, …`；`11072` 暴露 `curStore, menuGroups, stores, doSwitch, orderStoreNameOf, orderPaidAmountOf, orderUnpaidAmountOf, shopPick*` |

### 2.6 已完成的相邻改动（非本方案产出，避免实施时误判）

- **我的页菜单已改为「4 组 × `kv-card` 承载 × 每行最多 4 个入口」**：模板 `5450–5457`，形如 `<kv-card v-for="g in menuGroups" :title="g.name" class="mb-3">` + 卡内 `grid grid-cols-4 gap-x-1 gap-y-3.5`；单元格 = `w-10 h-10 rounded-[10px]` 图标 tile + `text-[11px] leading-tight line-clamp-2` 标签。卡面与标题排版全部由 `kv-card` 组件提供（组件定义 `7114`；其注释明确「默认插槽 kv-row 与自定义内容可混排」，并用 CSS `.kv-head+*:not(.kv-row){padding-top:8px}`（`192`）自动补内容顶距——即该组件本就是为自定义内容卡设计的）。
- **分组口径**（`menuGroups` `10056`）：常用功能（切换门店 / 用户管理）、定价管理（车型管理 / 电池型号管理 / 套餐管理）、运营配置（订单配置 / 客服配置 / 充值配置）、系统管理（账号管理 / 职位管理），共 10 项 = 2/3/3/2。行式副文本已移除：删掉了 `{id:'store'}` 上的 `sub:curStore.value` 字段与右箭头。
- **权限过滤到组**：组内项按 `can(code)` 过滤，整组无权限时**该 `kv-card` 整体不渲染**。已实测：关掉 `account.list` + `position.list` 后「系统管理」卡消失且不留空壳，恢复权限后 4 组完整还原。
- `curStore`（`10055`）与 `doSwitch`（`10144`）**保留未删**，仍被门店列表页与钱包等处引用。
- **首页同步改造**：「订单管理」`3358–3375` 与「设备管理」`3376–3384` 也改为 `kv-card` 承载 + 卡内 `grid grid-cols-4`，标题走组件 `title`。与我的页的唯一差别是图标 tile 用主色淡底（`background:#EBF1FD;color:var(--accent)`）而不是中性灰，以保留首页主入口的视觉权重；`data-od-id`（`home-order-entry-*` / `home-charge-order-entry` / `home-recharge-order-entry` / `home-charge-device-entry`）全部保留。订单管理满权限 5 项 → **4+1**；设备管理 1 项 → 占首格、右侧 3 格留空。
- 实测：`kv-card` 内边距 `14px 16px`、圆角 16px、四列各 70.75px；10 个单元格标签全部单行不折行；`openMenu` 点击链路正常（`profileOV` 置为 `model`）。
- **对统计方案的影响**：改为分组后，「加一个入口」**不再有破版问题**（每组独立成卡，加项只让某组 2→3 项），§5.1 选项 C / §5.2 选项 iii 的代价因此只剩**语义混淆**。

### 2.7 实测数据基线（2026-10-14 实机运行，`SYS_recent(15)` 归一后）

实测方法：在浏览器中按 §3 口径对 `orders` / `vehicles` 直接聚合（非猜测值），用于将来的验收比对。

| 维度 | 认收单数 / 总单数 | 收款（含押金） | 收款（租金+续租费） | 押金 | 租赁中 | 即将到期 | 已取消 | 车辆总数 | 在线 | 离线 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 全部门店 | 38 / 50 | 35,080 | 16,080 | 19,000 | 8 | 6 | 6 | 4 | 3 | 1 |
| 双流区雅和北路店 | 9 / 11 | 7,910 | 3,410 | 4,500 | 2 | 2 | 1 | 2 | 2 | 0 |
| 锦江区春熙路店 | 11 / 14 | 9,310 | 3,810 | 5,500 | 3 | 2 | 2 | 1 | 0 | 1 |
| 武侯区磨子桥店 | 10 / 14 | 9,310 | 4,310 | 5,000 | 2 | 1 | 2 | 1 | 1 | 0 |
| **高新区天府大道店** | 8 / 11 | 8,550 | 4,550 | 4,000 | 1 | 1 | 1 | **0** | **0** | **0** |

- 退款：`SUCCESS` 合计 **2,660**；含 `FAILED/REFUNDING` 的全部状态合计 **3,040**。
- 净额（全部门店）：租金口径 `16,080 − 2,660 = 13,420`；含押金口径 `35,080 − 2,660 = 32,420`。
- 期间口径实测（随运行日期漂移）：今日收款（含押金）**2,720** /（租金+续租费）**1,220**，命中 3 单；本月（10-01 起）**32,350** / **14,850**，其中已付续租费仅 **130**、押金 **17,500**。
- **三条必须让决策人看到的结论**：
  1. **押金杠杆极大**：押金占收款 54%（19,000 / 35,080）。押金计不计入，首页数字差 2.18 倍。
  2. **车辆运营会从 `42/8` 掉到 `3/1`**：真实车辆只有 4 台。若不做数据补充，改造后首页会出现「在线车辆 3」这种一眼假的数字——**这是本轮最大的观感风险**（见 §9 第 6 条）。
  3. **高新区天府大道店没有车**：单店维度下车辆运营必为 `0/0`，需要空态口径（见 §9 第 5 条）。

---

## 3. 统计口径定义

> 以下每条给出**判定式**与**建议值**；标注「待裁决」的必须在实施前裁决。

### 3.1 认收判定（营收计入的门槛）

```
计入营收 ⟺ payTime 非空
         且 paySt 不属于 { pending }      // 数据层词表：paid / pending / partialRefund / fullRefund
         且 status ≠ 'cancelled'
```

- 建议值：照上。当前数据下命中 **38 / 50** 单（与 `orderPaidAmount` 的既有判定一致：`paySt==='pending'||'processing'` 记 0）。
- 说明：`processing` 在当前演示数据中不存在，但 `orderPaidAmount`（`6926`）里保留了它，**新口径须沿用同一判定式**，避免两套。

### 3.2 营收构成

```
营收 = 主订单租金(amount)
     + 主订单押金(deposit)              ← 待裁决：是否计入
     + Σ 续租子单续租费(renewRentFee)    // 条件：subPayStatus === '已支付' 且 !cancelRenew
```

- 建议值：**首页「今日/本月收款」计入押金**（与 `orderPaidAmount` 既有口径一致，改造成本最低、口径唯一）；**统计页的「营收」默认不含押金**，并在同区块给出「押金」独立指标（两者并存，不互相覆盖）。
- 已知口径缺口（须在文档确认，不在本轮修复）：`orderMainTotal`（`6924`）**不含续租子单的押金**（`renewSubOrders[].paymentSplit.depositSplit`）。若将来要口径完备，应在 helper 层补齐，而不是在展示层加总。

### 3.3 退款额与净额

```
退款额 = Σ (rentAmount + depositAmount)，refundStatus === 'SUCCESS'
净额   = 营收 − 退款额
```

- 建议值：**退款额作为独立指标展示**，同时给出净额；不做静默净额扣减（否则「收款」与「退款」两条业务线在页面上不可见）。
- **待裁决**：退款额是否只统计 `SUCCESS`（建议是），以及统计口径的退款是否**按 `refundTime` 归属期间**（建议是，与认收按 `payTime` 对称）。
- 当前数据：`SUCCESS` 合计 2,660（含 2 条 `FAILED` 300 与 `REFUNDING` 80 不计入）。

### 3.4 计数口径

```
租赁中   = Σ orders[status === 'progress']     // ORDER_ST_TEXT（6912）中 progress → '租赁中'
即将到期 = Σ orders[status === 'return']       // return → '即将到期'
在线车辆 = Σ vehicles[online === true]
离线车辆 = Σ vehicles[online === false]
```

- 建议值：照上。**「租赁中 / 即将到期」按订单状态计数，与支付状态无关**（未支付的 `progress` 单也计入，因为它确实是租赁中）。
- 当前数据：租赁中 8 / 即将到期 6 / 在线 3 / 离线 1。

### 3.5 期间归属

```
今日 = 本地当日 00:00:00 ≤ payTime
本月 = 本地当月 1 日 00:00:00 ≤ payTime
归属字段 = payTime（退款按 refundTime）
```

- 注意：`SYS_recent` 归一导致 `payTime` 最早只到 14.85 天前，「今日」区间天然稀疏（实测仅 3 单）。**这是演示数据的正常表现，不是 bug**；若要「今日收款」看起来更饱满，属于数据补充议题（§9 第 6 条）。

### 3.6 门店归属

```
订单门店 = o.shopId（1..4，已在 10964–10972 按 id 确定性散列补齐）
订单门店名 = orderStoreNameOf / o.store
车辆门店 = v.shopId
「全部门店」 = 不做筛选
```

- 红线：**沿用「下标 + 1」这一套门店标识约定**（`storeNameOf` `10539`、`10976`），**不得引入第二套门店 id**。
- 待裁决：订单按 `id` 散列归属是**演示数据的权宜做法**，真实系统应按门店落库字段归属——文档需明确「实现仅复用 `shopId`，不新增归属逻辑」。

### 3.7 口径陷阱（实施时的三个必踩点）

1. **两套状态词表并存**：`orders.paySt` 用**小写**（`paid/pending/partialRefund/fullRefund`），而 `PAY_ST_MAP`（`6919`）用**大写**（`UNPAID/PAYING/PAID/…`）。统计判定必须用**数据层小写词表**，套 `PAY_ST_MAP` 会全量落空、算出 0。
2. **不要在展示层二次加总**：一律复用 `orderMainTotal / orderPayTotal / orderPaidAmount`。历史上出现过押金混入租金、与续租金额重复计费的问题。
3. **`recent` / `pendingAlertCount` 与本方案解耦**：首页「最近告警」是否随门店收敛是**既有文档**（`merchant-home-store-filter-plan.md` §4）的议题，本方案不擅自接手（见 §6）。

---

## 4. 首页改动点清单

| # | 位置 | 现状 → 目标 | 锚点 |
| --- | --- | --- | --- |
| 4.1 | `store` | 写死 `{name:'测试门店'}` → 按「当前门店维度」计算：全部门店态显示品牌 / 全部门店写法（**待裁决** §9-2），单店态显示 `stores.value[shopId-1].name` | 脚本 `8349`；模板 `3330` |
| 4.2 | `bizStats` | 写死 4 值 → 单个 `computed` **一次 O(n) 遍历** `orders`，产出今日收款 / 本月收款 / 租赁中 / 即将到期；金额一律经 `orderMainTotal` + 已付续租费，形式仍为 `fmtRp` | 脚本 `8350`；模板 `3337–3348` |
| 4.3 | `vehStats` | 写死 42/8 → 单次遍历 `vehicles`，按当前门店 + `online` 计数；保留 `{label,value,online/danger}` 结构以复用现有卡片 | 脚本 `8351`；模板 `3349–3357` |
| 4.4 | 首页头部（门店维度入口位） | `3330` 的 `h1` **加 `truncate`**（长门店名不撑高顶栏）；`3329` 右侧**空位**放入门店维度入口（具体形态见 §5，**待沟通**） | 模板 `3328–3333` |
| 4.5 | `goHomeVehStat` | 保持现有交互；只需确认跳转车辆列表时**是否带上门店筛选**（**待裁决** §9-7） | 脚本 `8352` |
| 4.6 | setup 返回表 | 新增的门店维度状态 / 计算函数登记进返回表（`store/bizStats/vehStats` 所在行附近，`11038` 区段） | `11036` 起 |
| 4.7 | 首页空态 | `3412` 条件**不改**；但门店维度接入后需确认「有权限但该门店无数据」不落进空态，而是显示 0 值卡片 | 模板 `3412` |

**不动项（明确保持现状）**：首页两块看板「经营数据」`3337–3348` 与「车辆运营」`3349–3357`（2×2 卡片形态不动，本方案只改它们的**数据来源**）、告警区 `3385–3411`、模板两处权限门 `3337/3349`。

**已改项（相邻改动，非本方案产出）**：「订单管理」`3358–3375` 与「设备管理」`3376–3384` 已改为 `kv-card` 承载 + 一排最多 4 个入口（见 §2.6）。这两块是纯入口、不含统计，本方案**不动其结构**。

**实现注意（动效）**：经营数据块外层是 `transition-group name="item"`（`3339`）。`computed` 每次依赖变化都会返回**新数组**，若 `:key` 不稳定，切换门店会整块重放「卡片闪入」动画。实施时应给聚合结果带**稳定 key**（期间标识 + 指标名），或把该处 `transition-group` 降级为普通网格。

**实现注意（性能）**：数据量级为 50 条订单 / 4 台车，单次 O(n) 遍历足够；**禁止**在模板里对每张卡片重复调用计算函数，也**禁止**「订单 × 渠道」双重遍历——渠道拆分必须在同一次遍历内累加完成。

---

## 5. 统计页与门店维度入口布局（**本轮只列选项，待沟通**）

### 5.1 门店维度入口（首页）

| 选项 | 形态 | 优点 | 代价 |
| --- | --- | --- | --- |
| A | `3329` 右侧空位放 `chevron-down`，点击复用既有「更换门店」`bottom-sheet`（`5213`，搜索 + 门店行 + 选中态） | 头部高度不变；**零新交互范式**（`openShopPick` 已有三个调用点：`3685` veh、`4159` batt、`10657` cd；充电桩是从 `5111` 经 `cdOpenMod('shop')` 间接进入的） | 需要一张「全部门店 / 单店」的选项列表；多一次点击 |
| B | 头部下方横向 pill 行（`全部门店 ｜ 门店1 ｜ …`） | 一屏内直接切换，符合既有文档 §3.1 的「门店名上方」要求 | 头部 +约 36px；4 个门店名 12–17 字，必须定义横滚或截断 |
| C | **放我的页新增一格**（分组已是 `kv-card` 承载，加项不再破版） | 入口集中；实现成本最低 | **语义混淆**：门店维度是「筛选器」，不是业务入口，塞进「常用功能」组会削弱该分组的含义 |
| D | 首页不做入口，只在统计页内自带门店筛选 | 首页零改动 | 首页「经营数据」无法按门店看，与 §1 目标 2 不符 |

**建议**：A（复用既有 sheet，成本最低、不新增视觉件）。**待沟通确认**。

### 5.2 统计页入口（从哪进）

| 选项 | 位置 | 代价 |
| --- | --- | --- |
| i | 首页「经营数据」分组标题右侧加「查看统计 ›」 | 分组标题行 `3338` 已是 `flex justify-between items-center`，**右侧现成空位**，无需新造容器；语义最直白 |
| ii | 首页页头右侧（与 §5.1 选项 A 抢同一个位置，需二选一或并列） | 位置竞争 |
| iii | 我的页新增一格 | 同 §5.1 选项 C：不破版，但语义混淆（统计是独立页，与业务入口并列会削弱分组含义） |

**建议**：i（首页经营数据区自带入口，与看板语义连成一条线）。**待沟通确认**。

### 5.3 统计页形态（待 §5.1/§5.2 定后细化）

- **导航**：新增全屏子页，复用既有 `page` / `nav-bar` 与页面栈（`navOpen` / `navBack` / `goBack`），不写手写全屏壳。
- **区块**（自上而下，全部消费 §3 口径）：
  1. 期间切换（今日 / 本月 / 自定义）——**待裁决**是否要自定义；
  2. 营收趋势（按日折线 / 柱状）——**待裁决**：现有代码库无图表组件，需确认用「纯 CSS 柱状」还是引入图表库（**引入新依赖属红线**，见 §8）；
  3. 按门店拆分（复用 §2.7 那张表的口径）；
  4. 按车型拆分（用订单 `item`，即车辆型号文案）；
  5. 按渠道拆分（用 `paymentSplit.rentSplit[].method`，文案走 `payChannelLabel` `6944`）；
  6. 续租收入（`renewSubOrders` 已付续租费，当前仅 130，几乎不可见）与退款额（§3.3）。
- **空态**：无数据时用既有 `empty-state`；「有权限但该门店无数据」显示 0 值而非空态。

---

## 6. 与 `merchant-home-store-filter-plan.md` 的合并裁决

### 6.1 关系建议

**保持两份、交叉引用，不合并。** 理由：既有文档的**行号基线是 `045e055`（已漂移，当前工作区比它普遍 +1 甚至更多）**，且其内容只覆盖「门店维度切换」一件事；本方案覆盖「统计口径 + 看板实算 + 统计页」。强行合并会让「口径定义」被稀释。

**但必须同时做一件事**：在既有文档 §2 前加一行状态注记，声明其行号已漂移、以本方案 §2 为准。否则实施时两份文档的行号会互相打架。**本方案不修改该文件**（本轮零改动）。

### 6.2 对既有 §8「七条待裁决」的处置建议

| 既有条目 | 本方案处置 |
| --- | --- |
| 1. 入口形态 A（pill 行）/ B（右侧下拉） | **并入本方案 §5.1**，一起裁决 |
| 2. 「全部门店」选中时 `h1` 显示什么 | **并入本方案 §9-2** |
| 3. 首页门店上下文是否与 profile `curStore`（`10055`）打通 | **并入本方案 §9-3**（`curStore` 现被门店列表页与钱包引用，打通需先排查全部引用点） |
| 4. `bizStats` / `vehStats` 是否随门店收敛 | **本方案已直接接手并给出实测值**（§2.7、§4.2、§4.3） |
| 5. 最近告警是否随门店收敛 | **本方案明确不接手**，仍属既有文档（告警无门店字段，需先补 `shopId`） |
| 6. 门店名口径统一（订单/充值订单里的历史店名） | **已完成**：`10980–10985` 已把 `CZ_ORDERS` 的历史店名对齐门店主数据并补 `shopId`；订单已按 `id` 补齐 `shopId/store` |
| 7. 是否记忆上次选择 | **并入本方案 §9-4** |

---

## 7. 建议新增文案登记表

> **本轮不写 `locales/**`。** 先说明事实，再给登记表。

**事实更正（重要）**：`index.html` **没有 i18n 运行时**。`appLang`（`7620`）只驱动语言列表的对勾，`selectLang`（`8111`）只改这个 ref、`appLangLabel`（`7622`）恒为选项自身文案，全文件 grep 不到 `locales/` / `data-i18n` / `t()`。`locales/rent/*.json`（含 `menuStore` / `batteryModelManage` / `csInfo` / `rechargeConfig` 等键）在 `index.html` 中**零引用**，是给未来接线用的翻译资产；`scripts/i18n_reference.mjs` 只生成译者对照表（其注释明示「不动 locales/*.json、index.html、swap.html」）。

同时更正一个口径误解：`scripts/i18n_check.mjs` 的 `ORPHAN` 是**跨语言**比对（某语言多出 `zh-CN` 没有的键），**不是**「HTML 未引用」。因此「本轮不写 locales」的理由不是会报 `ORPHAN`，而是：**当前写了也不生效**，会先累积出一批无引用的孤儿词条。

| 建议 key | 中文 | 备注 |
| --- | --- | --- |
| `merchant.stats.title` | 统计 | 统计页标题 |
| `merchant.stats.allStores` | 全部门店 | 门店维度「不限」项；既有文档 §6 也拟用 `merchant.common.allStores`，**key 需二选一并统一** |
| `merchant.stats.today` | 今日 | 期间切换 |
| `merchant.stats.thisMonth` | 本月 | 期间切换 |
| `merchant.stats.revenue` | 营收 | 统计页主指标 |
| `merchant.stats.deposit` | 押金 | 独立指标（§3.2） |
| `merchant.stats.refund` | 退款额 | 独立指标（§3.3） |
| `merchant.stats.netRevenue` | 净营收 | 营收 − 退款额 |
| `merchant.stats.renewIncome` | 续租收入 | 已付续租费合计 |
| `merchant.stats.byStore` | 按门店 | 拆分区块标题 |
| `merchant.stats.byModel` | 按车型 | 拆分区块标题 |
| `merchant.stats.byChannel` | 按渠道 | 拆分区块标题 |
| `merchant.stats.trend` | 营收趋势 | 趋势区块标题 |
| `merchant.home.viewStats` | 查看统计 | 首页入口文案（§5.2 选项 i） |

实施时按 `zh-CN` 单向派生 `zh-HK / en / id / th`，跑 `node scripts/i18n_check.mjs` 全绿（`MISSING/ORPHAN/PLACEHOLDER/SUFFIX` + 跨目录 `TERM`）。

---

## 8. 红线与风险

**红线**
1. 只动商户端；`swap.html` 与用户端模板（如 `2880` 的用户端首页）一律不碰。
2. 金额口径**唯一**：只允许复用 `orderMainTotal / orderPayTotal / orderPaidAmount` 系列（`6924–6927`），禁止在展示层用 `parseRp` 或字符串拼接二次加总。
3. 门店标识**唯一**：「下标 + 1」约定（`storeNameOf` `10539`），不得引入第二套门店 id。
4. 选择器形态**唯一**：门店选择只走既有 `bottom-sheet`（`5213`），不新写手写弹窗 / 全屏壳。
5. 不引入新依赖（图表库另议：若趋势图必须用库，需单独裁决）。
6. 不改动既有未提交的 `index.html` 改动（我的页宫格 + 续租子单契约适配），不回退、不覆盖。

**风险**
| 风险 | 说明 | 缓解 |
| --- | --- | --- |
| 车辆数字断崖 | `42/8` → `3/1`，一眼可见 | §9-6 裁决是否补车辆种子数据 |
| 单店无车 | 高新区天府大道店 `0/0` | §9-5 定义空态 / 0 值口径 |
| 押金杠杆 | 计入与否差 2.18 倍（35,080 vs 16,080） | §9-1 先裁决 |
| 期间漂移 | `SYS_recent` 归一让「今日/本月」随运行日期变化 | 验收只对**稳定量**（认收单数、状态计数、车辆计数、按门店分布）做断言 |
| 长门店名 | `3330` 无 `truncate`，单店态撑高顶栏 | 已列入 §4.4（必做） |
| 状态词表混用 | 大小写两套 | §3.7 已固化 |
| UnoCSS 运行时 | 新增 utility 类后立即读 computed style 会误判 | 验收以 DOM 判据 + 实机走查为准，不读 computed style 下结论 |

---

## 9. 待确认清单（实施前逐条裁决）

1. **押金是否计入首页「今日/本月收款」与统计页「营收」？**（实测杠杆：35,080 vs 16,080，差 2.18 倍）
2. **「全部门店」态下 `h1` 显示什么？**（全部门店 / 品牌名 / 默认门店名）
3. **首页门店维度是否与 profile 的 `curStore`（`10055`）打通？**（打通＝全局门店上下文；需先排查 `curStore` 全部引用点）
4. **是否记忆上次选择？**（不做＝会话内状态，刷新回默认）
5. **单店无数据（车辆 0 / 订单 0）显示 0 值还是空态？**
6. **是否补充演示数据？**（现有 4 台车 / 50 单 → 若不补，车辆运营会显示 `3/1`、今日收款仅 3 单）
7. **`goHomeVehStat` 跳车辆列表时是否带上门店筛选？**
8. **统计页权限码归属**：复用 `home.stats.business`，还是新增 `home.stats.page`？（若新增，需同步 `ALL_PERM_CODES` `8831` 与 `permGroups` `8859/8920`，否则会误判成「无权限空态」）
9. **§5.1 门店维度入口形态**（A/B/C/D）与 **§5.2 统计页入口位置**（i/ii/iii）——本轮待沟通。
10. **营收趋势图的实现方式**：纯 CSS 柱状（零依赖）还是引入图表库？

---

## 10. 实施步骤与验证口径

### 10.1 步骤（§9 清空后执行）

1. **脚本**：新增「当前门店维度」状态 + 两个聚合 `computed`（营收 / 计数），单次 O(n) 遍历；改造 `store`（`8349`）、`bizStats`（`8350`）、`vehStats`（`8351`）。
2. **模板**：`3330` 加 `truncate`；`3329` 右侧落入口（§5.1 定稿后）；如需「查看统计 ›」落在 `3338` 区段（经营数据分组标题行，右侧现成空位）。
3. **暴露**：新状态 / 函数登记进 setup 返回表（`11036` 区段）。
4. **统计页**：新增全屏子页（`page` + `nav-bar`），区块按 §5.3。
5. **文案**：按 §7 登记表写入 `locales/rent` 五语（**仅在 i18n 接线后**），跑 `i18n_check` 全绿。
6. **验收走查**：见 §10.2。

### 10.2 验证口径

**静态自检**
- 内联脚本语法通过；模板标签配平；不新增未使用变量。
- `git status` 只出现预期文件；既有未提交改动未被回退。

**实机判据（Playwright）**
| 判据 | 期望 |
| --- | --- |
| 全部门店态：认收单数 / 收款 | 38 / 50；`35,080`（含押金）或 `16,080`（不含，依 §9-1） |
| 全部门店态：租赁中 / 即将到期 / 在线 / 离线 | `8 / 6 / 3 / 1` |
| 切到「双流区雅和北路店」 | `7,910` / 租赁中 2 / 即将到期 2 / 在线 2 / 离线 0 |
| 切到「锦江区春熙路店」 | `9,310` / 租赁中 3 / 即将到期 2 / 在线 0 / 离线 1 |
| 切到「武侯区磨子桥店」 | `9,310` / 租赁中 2 / 即将到期 1 / 在线 1 / 离线 0 |
| 切到「高新区天府大道店」 | `8,550` / 租赁中 1 / 即将到期 1 / 车辆按 §9-5 |
| 退款额 / 净额 | `2,660` / 净额按 §9-1 口径 |
| 车辆卡点击 | 仍跳车辆 Tab 并正确置 `vehFsOnline` |
| 长门店名 | 顶栏不撑高、单行省略 |
| 控制台 | 0 报错 |

> 期间类数字（今日 / 本月）**不做绝对值断言**，只断言「随门店收敛且单调不大于全部门店」。上表数值基于 2026-10-14 实测，仅作量级比对基线。
