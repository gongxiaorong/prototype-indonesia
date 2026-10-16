# key 命名规范化清单（通用文案归通用子命名空间）

生成日期：2026-09-29　｜　依据：`AGENTS.md` §5（命名空间划分）

口径：**通用 UI 文案**（确定 / 至 / 其他 / 取消 / 完成…）应置于 `common` 的**通用子命名空间**（`common.action.*`、`common.label.*`、`common.dateTime.*`、`common.toast.*`、`common.status.*` 等）；**专有文案**才留在 `common.orders.*` / `common.profile.*` / `user.*` / `merchant.*` 等语境位。

判定方法：扫描两端 zh-CN，凡「文案 ∈ 通用词表」却挂在「非通用位」的 key 即候选。跨目录同一中文须合并到**同一个** `common.*` 键（口径 2026-10-14 起改为**按中文值锚定**：两目录只要求同句中文译法一致，键集/键名**不要求互为副本**，见 `i18n-cross-drift.md` 阶段 3）。

## 候选清单（19 条）

| # | 中文 | 现 key（目录） | 建议 key |
|---|---|---|---|
| 1 | 确定 | `common.orders.filterConfirm`（rent/swap） | `common.action.confirm` |
| 2 | 至 | `common.orders.filterDateTo`（rent/swap） | `common.dateTime.rangeTo` |
| 3 | 其他 | `common.orders.docOther`（rent/swap） | `common.label.other` |
| 4 | 下一步 | `common.profile.nextStep`（rent/swap） | `common.action.nextStep` |
| 5 | 设置 | `common.profile.menuSettings`（rent/swap） | `common.label.settings` |
| 6 | 无内容可复制 | `common.copy.empty`（rent/swap） | `common.toast.nothingToCopy` |
| 7 | 保存成功 | rent `user.common.saveSuccess` ｜ swap `merchant.common.saveSuccess` | `common.toast.saveSuccess` |
| 8 | 复制成功 | rent `merchant.orders.idCopied` ｜ swap `label.copied` | `common.toast.copySuccess` |
| 9 | 我知道了 | rent `merchant.profile.iKnow` | `common.action.iKnow` |
| 10 | 收起 | rent `merchant.alert.timelineCollapse` | `common.action.collapse` |
| 11 | 排序 | rent `merchant.profile.modelSort` | `common.action.sort` |
| 12 | 禁用 | rent `merchant.status.disabled` ｜ swap `merchant.cabinet.disable` | `common.status.disabled` |
| 13 | 启用 | rent `merchant.status.enabled` ｜ swap `merchant.cabinet.enable` | `common.status.enabled` |
| 14 | 处理中 | rent `merchant.status.processing` | `common.status.processing` |
| 15 | 完成 | swap `action.done` | `common.action.done` |
| 16 | 重试 | swap `action.retry` | `common.action.retry` |
| 17 | 继续 | swap `action.continue` | `common.action.continue` |
| 18 | 暂无 | swap `label.none` | `common.label.none` |
| 19 | 开启 | swap `demoOps.enable` | `common.action.enable` |

## 说明与待确认

- **不动**的近似项：`common.orders.cancelOrder`=「取消订单」属订单专属动作，保留在 `orders`。
- **跨目录合并**（#7/#8/#12/#13）：现分处两目录的不同 feature key，合并为同一 `common.*` 键后，两目录各删原键。
- **落点**（`common.action` / `common.label` / `common.status` / `common.toast` / `common.dateTime`）为建议，可调整。
- **新建子命名空间**：`common.status`、`common.toast`（当前无）。
- **已落地（2026-09-29）**：19 条全部应用到 5 个语言文件；复跑 `node scripts/i18n_check.mjs` 通过——`common.*` 两目录一致、无 MISSING/ORPHAN、跨目录漂移 0。

## 2026-10-15 新增：首页消息推送三条（纯文字整句）

用户端首页「消息推送」三条的**标题与正文按纯文字整句**落五语——把示例订单号 / 日期 / 金额直接写进句子，不用占位符、不用 JS 模板拼接。同日第二轮按用户口述改名：`续租提醒 → 订单续租提醒`、`扣款提醒 → 订单续租成功`、`扣款失败 → 订单续租失败`，**推送标题与原型操作面板 chip 文案同步改名**（两者逐字相同）；同日第三轮按用户口述**定稿三条正文**（正文不再含示例订单号）。

| 推送槽位（= 标题文案） | 标题 key（新建） | 正文 key |
|---|---|---|
| 订单续租提醒 | `user.home.pushNotify.renewReminderTitle` | `user.home.pushNotify.renewReminderBody` |
| 订单续租成功 | `user.home.pushNotify.renewSuccessTitle` | `user.home.pushNotify.renewSuccessBody` |
| 订单续租失败 | `user.home.pushNotify.renewFailedTitle` | `user.home.pushNotify.renewFailedBody` |

- **标题与 chip 由「复用」改为「新建」**：改名前三个标题与 `common.label.renewReminder / deductReminder / paymentFailed` 中文逐字相同，复用成立；改名后中文值已不同，按「同中文才复用」口径新建 `*Title` 键——`index.html` 的 `renewNotifyTemplates.title`（推送横幅）与原型操作面板三条 chip（`showPushNotify('preview'/'reminder'/'failed')`）取值逐字相同，**共用同一批 `*Title` 键**，键化时两处一起换成 `$t('user.home.pushNotify.*Title')`。
- **旧 `common.label.*` 在 `rent/` 侧本次已无引用**：`common.label.renewReminder / deductReminder / paymentFailed` 值仍为 `续租提醒 / 扣款提醒 / 扣款失败`（`swap/` 侧同值同译，保持不变），键化阶段再复核 `rent/` 侧是否仍有其它页面用到；若无，按「同中文只留一个 key」在 rent 侧删除这三个键。
- **正文键名已与语义对齐（第三轮定稿决定）**：第二轮曾因「第 2 条正文仍是续租前预告」暂缓改名；第三轮正文定稿为成功通知后，按「键名与值一致」统一为 `deductReminderBody → renewSuccessBody`、`paymentFailedBody → renewFailedBody`，与标题键 `renewSuccessTitle / renewFailedTitle` 成对；五语同步改名（键化尚未开始、当前无代码引用，改名零风险）。
- **三条正文定稿（2026-10-15 第三轮，用户口述）**：三条正文全部改为不含订单号的整句，zh-CN 为——①`订单将于2026-09-10 12:00自动续租并扣款Rp 150.000，订单页可关闭自动续租。`②`自动续租扣款Rp 150.000成功，订单续租成功。`③`自动续租扣款第2/3次失败，请尽快充值，多次失败将关闭自动续租。`。时分按用户口述的格式占位 `HH:mm` 落演示值 `12:00`；金额沿用 `Rp 150.000`（与 App `fmtRp` 的 `'Rp '` 符号一致）；第 1 条「并扣款」与句末「订单页可关闭自动续租」按用户口述改写（第二轮为「自动续租扣款」「可在订单页关闭自动续租」）。`index.html` 侧同步：`renewNotifyTemplates` 三条 body 改文，`renewNotifySample()` 去掉已无引用的 `orderId` 与 `N`（仅留 `dueDate / amount / failCount / threshold`）。
- **标题与正文语义一致（第二轮遗留冲突已解决）**：第 2 条标题「订单续租成功」与第三轮定稿正文（`自动续租扣款Rp 150.000成功，订单续租成功。`）均为成功通知，不再出现「标题成功 / 正文预告」的错位。
- **只落在 `rent/`**：推送横幅是用户端 app 级浮层（`pushNotify` 状态驱动），换电端无对应功能，故不进 `swap/`，也不在 `i18n-cross-drift.md` 登记（TERM 无新增共有文案）。
- **数值不本地化**：日期 `2026-09-10 12:00`、金额 `Rp 150.000`、次数 `2/3` 五语逐字一致（演示样例数据，随原型固定）；第三轮起正文已不含订单号。
- **zh-CN 正文取值与 `index.html` 现渲染结果逐字相同**（三条均逐字一致，`index.html` 侧只把示例值插进同一句）；三条标题与 `index.html` 的 `renewNotifyTemplates` 逐字对齐。
- **已知复核项**：`scripts/i18n_check.mjs` 的 NUMBER 人工复核项会标出三条正文里的 `2/3`、`2026-09-10 12:00`、`Rp 150.000`（演示数值、五语逐字一致，人工确认即可）；第二轮登记的「订单号与天数相邻」问题随正文改文自然消失。（**第五轮实测更正**：该条不成立——NUMBER 只在数字集合不一致时报，五语逐字一致则不报；rent 侧实际 4 条 NUMBER 为 `bannerBattery / bannerPromo / priceNotNegative / photoSelected`。）

### 第四轮修订（2026-10-15，按推送通道首屏可读性重排）

依据：系统推送（通知栏/锁屏/消息中心）首屏只稳定展示「标题 + 1~2 行正文」，被折叠的位置最容易落在句尾，故信息顺序改为「数值/原因 → 后果 → 行动」，标题已交代的话题不再在正文重复。

| 条目 | 标题（zh-CN） | 正文（zh-CN） |
|---|---|---|
| ① | 订单续租提醒（不变） | `2026-09-10 12:00将自动续租并扣款Rp 150.000，无需续租请提前关闭。` |
| ② | 订单续租成功（不变） | `扣款Rp 150.000完成，订单租期已延长。` |
| ③ | `订单续租扣款失败`（原「订单续租失败」） | `余额不足，扣款失败（第2/3次）。多次失败将关闭自动续租，请尽快充值。` |

- **③ 标题 `renewFailedTitle` 改值 → 原型面板 chip 同步**：`index.html` 面板第三条 chip（`showPushNotify('failed')`）与推送标题取值逐字相同，已一并改为「订单续租扣款失败」。理由：正文说明还有剩余机会时，原标题「订单续租失败」易被读成"续租已失败/服务已中断"。
- **保留 `2/3` 紧凑计数**（不展开为「第2次…再失败1次」）：en/id/th 既有译文本就是 `attempt 2/3` / `percobaan 2/3` / `ครั้งที่ 2/3`，分数式写法译文改动面更小；语义统一为「共 3 次中的第 2 次」，正文不出现第二种计数表述。
- **① 改短并前置时刻与金额**：删「订单将于」前缀与「订单页可关闭自动续租」落点，句末按用户口述定稿为「无需续租请提前关闭。」；首行不再与标题重复。
- **② 去重「成功」+ 结果前置**：原 `自动续租扣款Rp 150.000成功，订单续租成功。` 两次「成功」且真正结果在句尾，改为 `扣款Rp 150.000完成，订单租期已延长。`；金额统一 `Rp 150.000`（与 App `fmtRp` 的 `'Rp '` 一致，草稿 `Rp150.000` 已纠正），句末补句号。
- **③ 补失败原因并前置**：顺序改为「原因 → 本次次数 → 后果 → 行动」。术语取既有译法：余额不足 id=`Saldo tidak cukup`、th=`ยอดคงเหลือไม่เพียงพอ`；充值 id=`isi ulang`、th=`เติมเงิน`、zh-HK=`增值`。
- **五语同步范围**：`rent/{zh-CN,zh-HK,en,id,th}.json` 同 4 个 key（3 正文 + 1 标题）；`index.html` 的 `renewNotifyTemplates` 三条 body 与失败标题同步。`renewNotifySample()` 未变，正文里的 `2/3` 仍由 `${d.failCount}/${d.threshold}` 注入，与 zh-CN 字面 `（第2/3次）` 逐字一致。
- **数值仍不本地化**：`2026-09-10 12:00`、`Rp 150.000`、`2/3` 五语逐字一致。
- **本轮未采纳（评估过、按用户决定不做）**：①改相对时间（"明天 12:00"）、②给新到期时间、③把「多次失败」换成确定剩余次数。这些留待接入真实消息系统时连同「占位符化 `{dueTime}/{amount}/{remain}` + action button deep link」一并处理。

### 第五轮定稿（2026-10-15，按用户最新口述完全落地）

用户 2026-10-15 给出三条完整推送文案（标题 + 正文），本条为**逐字落地稿**：第三、四轮的正文与全部三个标题一并废止。

| 条目 | 标题（= `*Title` 取值） | 正文（zh-CN） |
|---|---|---|
| ① | `renewReminderTitle` `订单即将自动续租` | `您的订单将于2026-09-10 12:00:00自动续租，并扣款Rp150.000。如不需要续租，请前往订单详情关闭自动续租。` |
| ② | `renewSuccessTitle` `订单自动续租成功` | `您的订单已自动续租成功，扣款Rp150.000，订单有效期已延长至2026-09-11 12:00:00。` |
| ③ | `renewFailedTitle` `订单自动续租失败` | `您的订单自动续租失败（第2/3次），原因：余额不足。请尽快充值，以免续租失败次数过多导致自动续租功能关闭。` |

- **三个标题全部改值**（原 `订单续租提醒 / 订单续租成功 / 订单续租扣款失败`）：`index.html` 的 `renewNotifyTemplates.title`（推送横幅）与原型面板三条 chip（`showPushNotify('preview'/'reminder'/'failed')`）同步改值，两处仍逐字相同；键名不变，键化时仍共用同批 `*Title` 键。
- **句式统一为「您的订单…」**：第三、四轮的 `无需续租请提前关闭` / `订单租期已延长` / `余额不足，扣款失败（第2/3次）` 写法作废；本轮恢复「您的订单」主语与句末落点（`请前往订单详情关闭自动续租`、`以免…导致自动续租功能关闭`）。
- **② 新增到期时间**（第四轮评估过、当时未采纳）：`订单有效期已延长至{新到期}`，与 `user.common.validUntil`（`有效期至{date}`）同术语。
- **时间精度升到秒**：用户口述格式 `HH:mm:ss`，按第一轮「不用占位符、示例值直接写进句子」与第三轮「格式占位落演示值」口径落演示值 `12:00:00`——正文不含 `HH:mm:ss` 占位符。② 的新到期时间演示值 `2026-09-11 12:00:00`（09-10 → 09-11 即 1 天，须与真实订单周期一致）。
- **金额按用户最新字面 `Rp150.000`（无空格）**：与 App `fmtRp`（符号 `'Rp '` 带空格 + `id-ID` 千分位）不一致。第四轮曾按 `fmtRp` 纠正为带空格，本轮按用户定稿改回；**接入期需与消息系统确认金额格式是否统一为 `Rp 150.000`**（消息层文案不经过 `fmtRp`，两处口径若不同会影响用户对账感知）。
- **术语沿用既有译法**：自动续租 en=`auto renewal` / id=`perpanjangan otomatis` / th=`ต่ออายุอัตโนมัติ`；充值 zh-HK=`增值`、id=`isi ulang`、th=`เติมเงิน`；余额不足 id=`saldo tidak cukup`、th=`ยอดคงเหลือไม่เพียงพอ`；有效期 en=`valid until`、id=`masa berlaku`、th=`ระยะเวลาที่มีผล`；订单详情 id=`detail pesanan`、th=`รายละเอียดคำสั่งซื้อ`。
- **五语同步范围**：`rent/{zh-CN,zh-HK,en,id,th}.json` 同 6 个 key（3 正文 + 3 标题）。`index.html`：`renewNotifyTemplates` 三条 title + body 改文；`renewNotifySample()` 新增 `newDueDate`（② 引用）并把 `dueDate` 提到秒级。
- **数值不本地化**：`2026-09-10 12:00:00`、`2026-09-11 12:00:00`、`Rp150.000`、`2/3` 五语逐字一致（演示样例数据，随原型固定）。
- **zh-CN 取值与 `index.html` 渲染结果逐字相同**：`renewNotifySample()` 提供 5 个演示值（`dueDate / newDueDate / amount / failCount / threshold`），三条正文插值后与 zh-CN 字面逐字一致（自检脚本核对）。
- **已知复核项（第五轮实测更正）**：`scripts/i18n_check.mjs` **未把 pushNotify 三条列入 NUMBER 复核**——五语数字集合逐字一致（`2026-09-10 12:00:00` / `2026-09-11 12:00:00` / `Rp150.000` / `2/3`），故不触发；rent 侧实际 4 条 NUMBER 均为 `bannerBattery / bannerPromo / priceNotNegative / photoSelected` 历史项。第一轮登记的「NUMBER 会标出正文数字」经复核不成立，已在下方第一轮条目加注。

## 2026-10-15 新增：消息推送（用户端消息中心 + 商户端推送配置）

新增键全部落在 `rent/`（`index.html` 用户端/商户端），五语同源同步：

| 组 | 键位 | 口径 |
|---|---|---|
| 消息中心 / 通知设置 | `user.message.*`（原 23 键 → **13 键**，见各修订；分类标题两键见修订二十七 / 三十二） | 新建。原 `settingsCenter / settingsOsPush`（站内 / 系统通知）与商户端 `merchant.message.channelOs` 同中文必须同译，均已随页面改版下线（修订二十三 起商户端渠道为「手机通知 / 消息中心」）。现存 `settingsCategoryHead`（消息类型）与 `title`（消息中心）于修订二十四 / 二十三 起同时被商户端「消息类型」标题与「消息中心」渠道名**复用**；`categoryOrderStatus / categoryFeeRefund` 两类标题与说明（修订二十七；修订三十二 随「账户与钱包」大类移除减为两类）被用户端两处设置页与商户端配置页大类**共用** |
| 动作提示 | `user.toast.msg*`（8 键） | 置于 `user.toast` 语境位（紧邻既有 `deviceBound`），**不并入** `common.toast.*`——均属消息推送专有提示 |
| 推送内容 | `user.home.pushNotify.*Title / *Body`（原 8 键 → **28 键**：14 事件 × Title/Body，见修订十八 / 二十二 / 二十七 / 三十二） | **追加**到既有对象，沿用第五轮「纯文字整句」口径（示例日期/金额直接写进句子，不用占位符；示例值取自原型单例 `notifySample()`，与源码模板插值结果逐字相同）。`balanceLowTitle / balanceLowBody`（余额不足提醒）已于修订十八下线；14 条 `*Title` 现同时承载用户端消息中心标题与**商户端事件名**（修订二十二 并入复用，修订二十七 扩至 15 事件；修订三十二 收敛为 14 事件） |
| 商户推送配置 | `merchant.message.*`（28 键 → 15 键 → 8 键 → **6 键**，见下方修订二 / 二十一 / 二十二） | 新建独立语境位（推送配置跨订单/钱包，语义不属于 `merchant.orders.*`）。`eventRenewSuccess / eventRenewFailed` 原为「续租成功 / 续租失败」，因与用户端整句标题中文不同而**不合并**；修订二十二 两端命名统一后中文逐字相同，按「同中文才复用」口径**并入** `user.home.pushNotify.renewSuccessTitle / renewFailedTitle`（事件名不再另登记键） |
| 数值校验提示 | ~~`merchant.message.timingInvalid`~~（含 `dailyLimitInvalid / retryInvalid`，**均已下线**） | 原句式对齐 `merchant.common.preRange`（`请输入 1–365 之间的整数`），以 `{event}` 注入事件名；随 v22「触发规则移交订单配置」于修订二十一 下线——该页已无可非法输入项，保存仅走权限校验 |

- **复用不新建**：`common.label.messagePush`（消息推送，设置页行 + 商户端菜单项）、`merchant.profile.configSaved`（配置已保存）、`common.label.renewReminder`（续租提醒）。
- **只在 `rent/`**：换电端无消息中心与推送配置，不进 `swap/`，跨目录无新增共有中文（TERM 不变）。
- **中文值锚定一致性**：「站内 / 系统通知」在 `user.message.*` 与 `merchant.message.*` 两组内中文逐字相同 → 四语译法逐字一致（同目录内不得一句中文两种译法）。

### 2026-10-15 修订：整体下线「应用内横幅」

用户判定应用内横幅通知与业务场景不符，整轮下线（不影响消息中心与商户端事件配置）：

- **删键 3 个（五语同删）**：`user.message.settingsInApp`（应用内）、`user.toast.msgInAppOff`（已在消息通知设置中关闭应用内提醒）、`merchant.message.channelInApp`（应用内）。键数由上表 `user.message.*` 24→23、`user.toast.msg*` 9→8、`merchant.message.*` 29→28。
- **改值 1 个（五语同改）**：`user.message.settingsMasterDesc` 由「关闭后不再收到应用内横幅与系统推送，消息仍保留在消息中心」改为「关闭后不再收到系统推送，消息仍保留在消息中心」（en/id/th/zh-HK 同步改写，不再出现 in-app banner / spanduk 等表述）。
- **复用键照旧**：`settingsCenter / settingsOsPush / channelOs`（站内 / 系统通知 / 系统通知渠道）与 `user.message.*` 其余键、`merchant.message.*` 其余键全部保留；`user.home.pushNotify.*`（推送标题文案）仍被消息中心条目复用，键名不动（`pushNotify` 仅作历史命名，源码侧已无同名状态）。
- **`index.html` 同步下线**（无键位影响）：`.push-wrap/.push-banner` 等 10 条样式、横幅浮层模板、`pushNotify/showPushNotify/onPushClick/pushTimer/shouldDeliver`、原型面板「消息推送」4 条演示 chip；通知设置页去掉「应用内」列与 `orderRenew.inApp` 偏好（持久化结构变为 `orderRenew:{os}`，旧存值中的 `inApp` 自动忽略）；商户端「发送渠道」只剩「系统通知」chip，默认渠道值 `['IN_APP']*4` → `['OS']*4`。
- **本条第 90 行历史条目中的「推送横幅」「面板三条 chip」表述随之下线**，`renewNotifyTemplates` 现仅由消息中心条目消费。
- 校验：`node scripts/i18n_check.mjs` → 五语 MISSING / ORPHAN / PLACEHOLDER / SUFFIX 全 0，跨目录译法不一致 0；NUMBER 人工复核项 5 条（新增 `merchant.message.templateTip` 的「五种语言 → 5 languages」，属合理本地化，人工确认）。

### 2026-10-15 修订二：商户端推送配置瘦身（去「余额不足 / 发送策略 / 文案说明 / 文案模板」）

用户判定商户端推送配置里的「余额不足」事件与「发送策略 / 文案说明 / 文案模板」三块与当前业务场景不符，全部移除：

- **删键 13 个（五语同删）**，`merchant.message.*` 由 28 → **15 键**，保留集 = `sectionMaster / masterLabel / masterDesc / sectionEvent / eventRenewSuccess / eventRenewFailed / advanceLabel / triggerLabel / triggerSuccessText / failPrefix / failUnit / unitMinute / channel / channelOs / timingInvalid`：
  - 「余额不足」事件 3 键：`eventBalanceLow`（余额不足）、`balanceLowPrefix`（余额低于）、`unitYuan`（元——仅该事件的 `msgEventOpts[].unit` 使用，移除后无引用）；
  - 「文案模板」1 键：`template`；
  - 「发送策略」5 键：`sectionPolicy / dnd / dndDesc / dailyLimit / retry`；
  - 「文案说明」2 键：`sectionTemplate / templateTip`；
  - 随之失效的校验提示 2 键：`dailyLimitInvalid / retryInvalid`（`dailyLimit / retry` 的 toast 源文一并删除）。
- **`index.html` 同步移除**（无键位影响）：模板 7 行（文案模板输入行、发送策略三行 + 区段标题、文案说明两行 + 区段标题）；`msgEventOpts` 去掉余额不足枚举项；`msgCfg` 去掉 `events.balanceLow / timing.balanceLow / channel.balanceLow`、整个 `tpl` 对象与 `dndOn / dailyLimit / retry`（状态由 11 项收敛为 4 项）；`saveMsgCfg` 去掉每日上限 / 重试次数两条校验。保留 `timing`（续租提醒、续租失败仍用）与 `timingInvalid` 校验。
- **保留但无商户端配置对应**：用户端消息中心第 4 条演示消息「余额不足提醒」（`user.home.pushNotify.balanceLowTitle / balanceLowBody` + `renewNotifyTemplates.balanceLow` + `msg04`）**未动**——本次只收商户端配置页；如需两端口径一致，再单独决定是否删除该演示消息及其 2 键。
- 校验：见 `i18n-key-naming.md` 同轮实测（`node scripts/i18n_check.mjs` 硬错误全 0）。

### 2026-10-15 修订三：消息推送更名为消息通知 + 消息中心改卡片列表

**① 更名（五语同改）**

- `common.label.messagePush` → **`common.label.messageNotify`**（键名 + 值「消息推送」→「消息通知」）。该键此后只承担**商户端**语境：「我的」菜单项 / 配置页顶栏标题 / 权限矩阵与原型操作面板的权限名（`message_config.detail`）。用户端原有的第二处引用（系统设置行）已随 ② 删除。
- `user.toast.msgEnabled / msgDisabled`：「已开启消息推送 / 已关闭消息推送」→「已开启消息通知 / 已关闭消息通知」。
- `merchant.message.masterLabel`：「启用消息推送」→「启用消息通知」。
- **`swap/` 侧待同步**：换电端 `common.label.messagePush`（消息推送）本轮保持原样，只改 `rent/`。同步后两端会重新共有「消息推送」这一中文值，TERM 比对将要求两端译法一致——本次有意留作跨端同步项（按 AGENTS.md：共享项只改 index 侧并标注 swap 待同步）。
- **未动**（描述“推送”这一投递通道本身，不是消息中心更名对象）：商户端「推送总开关」、`编辑推送配置`（`message_config.edit` 权限名）、`merchant.message.masterDesc`。

**② 消息中心改版（键位）**

- **删键 5 个（五语同删）**：`user.message.unreadTip`（{count} 条未读）、`markAllRead`（全部已读）、`timeToday` / `timeYesterday` / `timeEarlier`（今天 / 昨天 / 更早）——「X 条未读 / 全部已读」行与「今天·昨天·更早」分组头整轮下线。
- **新增 1 键**：`user.message.clearUnread`＝清除未读（消息中心顶栏「清扫」图标按钮的 `title`，兼作该图标按钮的 i18n 标签位）。`user.message.*` 由 23 → **19 键**（zh-CN / zh-HK / en / id / th 五语同源）。
- **复用不新建**：顶栏「设置」图标复用既有 `user.message.settingsTitle`（消息通知设置），不新建键。
- `index.html` 同步改动（无键位影响）：① 删系统设置页「消息推送」行（`settings-notify-row` + `SetNotifyRow / SetNotifyLabel / SetNotifyRight / SetNotifyVal / SetNotifyChev`）；② 消息中心顶栏改为右对齐双图标圆钮（`msg-clear-unread`＝luci `brush`、`msg-settings`＝luci `settings`；未读为 0 时清除钮置灰禁点），删除「X 条未读」「全部已读」两个节点；③ 列表由「分组白卡 + 行分隔」改为**每条消息一张 `kv-card`**（`#title`＝消息类型 + 未读红点、默认插槽＝消息内容、`#extra`＝通知时间；编辑态多选圆钮仍前置在 `#title` 内）；④ 演示数据由 `group/time` 改为 `daysAgo/hhmm`，时间口径＝**当天只显示时分（12:00）、非当天显示年月日（2026-10-14）**，分组 computed `notifyGroups` → 平铺 `notifyMsgs`（setup 导出列表同步改名）。
- 图标口径说明：lucide 由 CDN 锁定 `0.344.0`，该版本**无**扫帚（`brush-cleaning`）与铃铛齿轮（`bell-cog`）图标，故取最接近的 `brush` / `settings`；如需严格对齐参考图需单独评估升级 lucide 版本。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0（MISSING / ORPHAN / PLACEHOLDER / SUFFIX / TERM 五语均 0）。

### 2026-10-15 修订四：消息中心去「编辑」流程 + 「免打扰时段」下线

**① 消息中心（用户端）去「编辑」及其全部交互**：删顶栏「编辑 / 完成」、卡片多选圆钮、底部「清空已读 / 删除」条与全部多选状态；点击卡片只做「标记已读 + 跳订单」。

- **删键 4 个（五语同删）**：`user.message.clearRead`（清空已读）、`user.toast.msgSelectFirst`（请先选择要删除的消息）、`user.toast.msgDeleted`（已删除）、`user.toast.msgClearedRead`（已清空已读消息）。
- 保留 `user.toast.msgAllRead`（已全部标为已读）——顶栏「清空未读」图标仍复用该提示。

**② 顶栏两个入口移入导航栏右侧**：`msg-clear-unread`（luci `brush`，未读为 0 时置灰禁点）与 `msg-settings`（luci `settings`）由内容区顶部行移入 `nav-bar` 的 `#right` 槽；nav-bar 为此新增 **`right-wide`**（整行由 flex 切 `grid(1fr auto 1fr)`，标题仍在屏幕正中，详见 AGENTS.md §3）。

- **改值 1 个**：`user.message.clearUnread`「清除未读」→「**清空未读**」（zh-HK「清空未讀」；en / id / th 值不变：Clear Unread / Hapus yang Belum Dibaca / ล้างรายการที่ยังไม่ได้อ่าน）。

**③ 「免打扰时段」整块下线**

- **删键 2 个（五语同删）**：`user.message.settingsDndTitle`（免打扰时段）、`user.message.settingsDndDesc`（22:00 - 08:00 不发送提醒，订单与续租消息不受影响）。
- `index.html` 同步：通知设置页删 `MsgSetDndCard`（卡片 + 标题 + 说明 + 开关共 4 个节点）；`notifyPrefs` 结构由 `{master, orderRenew:{os}, dnd:{on}}` 收敛为 **`{master, orderRenew:{os}}`**（`loadNotifyPrefs` 不再读 `dnd`、`saveNotifyPrefs` 不再写，旧存值中的 `dnd` 自动忽略），`toggleNotifyDnd` 与投递注释里的免打扰表述一并移除。
- `AGENTS.md` §1 的持久化特例描述同步去掉「免打扰」。
- 键数：`user.message.*` 19 → **16 键**；`user.toast.msg*` 8 → **5 键**（`user.toast` 共 7 键，含 `deviceBound / deviceUnbound`）。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0（MISSING / ORPHAN / PLACEHOLDER / SUFFIX / TERM 五语均 0）。

### 2026-10-15 修订五：消息通知设置对标参考图（应用外 / 应用内分组行）

用户要求用户端「消息通知设置」对标参考图（美团式分组行：灰分组标题 + 白卡 + 行右「状态/动作 + chevron」）。

- **页面拆两级**：一级 `profileOV==='notify'`（消息通知设置）＝参考图结构；原一级内容（`接收推送通知` 总开关 + `消息类型` 矩阵 + 站内必达说明 + OS 权限条）整体移入新增二级 `profileOV==='notifyPage'`（消息页设置；`NAV_SCREENS` 新增 `ovNotifyPage`；`z` 560 → 562）。
- **一级 4 行**：应用外组＝`手机系统通知`（右侧 `去开启` + chevron）、`短信通知`（chevron）；应用内组＝`横幅通知`（chevron）、`消息页设置`（chevron → 二级页）。
- **新增键 6 个（五语同源）**：`user.message.settingsGroupOuter`（雅迪租车应用外）、`settingsGroupInner`（雅迪租车应用内）、`settingsOsRow`（手机系统通知）、`settingsSmsRow`（短信通知）、`settingsBannerRow`（横幅通知）、`settingsPageRow`（消息页设置，同时用作二级页标题）→ `user.message.*` 16 → **22 键**。
- **新增提示 2 个**：`user.toast.msgSmsUnavailable`（短信通知暂未开放）、`msgBannerUnavailable`（横幅通知暂未开放）——短信 / 横幅两条渠道当前原型无对应能力，先按参考图保留可点行 + 提示，待接能力时替换交互 → `user.toast.msg*` 5 → **7 键**。
- **复用不新建**：`user.location.goSetting`（去开启——与位置授权页同句，译法必须一致）、`user.message.settingsTitle`（消息通知设置）、二级页沿用原 `settingsMaster / settingsMasterDesc / settingsCategoryHead / settingsChannelHead / settingsCenter / settingsOsPush / settingsAlwaysOn / settingsAlwaysOnDesc / settingsOsDenied / settingsOsDeniedAction`。
- **命名说明**：分组标题带品牌前缀（`雅迪租车应用外` / `雅迪租车应用内`），与参考图「美团应用外 / 应用内」同构；en / id / th 用品牌英文名 `Yadea Rental · Outside App / Inside App`（与既有 `appAuthTitle` 的 `Yadea Rental` 写法一致）。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0；短信 / 横幅 / 应用外 / 应用内均只出现在 `rent/`，跨目录无新增共有中文（TERM 不变）。

### 2026-10-15 修订六：通知设置页文案收敛（去品牌前缀 / 改二级页名 / 去两行 / 去悬浮提示）

- **更名（改值，五语同改）**：`settingsGroupOuter`「雅迪租车应用外」→「**应用外**」、`settingsGroupInner`「雅迪租车应用内」→「**应用内**」（en / id / th 同步去掉品牌前缀，仅留 Outside App / Inside App / Di Luar Aplikasi / Di Dalam Aplikasi / นอกแอป / ในแอป）、`settingsPageRow`「消息页设置」→「**消息中心设置**」（同时用作二级页标题）。
- **一级页标题**「消息通知设置」→「**消息通知**」：不再单建键，**复用既有** `common.label.messageNotify`（消息通知，与商户端菜单项 / 权限名同句同译法）。
- **删键 5 个（五语同删）**：`user.message.settingsTitle`（消息通知设置——标题改值后无来源）、`settingsSmsRow`（短信通知）、`settingsBannerRow`（横幅通知）、`user.toast.msgSmsUnavailable`（短信通知暂未开放）、`msgBannerUnavailable`（横幅通知暂未开放）→ `user.message.*` 21 → **18 键**、`user.toast.msg*` 7 → **5 键**。
- **删键 1 个**：`user.message.clearUnread`（清空未读）——该键唯一来源是顶栏图标按钮的 `title` 悬浮提示，用户要求两个顶栏图标**不再有悬浮提示**，故键与语义一并下线（图标改为无文案图标钮）。
- **`index.html` 同步**：一级页标题改「消息通知」；分组标题改「应用外 / 应用内」；**删除「短信通知」「横幅通知」两行**（连同 `openSmsNotify / openBannerNotify` 与 setup 导出）；「消息页设置」行与二级页标题改「消息中心设置」；两个顶栏图标去掉 `title` 属性。
- **扫把图标**：lucide 0.344.0 无扫帚类图标且 `lucide.icons` 为冻结表（注入无效），改为**自建图标表 `LUCI_CUSTOM`**（`brush-cleaning`＝3 条 path，格式同 lucide 图标节点），`luci` 先查自建表——用法与其它图标一致；登记见 AGENTS.md §2-8。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0（TERM 不变）。

### 2026-10-15 修订七：原型操作面板补「手机系统通知」开关（复用既有键）

用户要求「手机系统通知」在**原型操作面板**补一个权限开关（已开启 / 未开启），用于演示系统通知权限的两条分支。

- **零新增键**：面板分组标签复用 `user.message.settingsOsRow`（手机系统通知，与页内行同句同译法）；两个 chip 复用既有演示开关文案 `user.location.demoOn`（已开启）/ `user.location.demoOff`（未开启）——与「定位服务」面板同一对键，符合「复用不新建」。
- **状态与落点**：`notifyPrefs.osDenied`（默认 `true`＝未开启）由面板 `setOsNotify(true|false)` 驱动，作用面为：一级页「手机系统通知」行右侧 `去开启` 的显隐、二级页 `settingsOsDenied` 权限提示条、以及二级页「系统通知」开关是否可切（未开启时点击弹提示且不落盘）。**该态不入 `yadea:notify-prefs`**（与登录状态 / 定位授权等演示开关同口径，仅内存态）；`AGENTS.md` §1 的持久化描述已同步更正为「总开关 / 分类渠道」。
- **面板区块**：`data-od-id="demo-u-os-notify"`（`data-page-node-id="OsNotifyOps"`），`v-if="profileOV==='notify'||profileOV==='notifyPage'"`——仅在这两页出现，且落在**用户端**原型操作面板（商户端面板同位置另有「版本更新」等区块，勿混）。

### 2026-10-15 修订八：新增「手机系统通知」三级页（对标参考图）

用户端「消息通知」一级页的「手机系统通知」行在**权限已开启**时可进入三级页（未开启时原地引导去开启），页面结构对标参考图：顶部权限状态行 + 各消息类型的系统通知接收偏好。

- **新增键 9 个（五语同源）**：分类标题 3 个 `categoryService`（服务提醒）/ `categoryBalance`（余额提醒）/ `categoryPromo`（优惠活动）；分类说明 4 个 `categoryServiceDesc`（重要信息、进度提醒等通知）/ `categoryOrderRenewDesc`（订单状态、续租扣款等通知）/ `categoryBalanceDesc`（钱包余额不足等通知）/ `categoryPromoDesc`（活动优惠、赠送到账等通知）；接收偏好 2 个 `settingsReceive`（接收）/ `settingsReceiveOff`（不接收）→ `user.message.*` 18 → **27 键**。
- **复用不新建**：`订单与续租` 标题沿用既有 `categoryOrderRenew`；权限状态文案 `已开启 / 未开启` 沿用原型面板同一对键 `user.location.demoOn / demoOff`（同句同译法：zh-CN 已开启/未开启、zh-HK 已開啟/未開啟、en On/Off 语境一致）；权限未开启时的提示沿用 `user.toast.msgOsPermission`。
- **分类口径**：参考图的分组为「服务提醒 / 订阅通知 / 优惠活动 / 互动通知」（美团业务），本原型按**租车业务**取「服务提醒 / 订单与续租 / 余额提醒 / 优惠活动」——订阅、互动在本业务无对应能力，不照搬（同 v7 删短信 / 横幅的判定口径）。
- **交互与状态**：服务提醒＝项目统一样式开关；其余 3 行＝右侧「接收 / 不接收」+ chevron，点开共享 `option-sheet`（接收 / 不接收）选择。分类偏好为**内存态**（`osCats`），与权限态一并由原型面板驱动；权限未开启时分类卡置灰（`opacity-60`）且点击弹提示、不改状态。

### 2026-10-15 修订九：下线「请前往系统设置开启通知权限」提示及其触发控件

用户判定该提示在**已开启 / 未开启两种状态下都不应弹出**，故连同只会触发它的两个控件一并下线：

- **删键 2 个（五语同删）**：`user.toast.msgOsSettingGo`（请前往系统设置开启通知权限——唯一来源即该 toast）、`user.message.settingsOsDeniedAction`（去设置——唯一来源即二级页权限提示条上的入口）→ `user.message.*` 27 → **26 键**、`user.toast` 7 → **6 键**。
- **`index.html` 同步**：删 `openOsNotifySettings()`（及 setup 导出）；三级页顶部状态行改为**只读状态行**（去掉 `@click`/`data-cp`/按压态与右侧 chevron，仅保留「手机系统通知 + 已开启/未开启」）；二级页权限提示条改为**纯文案条**（去掉「去设置」入口，保留图标与「系统通知权限未开启」）。
- **保留（不同文案，仅未开启时触发）**：受限态守卫 `osNotReady()` 的 `user.toast.msgOsPermission`（系统通知权限未开启，请先前往系统设置开启）——用于「未开启时点手机系统通知行 / 分类开关 / 系统通知开关」的拦截反馈；如需一并静音，再单独定（届时该三处为静默拦截）。

### 2026-10-15 修订十：三级页收敛为「仅订单与续租 + 开关」

用户判定「手机系统通知」三级页只需保留**订单与续租**一类，且改为**开关**形式（不再用「接收 / 不接收」+ 选项弹窗）。

- **删键 8 个（五语同删）**：分类标题 3 个 `categoryService`（服务提醒）/ `categoryBalance`（余额提醒）/ `categoryPromo`（优惠活动）、对应说明 3 个 `categoryServiceDesc / categoryBalanceDesc / categoryPromoDesc`、接收偏好 2 个 `settingsReceive`（接收）/ `settingsReceiveOff`（不接收）→ `user.message.*` 26 → **18 键**（与 v7 时同数）。
- **保留 2 键**：`categoryOrderRenew`（订单与续租——三级页唯一分类行的标题）、`categoryOrderRenewDesc`（订单状态、续租扣款等通知——该行说明）。
- **`index.html` 同步**：三级页分类卡只留「订单与续租 + 说明 + 项目统一样式开关」（`data-od-id="os-cat-renew-switch"`，`:class` 绑 `osRenewOn`）；下线共享 `option-sheet`（`osCatKey` 及其标题/取值 computed）、`osCatTitles / osCatOptions / osCats / osCatOn / toggleOsCat / openOsCatSheet / closeOsCatSheet / pickOsCat` 全部删除，状态收敛为单一 `osRenewOn` + `toggleOsRenew()`（沿用 `osNotReady()` 权限守卫）；`ovNotifyOs.close` 去掉选项态复位。
- 说明：分类口径（`categoryXxx` 扁平命名）仍沿用 `i18n-key-naming.md` 既有约定，后续若要加分类行直接续用该前缀。

### 2026-10-15 修订十一：权限守卫静默化（未开启时点击无反应、不弹提示）

用户要求「系统通知权限未开启，请先前往系统设置开启」这句在**未开启状态下也不弹**（点击视为无反应），故系统通知的受限态改为**静默拦截**：

- **删键 1 个（五语同删）**：`user.toast.msgOsPermission`（系统通知权限未开启，请先前往系统设置开启）——唯一来源即两处守卫提示 → `user.toast` 6 → **5 键**。
- **`index.html` 同步**：`osNotReady()` 改为纯判定 `return !!notifyPrefs.value.osDenied`（注释标明「静默拦截，点击视为无反应」）；`toggleNotifyOs()`（二级页「系统通知」开关）去掉守卫 `toast`，未开启时`return` 直接不生效。受影响入口：一级页「手机系统通知」行、三级页「订单与续租」开关、二级页「系统通知」开关。
- **权限态仍可感知（不靠提示）**：一级页行右「去开启」（`notifyPrefs.osDenied` 时显示）、三级页顶部状态行 `已开启/未开启`、三级页分类卡 `opacity-60`、二级页橙色提示条「系统通知权限未开启」（`user.message.settingsOsDenied`，保留）。
- 至此系统通知相关的**全部提示 toast 已下线**（`user.toast` 中的 msg* 仅剩 `msgEnabled / msgDisabled / msgAllRead` 三个总开关与已读提示）。

### 2026-10-15 修订十二：两处「手机系统通知」行统一回显状态 + 右箭头（零键位变化）

用户要求「消息通知」一级页与「手机系统通知」三级页的两处同名行都**回显是否开启**并带**右箭头**。

- **一级页行**：「手机系统通知」右侧由条件文案「去开启」（仅未开启时显示）改为**常显状态回显**「未开启 / 已开启」+ 右箭头——未开启用 `var(--link)`、已开启用 `#999`。
- **三级页状态行**：上一轮去掉的右箭头**按本次要求补回**（状态回显「未开启 / 已开启」保持不变）；该行仍为只读（无 `data-cp`/按压态），点击无反应（与 v10/v12 的「不弹提示」口径一致）。
- **键位：零新增、零删除**。两处文案沿用同一对演示键 `user.location.demoOn`（已开启）/ `user.location.demoOff`（未开启）——两处模板表达式逐字相同，满足「同句中文同键同译法」。该行不再使用 `user.location.goSetting`（去开启），但该键仍被定位页「重新定位」与两处定位服务弹窗使用，**保留不动**。

### 2026-10-15 修订十三：消息中心页更名 + 去说明行 + 消息类型改同形单行开关

- **更名（改值，五语同改）**：`settingsPageRow`「消息中心设置」→「**消息中心页**」（同时用作该二级页导航标题）；`settingsMaster`「接收推送通知」→「**接收消息通知**」。
- **删键 6 个（五语同删）**：`user.message.settingsMasterDesc`（关闭后不再收到系统推送，消息仍保留在消息中心——总开关说明行整行移除）、`settingsChannelHead`（接收方式）/ `settingsCenter`（站内）/ `settingsOsPush`（系统通知）——两列矩阵表头、`settingsAlwaysOn`（必收）/ `settingsAlwaysOnDesc`（站内消息始终接收，不可关闭）——矩阵行内标签与尾部说明 → `user.message.*` 18 → **12 键**。
- **「消息类型」板块改为与「手机系统通知」页同形**：矩阵（表头两列 + 必收标签 + 尾部说明）整块替换为**单行开关**——「订单与续租」标题沿用 `categoryOrderRenew`、说明沿用 `categoryOrderRenewDesc`（订单状态、续租扣款等通知，与三级页同句同键），右侧为项目统一样式开关。
- **两级共用同一分类开关状态**：该开关与三级页「订单与续租」开关均为 `notifyPrefs.orderRenew.os`（**持久化，随 `saveNotifyPrefs` 落盘**），均走 `toggleNotifyOs()`（`master` 关或 `osDenied` 时静默拦截）；原三级页独立内存态 `osRenewOn` / `toggleOsRenew` 已删除。
- 保留：`user.message.settingsOsDenied`（系统通知权限未开启——提示条文案）、`settingsCategoryHead`（消息类型——板块标题）、`settingsOsRow`（手机系统通知）等。

### 2026-10-15 修订十四：「手机系统通知」页补「消息类型」分组标题（零键位变化）

用户要求「消息类型」分组标题在两处都出现：二级「消息中心页」原本已有，本轮给三级「手机系统通知」页的「订单与续租」分类卡**补上同名标题**。

- **零键位变化**：标题文案沿用既有 `user.message.settingsCategoryHead`（消息类型），两页同句同键；两处 markup 的 class 也逐字相同（`text-[13px] font-medium text-[#999] mb-2 mt-5 px-1`），保证分组标题样式一致。
- **`index.html` 同步**：在三级页状态卡与分类卡之间插入 `data-page-node-id="MsgOsTypeHead"` 标题节点，并去掉分类卡原有的 `mt-3`（间距改由标题的 `mt-5 mb-2` 提供，与二级页同构）。

### 2026-10-15 修订十五：开关切换提示整体下线（五语同删 2 键）

用户要求「开关的时候不弹提示消息」——通知设置各开关切换时不再弹提示，状态只由开关本身（轨道上色 / 圆点位移）与行内回显表达。

- **删键 2 个（五语同删）**：`user.toast.msgEnabled`（已开启消息通知）、`user.toast.msgDisabled`（已关闭消息通知）——唯一来源即 `toggleNotifyMaster` 的提示 → `user.toast` 5 → **3 键**（`deviceBound / deviceUnbound / msgAllRead`）。
- **`index.html` 同步**：`toggleNotifyMaster()` 去掉 `toast(...)`，只留 `notifyPrefs.master` 取反 + `saveNotifyPrefs()`，注释标明「开关一律静默」。
- **核查（用户端其余开关本已静默，未动）**：`toggleNotifyOs()`（二级 / 三级「订单与续租」）— 修订十二 起静默拦截（`!master` 或 `osDenied` 时直接 `return`）；`toggleAutoRenew()`（`autorenew-switch`，车辆详情 / 订单详情）本就无提示。用户端三处通知开关（总开关 / 二级分类 / 三级分类）现已全部静默。
- **保留（非开关触发）**：`user.toast.msgAllRead`（已全部标为已读）来源是消息中心顶栏「清空未读」**图标按钮**；商户端权限守卫 `deny()` 的「无权限」提示属授权拦截、非开关反馈，均按本次口径保留。
- 删除后「已开启 / 已关闭消息通知」两句在 `locales/swap` 中不存在，无跨目录 TERM 影响（共有同中文 442 条、不一致 0 条维持不变）。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0（MISSING / ORPHAN / PLACEHOLDER / SUFFIX / TERM 五语均 0）。

### 2026-10-15 修订十六：子开关禁用态 + 「手机系统通知」改开关（零键位变化）

用户要求两处改动：①「消息中心页」总开关关闭时**只禁用子开关、卡片不再置灰**；②三级页「手机系统通知」行**去掉右侧「已开启 / 未开启」回显，改为开关**。

- **零键位变化**：本轮不增删任何键。三级页去掉的回显文案（`已开启 / 未开启`）在源码中本就是硬编码字面量、且同一对中文仍用于「消息通知」一级页行右回显与原型操作面板 chip，键位不受影响；新开关无文案（状态由轨道上色与圆点位移表达）。
- **禁用口径（两页同构）**：新增 `osSwEnabled`（`master && !osDenied`）与 `swCls(on,enabled)`——可用时沿用原色（选中 `#2B3F5F` / 未选中 `#E5E5E5` + `cursor-pointer` + `data-cp`），禁用时统一 `bg-[#E5E5E5] opacity-50 cursor-not-allowed` 并去掉 `data-cp`（iOS 口径：保留子开关自身位置、整体淡化，不改变其取值）。
- **卡片不置灰**：删 `MsgSetRowRenewCard` 的 `notifyPrefs.master?'':'opacity-60'` 与 `MsgOsCatCard` 的 `notifyPrefs.osDenied?'opacity-60':''`——受限态完全由子开关表达。
- **三级页权限行改开关**：删回显与右箭头（节点 `MsgOsStatusRight / MsgOsStatusState / MsgOsStatusChev`），新增开关 `MsgOsStatusSw / MsgOsStatusKnob`（`data-od-id="os-notify-switch"`，handler `toggleOsNotifyPerm`，与原型操作面板 chip 同一内存态 `notifyPrefs.osDenied`）。
- **进入守卫放开**：`enterOsNotify()` 不再拦截（原 `osNotReady()` 一并删除）——权限开关已页内化，若仍拦截则「页内关闭权限 → 回一级页后无法再进入开启」形成死路；现未开启时一级页行右回显「未开启」（蓝）仍可点入三级页开启。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0（本轮无键位改动，`user.message.*` 12 键、`user.toast` 3 键不变）。

### 2026-10-15 修订十七：订单类通知点击直达对应订单「费用明细」（零键位变化）

3 条订单类通知（订单即将自动续租 / 订单自动续租成功 / 订单自动续租失败）点击后不再进「我的订单」，而是直达**该消息对应订单**的「费用明细」页。

- **零键位变化**：跳转目标页（用户端「费用明细」，标题与各字段行）均为既有页面与既有文案，本轮不增删任何键。
- **消息 → 订单绑定**：`notifyList` 的 3 条订单类通知新增 `orderId:'YZ202512180001'`（该消息「对应订单」的订单号）；余额不足提醒**不带** `orderId`，点击仍走原「我的订单」。
- **取单来源**：新增 `findOrderById(id)`（在用户端演示订单册 `orderDataByCategory` 三类里按订单号查，连分类一起回）。
- **装载复用**：从 `openOrderDetailCore` 抽出纯构造器 `orderInfoOf(o,cat)`（原内联 `_oi` 字段逐字保留），消息直达时**同步**写 `orderInfo`（不走 600ms 进度条，避免费用明细页先渲染上一条订单），随后 `showFeeDetail=true`。列表/电池/爱车三处调用点仍单参，行为不变。

### 2026-10-15 修订十八：余额不足提醒下线（五语同删 2 键）

用户要求移除消息中心的「余额不足提醒」——它是该列表里唯一的非订单类通知（点击本就走「我的订单」回落），移除后消息中心只剩 3 条订单类通知。

- **删键 2 个（五语同删）**：`user.home.pushNotify.balanceLowTitle`（余额不足提醒）、`balanceLowBody`（您的账户余额不足，可能影响订单自动续租，请尽快充值。）→ `user.home.pushNotify` 8 → **6 键**（renewReminder / renewSuccess / renewFailed 各 title + body）。
- **`index.html` 同步**：`notifyList` 删 `msg04`；`renewNotifyTemplates` 删 `balanceLow` 条目（唯一来源）；消息列表注释与 `onNotifyClick` 注释同步改写。
- **保留**：`renewFailed` 正文仍含「原因：余额不足」——那是「续租失败」事件的失败原因说明，与被移除的「余额不足提醒」是两条不同消息；`onNotifyClick` 的 `!hit` 兜底（回落「我的订单」）亦保留。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0；`locales/rent` 五语 `pushNotify` 均 6 键、键集一致。

### 2026-10-15 修订十九：「清空未读」提示改值（五语同步，键位不变）

用户给定新文案「已将消息置为已读」，替换顶栏「清空未读」图标点击后的原提示「已全部标为已读」。

- **改值 1 个（五语同改）**：`user.toast.msgAllRead` 「已全部标为已读」→ **「已将消息置为已读」**（zh-HK 已將訊息置為已讀、en Messages marked as read、id Pesan ditandai sudah dibaca、th ทำเครื่องหมายข้อความว่าอ่านแล้ว）。键名与键位不动，`user.toast` 仍 3 键（`deviceBound / deviceUnbound / msgAllRead`）。
- **`index.html` 同步**：`markAllNotifyRead()` 内 `toast('已全部标为已读','success')` → `toast('已将消息置为已读','success')`（行为不变：一键把全部消息置为已读、未读红点与我的页徽标同步清零）。
- **口径**：该提示仍是消息中心**唯一**保留的 toast（来源为顶栏图标按钮，非开关；开关静默口径见修订十五）。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0；该句中文在 `locales/swap` 不存在，无跨目录 TERM 影响（共有同中文 442 条、不一致 0 条维持）。

### 2026-10-15 修订二十：一级页「手机系统通知」行去状态回显 + 下线原型操作面板入口（零键位变化）

用户要求：①「应用外」组下的「手机系统通知」行**不再显示是否开启**；②移除原型操作面板里的「手机系统通知」按钮。

- **零键位变化**：行右去掉的「已开启 / 未开启」是源码里的硬编码字面量（其对应键位 `user.location.demoOn / demoOff` 仍用于定位演示与其它回显，不受影响）；「手机系统通知」标题沿用 `settingsOsRow`；本轮不增删任何键。
- **一级页行**：删右侧包裹层与状态文案（节点 `MsgSetOsRowRight / MsgSetOsRowState`），仅保留「标题 + chevron」，`data-cp` 与 `@click="enterOsNotify"` 不变（仍可进三级页）。
- **原型操作面板**：整块删除（`demo-ops-section[data-od-id="demo-u-os-notify"]` + 注释 + 已开启/未开启两个 chip），`setOsNotify()` 与其 setup 导出同步移除（成为死码）。
- **权限态的唯一入口 = 三级页开关**：`notifyPrefs.osDenied` 现只由 `toggleOsNotifyPerm` 切换；状态感知改为①三级页开关本身、②「消息中心页」的橙色提示条（`MsgSetOsDenied`，保留）。默认 `osDenied:true`（未开启），刷新后回到未开启。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0（本轮无键位改动）。

### 2026-10-15 修订二十一：商户端「消息通知」去触发规则（五语同删 7 键）

用户判定：**通知事件的触发规则不应在「消息通知」配置页设置**——它已由「订单配置」统一管理（`cfg.renewAdvanceMinutes` 时租订单到期前 N 分钟自动续租 / `cfg.renewAdvanceDays` 其它订单到期前 N 天 / `cfg.renewFailThreshold` 连续扣款失败 N 次后关闭自动续租）。

- **删键 7 个（五语同删）**：`advanceLabel`（到期前提前）、`triggerLabel`（触发时机）、`triggerSuccessText`（扣款成功后实时发送）、`failPrefix`（第）、`failUnit`（次失败时发送）、`unitMinute`（分钟）、`timingInvalid`（触发时机设置不正确，请检查「{event}」）→ `merchant.message.*` 15 → **8 键**（`sectionMaster / masterLabel / masterDesc / sectionEvent / eventRenewSuccess / eventRenewFailed / channel / channelOs`）。
- **`index.html` 同步**：①页面删每个事件下的「触发规则」行（数字输入 / 静态时机文案两条分支一并删），事件下只剩「发送渠道」；②`msgEventOpts` 由 `{k,l,mode,label,text,unit,def,min,max}` 收敛为 **`{k,l}`**；③`msgCfg` 去掉 `timing` → `{enabled, events, channel}`；④`saveMsgCfg` 删触发时机区间校验（该项已无输入源），保留权限校验与保存反馈。
- **保留**：总开关、3 个事件开关、发送渠道（系统通知）与「配置已保存」提示。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0；`merchant.message` 五语键集一致。

### 2026-10-15 修订二十二：商户端事件名对齐用户端标题（五语同删 2 键，并入标题键）

用户要求「通知事件的命名跟用户端的标题保持一致」——商户端「消息通知」页的事件名由「续租提醒 / 续租成功 / 续租失败」改为与用户端消息标题**逐字同句**的「订单即将自动续租 / 订单自动续租成功 / 订单自动续租失败」。

- **删键 2 个（五语同删）**：`merchant.message.eventRenewSuccess`（续租成功）、`eventRenewFailed`（续租失败）→ `merchant.message.*` 8 → **6 键**（`sectionMaster / masterLabel / masterDesc / sectionEvent / channel / channelOs`）。
- **并入不新建（按「同中文才复用」口径）**：三个事件名现与 `user.home.pushNotify.renewReminderTitle / renewSuccessTitle / renewFailedTitle` 中文逐字相同——该批键已同时承载用户端消息中心标题与推送横幅标题，商户端事件名**直接复用同一批键**，两端命名与译法由此强制一致（en/id/th/zh-HK 无需另立译法）。此结论同时**推翻修订一/二 的「不合并」判定**（当时理由是中文不同，现已相同）。
- **`index.html` 同步**：`msgEventOpts` 的 `l` 改为三句整句标题，并加注释指明与 `renewNotifyTemplates.title` / 推送横幅同源。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0；`merchant.message` 五语键集一致。

### 2026-10-15 修订二十三：商户端发送渠道改为「手机通知 / 消息中心」两枚（改键名+值，零新增键）

用户要求发送渠道由单一「系统通知」改为两枚：**手机通知**、**消息中心**。

- **改键名 + 改值（五语同步）**：`merchant.message.channelOs`（系统通知 / System Push / Push Sistem / พุชระบบ）→ **`channelPhone`（手机通知 / 手機通知 / Phone Notification / Notifikasi Ponsel / การแจ้งเตือนบนมือถือ）** —— 标签从「系统通知」改为「手机通知」，键名同步改以匹配语义；`merchant.message.*` 键数不变（6 键）。
- **「消息中心」不新建键**：按「同中文才复用」口径复用既有 `user.message.title`（消息中心）——该键即用户端消息中心页标题，同句同译法，两端强制一致。
- **`index.html` 同步**：新增 `msgChannelOpts=[{v:'OS',l:'手机通知'},{v:'CENTER',l:'消息中心'}]`（并加入商户端 setup 导出），渠道 chip 改为 `v-for` 数据驱动；`msgCfg.channel` 由三处 `['OS']` 改为 **`['OS','CENTER']`**（默认两条渠道都开）；`toggleMsgChannel` 不变（按值增删）。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0；`merchant.message` 五语键集一致。

### 2026-10-15 修订二十四：商户端分组标题「通知事件」→「消息类型」（五语同删 1 键）

用户要求分组标题与用户端一致：商户端「消息类型」、用户端「消息类型」同句。

- **删键 1 个（五语同删）**：`merchant.message.sectionEvent`（通知事件 / Notification Events）→ `merchant.message.*` 6 → **5 键**（`sectionMaster / masterLabel / masterDesc / channel / channelPhone`）。
- **复用不新建**：标题「消息类型」沿用既有 `user.message.settingsCategoryHead`（用户端「消息中心页」「手机系统通知」两页的分组标题，同句同译法：訊息類型 / Message Types / Jenis Pesan / ประเภทข้อความ）。
- **`index.html` 同步**：`<div class="od-sec">通知事件</div>` → `<div class="od-sec">消息类型</div>`。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0。

### 2026-10-16 修订二十五：商户端「发送渠道」→「推送渠道」（改值 1 个，五语同步）

用户要求把商户端消息通知页每个事件下的字段标签由「发送渠道」改为「推送渠道」。

- **改值 1 个（五语同步）**：`merchant.message.channel`（发送渠道 / 發送渠道 / Delivery Channel / Saluran Pengiriman / ช่องทางส่ง）→ **推送渠道 / 推送渠道 / Push Channel / Saluran Push / ช่องทางพุช**；键名 `channel` 语义未变（渠道），保持不变，`merchant.message.*` 键数不变（5 键）。
- **`index.html` 同步**：事件下的字段标签「发送渠道」→「推送渠道」；页面结构注释与 setup 注释（两处）同步改写，不改内部标识（`msgChannelOpts` / `toggleMsgChannel` / `msgCfg.channel`）。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0；`merchant.message` 五语键集一致。

### 2026-10-16 修订二十六：商户端总开关并入「消息通知」卡头（五语同删 1 键）

用户要求总开关不要单占一行，直接落在「消息通知」这个卡头标题行上（与「充值配置」页「充值功能 + 开关」同形），删除独立文案「启用消息通知」。

- **删键 1 个（五语同删）**：`merchant.message.masterLabel`（启用消息通知 / 啟用訊息通知 / Enable notifications / Aktifkan notifikasi / เปิดการแจ้งเตือน）——独立行文案已下线，卡头标题改用既有 `common.label.messageNotify`（消息通知，与商户端「我的」菜单项、配置页顶栏标题同句同译法）→ `merchant.message.*` 5 → **4 键**（`channel / channelPhone` 等其余不变）。
- **`index.html` 同步**：卡头由 `<div class="od-sec">消息通知</div>` + 独立 `.form-row`（启用消息通知 + 开关）合并为 `<div class="od-sec flex items-center justify-between">`（标题 + `od-switch`），`data-od-id="msg-enable-switch"` 与 `msgCfg.enabled` 状态、`v-if` 联动均不变；页面注释补记「卡头即总开关」及其键位。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0；`merchant.message` 五语键集一致。

### 2026-10-16 修订二十七：消息通知分类三分（订单状态 / 费用与退款 / 账户与钱包）

用户要求把消息通知分类由单一「订单与续租」拆为三类：**订单状态 / 费用与退款 / 账户与钱包**（商户端配置页大类与用户端「消息中心页」「手机系统通知」两处设置页分类行同源同步）。

- **新增键 24 个（五语同源）**：`user.home.pushNotify.*` 12 个新事件的 Title / Body——`orderCreated / orderPaid / deviceBound / orderExpiring / orderOverdue / orderBreach / orderCompleted / orderCancelled`（订单状态）、`orderAdjusted / orderRefunding / orderRefunded`（费用与退款）、`rechargeSuccess`（账户与钱包）→ 6 → **30 键**（15 事件 × Title/Body）。沿用「纯文字整句、示例值直写、不用占位符」口径，示例值取自原型单例 `notifySample()`，源码模板插值结果与键值**逐字相同**。
- **删键 2 个（五语同删）**：`user.message.categoryOrderRenew`（订单与续租）、`categoryOrderRenewDesc`（订单状态、续租扣款等通知）。
- **新增键 6 个（五语同源）**：`user.message.categoryOrderStatus`（订单状态）/ `categoryOrderStatusDesc`（订单状态、续租扣款等通知）、`categoryFeeRefund`（费用与退款）/ `categoryFeeRefundDesc`（订单改价、退款等通知）、`categoryAccountWallet`（账户与钱包）/ `categoryAccountWalletDesc`（充值到账等通知）→ `user.message.*` **11 → 15 键**（净 +4）。其中 `categoryOrderStatusDesc` 承自被删的 `categoryOrderRenewDesc`（**同句，仅键名随大类改名**）。
- **两端共用同一批分类键（复用不新建）**：商户端 `msgCatOpts` 的 `l`（订单状态 / 费用与退款 / 账户与钱包）与用户端 `notifyCatOpts` 的 `l` / `d` 同句同键，商户端不另立分类键（修订二十二 的复用口径延续）。
- **`index.html` 同步**：①用户端新建 `notifyCatOpts`（三类含说明），两处设置页分类卡改 `v-for`（开关仍为行内项目统一样式）；②`notifyPrefs` 由 `{master, orderRenew:{os}, osDenied}` 改为 `{master, cats:{orderStatus/feeRefund/accountWallet:{os}}, osDenied}`，`loadNotifyPrefs` 兼容旧结构（旧 `orderRenew.os` 并入 `orderStatus`）、`saveNotifyPrefs` 只写 `cats`，`toggleNotifyOs(k)` 改收大类键；③商户端 `msgCatOpts` 三项 + `msgEventOpts` 15 条（新增 `cat` 字段指向大类），`msgCfg` 的 `cats` / `events` / `channel` 按新集合生成，大类关闭时其下小类整块隐藏（`v-show`）并保留逻辑守卫；④`renewNotifyTemplates` / `renewNotifySample` 更名并扩为 `notifyTemplates`（15 条，`title` 静态串或 `d=>` 函数）/ `notifySample()`，用户端消息中心 `notifyList` 由 3 条扩为 15 条（`msg01`–`msg15`），点击按 `orderId` 直达订单「费用明细」、钱包类（`target:'wallet'`）直达钱包。
- **口径澄清（无键位影响）**：商户端事件名为**用户端标题逐字同句**，动态值同样按「示例值直写」口径（如「订单已创建，请在2026-09-10 12:00:00前完成支付」「订单已逾期7天，车辆/电池已远程锁定」「已退款Rp150.000」），不使用 `{deadline}` / `{days}` / `{amount}` 占位符。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0；`locales/rent` 五语叶键 **1231** 条、键集完全一致（missing / extra 均 0）；`user.home.pushNotify` 五语各 30 键；`notify-events-timing.md` 同步改版（事件清单 15 条 + 分类表 + 落地现状）。

### 2026-10-16 修订二十八：通知标题精简 + 订单配置「连续扣款失败次数上限」

用户反馈「很多通知标题命名有问题，太长了」，并明确订单配置字段含义。

- **标题精简（改值不改键，8 个 `*Title` × 五语）**：由「事件 + 附加说明」长句改为**纯事件短句**（最长 10 字），动态值（时间 / 天数 / 金额）一律移出标题、只留在 `*Body`：

  | 键 | 原值 | 新值 |
  | --- | --- | --- |
  | `orderCreatedTitle` | 订单已创建，请在2026-09-10 12:00:00前完成支付 | 订单已创建 |
  | `orderPaidTitle` | 订单支付成功，请绑定车辆/电池 | 订单支付成功 |
  | `deviceBoundTitle` | 车辆/电池已绑定，订单已开始 | 车辆/电池已绑定 |
  | `orderExpiringTitle` | 订单即将到期，请及时归还或续租 | 订单即将到期 |
  | `orderOverdueTitle` | 订单已逾期，请及时归还或续租 | 订单已逾期 |
  | `orderBreachTitle` | 订单已逾期7天，车辆/电池已远程锁定 | 车辆/电池已远程锁定 |
  | `orderCompletedTitle` | 订单已完成，感谢使用 | 订单已完成 |
  | `orderRefundedTitle` | 已退款Rp150.000 | 退款成功 |

  其余 7 条（`renewReminder / renewSuccess / renewFailed / orderCancelled / orderAdjusted / orderRefunding / rechargeSuccess`）本已是短句，未改。
- **同句同译（TERM 口径）**：`orderRefundedTitle` 新值「退款成功」与既有 `common.orders.refundSuccess` 同中文，五语逐字对齐（zh-HK 退款成功 / en Refund Successful / id Pengembalian Dana Berhasil / th คืนเงินสำเร็จ）；`orderCancelledTitle` 与 `common.orders.orderCancelled` 的对齐沿用修订二十七。TERM 检查 0 不一致。
- **两端同步（复用口径不变）**：商户端事件名（`msgEventOpts[].l`）＝用户端 `notifyTemplates[].title`＝五语 `*Title`，三者逐字一致；`title` 现**全部为静态短句**（`orderCreated` / `orderBreach` / `orderRefunded` 由 `d=>` 函数改为静态字符串），动态值只在 `body`。
- **订单配置字段（`merchant.renewal`）**：删除 `failClose`（连续扣款失败{n}次后关闭订单自动续租），新建 `failThreshold`（连续扣款失败次数上限；en Max Consecutive Failed Charges / id Batas Maksimal Penagihan Gagal Berturut-turut / th จำนวนครั้งสูงสุดที่หักเงินไม่สำเร็จติดต่อกัน）；单位「次」**复用**既有 `merchant.alert.countSuffix`（次 / 次 / times / kali / ครั้ง），不新建。
- **删键 1 个（rent 侧，五语同删）**：`common.label.continuousPaymentFailed`（连续扣款失败）——租车端已无对应中文文案（该行标签改为 `merchant.renewal.failThreshold`）；`swap` 侧保留不动，两目录 common 键集因此相差此 1 项（不影响校验：TERM 以中文值为锚点，rent 侧无该句中文）。
- **`index.html` 同步**：订单配置页行文案改为 `连续扣款失败次数上限 [输入框] 次`（移除「后关闭订单自动续租」）；`notifyTemplates` 8 条 `title` 改短（3 条改静态串）；`msgEventOpts` 事件名同步；两处注释改为「标题恒为静态短句，动态值只在 body」。`cfg.renewFailThreshold` 状态字段名与逻辑不变。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0（MISSING / ORPHAN / PLACEHOLDER / SUFFIX 均 0，TERM 不一致 0）；`locales/rent` 五语叶键 **1230** 条（-1：删 2 键 + 增 1 键）、键集完全一致；15 条标题全部 ≤10 字（最长 `orderBreach`「车辆/电池已远程锁定」）且不含占位符；内联脚本 0 语法错误；Playwright 实机通过（订单配置页字段、商户端配置页 15 事件名单行、用户端消息中心 15 条标题单行无截断）。

### 2026-10-16 修订二十九：两条通知标题再改值（`deviceBound` / `orderOverdue`）

用户核对「车辆/电池已绑定 / 订单已逾期 / 车辆/电池已远程锁定」三条标题与前期定义不一致后，逐条给出目标标题。

- **改值 2 条（改值不改键 × 五语，键数不变）**：

  | 键 | 原值（修订二十八） | 新值 | zh-HK | en | id | th |
  | --- | --- | --- | --- | --- | --- | --- |
  | `deviceBoundTitle` | 车辆/电池已绑定 | **订单已开始** | 訂單已開始 | Order Started | Pesanan Dimulai | คำสั่งซื้อเริ่มแล้ว |
  | `orderOverdueTitle` | 订单已逾期 | **订单已到期** | 訂單已到期 | Order Has Expired | Pesanan Telah Berakhir | คำสั่งซื้อหมดอายุแล้ว |

- **口径**：`orderOverdueTitle` 新值与订单详情页 `overdue` 横幅「订单已到期，请及时前往门店归还」（`common.orders.overdueReminder`）同口径，五语取词对齐既有译法（`Order has expired` / `Pesanan telah berakhir` / `คำสั่งซื้อหมดอายุแล้ว`）；「逾期」一词自此只在 `orderBreach` 的正文出现，标题不再拆分该语义。`deviceBoundTitle` 与既有 `pickupStartHint`（`Order duration starts…`）取词一致；`orderBreachTitle`「车辆/电池已远程锁定」维持不变。
- **两端同步**：`notifyTemplates[].title` / `msgEventOpts[].l` / 五语 `*Title` 三方逐字一致；`notify-events-timing.md` 事件清单第 3、8 行同步改值。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0（MISSING / ORPHAN / PLACEHOLDER / SUFFIX / TERM 均 0）；`locales/rent` 五语叶键 **1230** 条不变、键集一致；15 条标题仍 ≤10 字且无占位符。

### 2026-10-16 修订三十：`orderBreach` 正文改值（删末句「归还设备」）

用户给出 `orderBreachBody` 目标文案后改值：

- **改值 1 条（改值不改键 × 五语，键数不变）**：

  | 键 | 原值（修订二十九） | 新值 | zh-HK | en | id | th |
  | --- | --- | --- | --- | --- | --- | --- |
  | `orderBreachBody` | 您的订单YZ202512180001已逾期7天，车辆与电池已被远程锁定。请立即联系门店处理并归还设备。 | 您的订单YZ202512180001已逾期7天，车辆与电池已被远程锁定。请立即联系门店处理。 | 您的訂單YZ202512180001已逾期7天，車輛與電池已被遠程鎖定。請立即聯繫門店處理。 | Your order YZ202512180001 is 7 days overdue and the vehicle and battery have been remotely locked. Please contact the store immediately. | Pesanan Anda YZ202512180001 telah terlambat 7 hari dan kendaraan serta baterai telah dikunci jarak jauh. Harap segera hubungi toko. | คำสั่งซื้อ YZ202512180001 ของคุณเกินกำหนด 7 วัน ยานพาหนะและแบตเตอรี่ถูกล็อคระยะไกลแล้ว กรุณาติดต่อร้านค้าทันที |

- **口径**：仅删末句——正文不再以文案催促归还，只提示「联系门店处理」；五语同步删尾句（不再出现 `return the device` / `mengembalikan perangkat` / `คืนอุปกรณ์`）。用词「逾期」**维持不变**（用户复核后确认不替换为「超期」，en `overdue` / id `terlambat` / th `เกินกำหนด` 亦不变）；修订二十九「『逾期』一词自此只在 `orderBreach` 的正文出现」的口径**继续有效**。
- **两端同步**：`notifyTemplates.orderBreach.body`（`index.html` 7331）＝ 五语 `orderBreachBody` ＝ `notify-events-timing.md` §3 第 9 行正文列，三处逐字一致（示例值「7 天」）。
- **待确认（同屏写法差异）**：订单详情页锁定横幅 `breachReminder`「已逾期 7 天，订单已锁定，请立即联系门店处理」与推送正文用词已一致（均为「逾期」），差异仅剩数字前后空格（`7 天` / `7天`）与「订单已锁定」/「已被远程锁定」措辞；是否统一待定。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0（MISSING / ORPHAN / PLACEHOLDER / SUFFIX / TERM 均 0）；`locales/rent` 五语叶键 **1230** 条不变、键集一致。

### 2026-10-16 修订三十一：订单状态「逾期未还」重命名为「已到期」

用户决定将 `overdue` 状态的中文名由「逾期未还」改为「已到期」，与 `orderOverdue` 通知标题（修订二十九已定为「订单已到期」）同词。

- **改值 2 组（改值不改键 × 五语，键数不变）**：

  | 键 | 原值 | 新值 | zh-HK | en | id | th |
  | --- | --- | --- | --- | --- | --- | --- |
  | `common.orderStatus.overdue` | 逾期未还 | **已到期** | 已到期 | Expired | Berakhir | หมดอายุ |
  | `merchant.renewal.breachDays` | 逾期未还{n}天，自动变更为「违约锁单」状态 | **已到期{n}天，自动变更为「违约锁单」状态** | 已到期{n}天，自動變更為「違約鎖單」狀態 | {n} days after expiry, status changes to 「Breach Locked」 | {n} hari setelah pesanan berakhir, status berubah menjadi 「Terkunci」 | {n} วันหลังคำสั่งซื้อหมดอายุ สถานะจะเปลี่ยนเป็น 「ถูกล็อค」 |

- **口径**：状态名与 `orderOverdueTitle`「订单已到期」、`common.orders.overdueReminder`「订单已到期，请及时前往门店归还」同词（五语取词沿用既有译法 `Expired` / `Berakhir` / `หมดอายุ`），与 `return`「即将到期」形成「即将到期 → 已到期」对称。引用状态名的配置项描述 `merchant.renewal.breachDays` 随之改值（`preReturnDays`「到期前{n}天，自动变更为「即将到期」状态」不受影响）。「逾期」一词自此只出现在 `orderBreach` 正文（`已逾期{days}天`）与页面锁定横幅 `breachReminder`「已逾期 7 天，订单已锁定」等业务描述中，不再是状态名。
- **TERM 不受影响**：`common.orderStatus.overdue` 在 swap 侧中文为「已超期」，与 rent 新值「已到期」中文不同，按「zh-CN 值锚定」口径不参与同句比对；校验结果同句中文共有 441 条、译法不一致 0 条，与改前一致。
- **同步范围（代码枚举值不动）**：`index.html` 11 处显示文案（`ORDER_ST_TEXT`、演示订单 `statusText` × 3、订单筛选 `orderFilterTabs` / `orderFilterMap`、`allStatus` / `demoAllStatus`、`quickPills`、`renewStatusOpts`、订单配置页违约天数行）＋ 两份 SOP（`docs/merchant-rental-sop/index.html` 11 处 / `docs/user-rental-sop/index.html` 4 处）＋ `notify-events-timing.md`（§1.1 状态表、§1.2 配置项、§2 时间轴锚点、§3 第 9 行触发时机、§4.2）。`'overdue'` / `S2C` / `ORDER_ST_COLOR` / `orderStatusOrder` 等状态**枚举值与排序不变**；§3 第 8 行触发时机同步改为「订单状态变更为「已到期」」。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0（MISSING / ORPHAN / PLACEHOLDER / SUFFIX / TERM 均 0）；`locales/rent` 五语叶键 **1230** 条不变、键集一致；zh-HK 复核项 STATUS 145 → 146（+1，人工复核项，不影响退出码）。

### 2026-10-16 修订三十二：移除「账户与钱包」大类与充值通知事件（大类两分）

用户决定移除「账户与钱包」大类及其唯一事件 `rechargeSuccess`（充值成功），消息通知大类由三分收敛为两分（**订单状态 11 条 / 费用与退款 3 条**，共 14 条事件）；同时把 `orderRefunded` 触发时机的表述由「退款到账时（部分退款 / 全部退款同一事件）」改为「退款记录状态变更为退款成功」。

- **删键 4 个（五语同删）**：`user.home.pushNotify.rechargeSuccessTitle` / `rechargeSuccessBody`、`user.message.categoryAccountWallet` / `categoryAccountWalletDesc` → `user.home.pushNotify.*` 30 → **28 键**（14 事件 × Title/Body）、`user.message.*` 15 → **13 键**；`locales/rent` 五语叶键 1230 → **1226** 条，五语键集仍完全一致。
- **口径**：大类只剩 `orderStatus`（订单状态）/ `feeRefund`（费用与退款），用户端「消息中心页」「手机系统通知」两处设置页与商户端「消息通知」配置页的大类同步由三项减为两项；`orderRefunded` 触发时机改按**退款记录状态流转**（退款记录状态变更为退款成功）表述，与「部分退款 / 全部退款」不再绑定。
- **`index.html` 同步**：`notifyCatOpts` / `msgCatOpts` 各删 `accountWallet` 项与相关注释（「大类三分」→「大类两分」）；`notifyPrefs.cats` / `msgCfg.cats` 删该键；`msgEventOpts` 删 `rechargeSuccess` 条目；`notifyTemplates` 删 `rechargeSuccess` 模板与「账户与钱包」分组注释；`notifyList` 删充值演示消息（15 → **14 条**，`msg01`–`msg14` 连续重排）；`notifySample()` 删 `bonusNote` 字段；`onNotifyClick` 删已无消息使用的 `target:'wallet'` 钱包分支；商户端消息通知注释改为「大类两分：订单状态 / 费用与退款」。
- **文档改版**：`notify-events-timing.md` 事件清单 15 → **14 条**（删原第 15 行充值事件，原第 14 行触发时机改写如上），并把全文档精简为**仅事件清单**（移除 §1 基线 / §2 时间轴 / §4 特殊规则 / §5 文案口径 / §6 落地现状 / §7 待确认 / §8 未覆盖；键位映射统一由本文件承载）；`.codebuddy/plans/rent-message-push.md`（事件清单交付副本）已删除。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0（MISSING / ORPHAN / PLACEHOLDER / SUFFIX / TERM 均 0）；`locales/rent` 五语叶键 **1226** 条、键集一致。

### 2026-10-16 修订三十三：`renewReminder` 标题与触发时机改口径（改值不改键）

用户决定把续租提醒事件的标题由「订单即将自动续租」改为「订单自动续租」，并把 `notify-events-timing.md` 中该事件的触发时机由「时租订单：租期结束前『自动续租提前量·分钟』；其它订单：租期结束前『自动续租提前量·天』——且订单开启自动续租」改为「自动续租单创建成功时」。

- **改值 1 组（改值不改键 × 五语，键数不变）**：

  | 键 | 原值 | 新值 | zh-HK | en | id | th |
  | --- | --- | --- | --- | --- | --- | --- |
  | `user.home.pushNotify.renewReminderTitle` | 订单即将自动续租 | **订单自动续租** | 訂單自動續租 | Order Auto Renewal | Perpanjangan Otomatis Pesanan | ต่ออายุคำสั่งซื้ออัตโนมัติ |

- **口径**：标题去「即将」，与同批 `renewSuccessTitle`（订单自动续租成功）/ `renewFailedTitle`（订单自动续租失败）构成「自动续租 → 成功 / 失败」三连；译法沿用既有 `auto renewal` / `perpanjangan otomatis` / `ต่ออายุอัตโนมัติ`，一并去掉 `Upcoming` / `Akan` / `จะ` 等将来时标记（en 由 `Order Auto Renewal Upcoming`、id 由 `Pesanan Akan Diperpanjang Otomatis` 改为名词短语，与 ②③ 同构）。该键同时承载用户端消息中心标题与商户端事件名，两端仍逐字一致。
- **触发时机口径（仅文档）**：`notify-events-timing.md` 第 5 行触发时机改为「自动续租单创建成功时」，与第 6 / 7 行「自动续租扣款成功 / 失败时」形成「续租单创建 → 扣款」先后关系；正文 `renewReminderBody` 与演示值 `dueDate` / `amount` 均不变。「自动续租提前量·分钟 / ·天」仍是订单配置页的续租参数口径，不再作为本事件触发时机的表述。
- **同步范围**：`rent/{zh-CN,zh-HK,en,id,th}.json` 同 1 键；`index.html` 的 `notifyTemplates.renewReminder.title`（消息中心条目 + 推送横幅）与商户端 `msgEventOpts` 的 `{k:'renewReminder',l:…}`（事件名）同步改值，两处仍逐字相同。本条同时废止「第五轮定稿（2026-10-15）」表 ① 的标题取值（该表正文与其余两标题仍有效）。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0（MISSING / ORPHAN / PLACEHOLDER / SUFFIX / TERM 均 0）；`locales/rent` 五语叶键 **1226** 条不变、键集一致。

### 2026-10-16 修订三十四：`orderCreated` 正文支付时限改相对口径（改值不改键）

用户决定把 `orderCreated`（订单已创建）正文的支付时限由「绝对时间」改为「相对时间」：原「…已创建，请在2026-09-10 12:00:00前完成支付，超时未支付订单将自动取消。」→「…已创建，**请在30分钟内完成支付**，超时未支付订单将自动取消。」

- **改值 1 组（改值不改键 × 五语，键数不变）**：

  | 键 | 原值 | 新值 | zh-HK | en | id | th |
  | --- | --- | --- | --- | --- | --- | --- |
  | `user.home.pushNotify.orderCreatedBody` | 您的订单YZ202512180001已创建，请在2026-09-10 12:00:00前完成支付，超时未支付订单将自动取消。 | 您的订单YZ202512180001已创建，**请在30分钟内完成支付**，超时未支付订单将自动取消。 | 您的訂單YZ202512180001已建立，**請在30分鐘內完成支付**，逾時未支付訂單將自動取消。 | Your order YZ202512180001 has been created. Please complete payment **within 30 minutes**, otherwise the order will be cancelled automatically. | Pesanan Anda YZ202512180001 telah dibuat. Harap selesaikan pembayaran **dalam 30 menit**, jika tidak pesanan akan dibatalkan otomatis. | คำสั่งซื้อ YZ202512180001 ของคุณถูกสร้างแล้ว กรุณาชำระเงิน**ภายใน 30 นาที** มิฉะนั้นคำสั่งซื้อจะถูกยกเลิกอัตโนมัติ |

- **口径**：支付时限由「截止时刻」（示例值直写 `2026-09-10 12:00:00`）改为「下单后 30 分钟内」，末句提醒「超时未支付订单将自动取消」逐字不变；时限不再依赖绝对时间，故该句除订单号外无动态值。译法沿用既有句式（en `Please complete payment before …` → `within 30 minutes`、id `sebelum …` → `dalam 30 menit`、th `ก่อน …` → `ภายใน 30 นาที`），仅替换时间状语部分。
- **`index.html` 同步**：`notifyTemplates.orderCreated.body` 模板由 `${d.deadline}` 插值改为静态「请在30分钟内完成支付」，插值结果与五语 `orderCreatedBody` 仍逐字相同；`notifySample()` 随之删除已无引用的 `deadline` 字段。商户端 `msgEventOpts` 只承载事件名（＝标题「订单已创建」），不受影响。
- **文档同步**：`notify-events-timing.md` 第 1 行（`orderCreated`）正文列同步改值。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0（MISSING / ORPHAN / PLACEHOLDER / SUFFIX / TERM 均 0）；`locales/rent` 五语叶键 **1226** 条不变、键集一致。

### 2026-10-16 修订三十五：`deviceBound` 正文改值（设备表述改斜杠式 + 删祝福句）

用户决定把 `deviceBound`（订单已开始）正文的设备表述由「车辆与电池」改为「车辆/电池」，并删除句末客套句：原「您的订单YZ202512180001已绑定车辆与电池，租期2026-09-01 10:30:00至2026-10-01 10:30:00，祝您骑行愉快。」→「您的订单YZ202512180001已绑定**车辆/电池**，租期2026-09-01 10:30:00至2026-10-01 10:30:00。」

- **改值 1 组（改值不改键 × 五语，键数不变）**：

  | 键 | 原值 | 新值 | zh-HK | en | id | th |
  | --- | --- | --- | --- | --- | --- | --- |
  | `user.home.pushNotify.deviceBoundBody` | 您的订单YZ202512180001已绑定车辆与电池，租期2026-09-01 10:30:00至2026-10-01 10:30:00，祝您骑行愉快。 | 您的订单YZ202512180001已绑定**车辆/电池**，租期2026-09-01 10:30:00至2026-10-01 10:30:00。 | 您的訂單YZ202512180001已綁定**車輛/電池**，租期2026-09-01 10:30:00至2026-10-01 10:30:00。 | Your order YZ202512180001 has been bound with the **vehicle/battery**. Rental period: 2026-09-01 10:30:00 to 2026-10-01 10:30:00. | Pesanan Anda YZ202512180001 telah terikat dengan **kendaraan/baterai**. Masa sewa 2026-09-01 10:30:00 hingga 2026-10-01 10:30:00. | คำสั่งซื้อ YZ202512180001 ของคุณผูกกับ**ยานพาหนะ/แบตเตอรี่**แล้ว ระยะเวลาเช่า 2026-09-01 10:30:00 ถึง 2026-10-01 10:30:00 |

- **口径**：①设备表述与同批 `orderPaidBody`（「请尽快扫描车辆/电池二维码」）统一为**斜杠式**（en `vehicle/battery` / id `kendaraan/baterai` / th `ยานพาหนะ/แบตเตอรี่`），不再用「与」/「and」/「dan」/「และ」并列式；②删除句末客套句（「祝您骑行愉快」/ `Enjoy your ride.` / `Selamat berkendara.` / `ขอให้เดินทางสนุก`），th 相应不再补句末标点（与 th 既有句末无标点惯例一致）。该句原含两个动态值（`rentStart` / `rentEnd`），改后仍由模板插值，故**非**全静态句。
- **`index.html` 同步**：`notifyTemplates.deviceBound.body` 的 `已绑定${d.device}` 改为静态「已绑定车辆/电池」并删末句（`${d.device}` 样例值为「车辆与电池」，直接插值会与键值不符）；`notifySample().device` **保留**——仍被 `orderBreach`（`${d.device}已被远程锁定`）使用。
- **文档同步**：`notify-events-timing.md` 第 3 行（`deviceBound`）正文列同步改值。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0（MISSING / ORPHAN / PLACEHOLDER / SUFFIX / TERM 均 0）；`locales/rent` 五语叶键 **1226** 条不变、键集一致。

### 2026-10-16 修订三十六：`renewFailed` 正文去「原因：」前缀（改值不改键）

用户决定把 `renewFailed`（订单自动续租失败）正文的失败原因由「原因：」引导改为直接陈述：原「您的订单自动续租失败（第2/3次），**原因：**余额不足。请尽快充值，以免续租失败次数过多导致自动续租功能关闭。」→「您的订单自动续租失败（第2/3次），余额不足。请尽快充值，以免续租失败次数过多导致自动续租功能关闭。」

- **改值 1 组（改值不改键 × 五语，键数不变）**：

  | 键 | 原值 | 新值 | zh-HK | en | id | th |
  | --- | --- | --- | --- | --- | --- | --- |
  | `user.home.pushNotify.renewFailedBody` | 您的订单自动续租失败（第2/3次），**原因：**余额不足。请尽快充值，以免续租失败次数过多导致自动续租功能关闭。 | 您的订单自动续租失败（第2/3次），余额不足。请尽快充值，以免续租失败次数过多导致自动续租功能关闭。 | 您的訂單自動續租失敗（第2/3次），餘額不足。請盡快增值，以免續租失敗次數過多導致自動續租功能關閉。 | Your order auto renewal failed (attempt 2/3). Insufficient balance. Please top up as soon as possible, otherwise too many failed renewals will turn off auto renewal. | Perpanjangan otomatis pesanan Anda gagal (percobaan 2/3), saldo tidak cukup. Mohon segera isi ulang, agar kegagalan perpanjangan yang berulang tidak menonaktifkan perpanjangan otomatis. | การต่ออายุอัตโนมัติของคำสั่งซื้อคุณไม่สำเร็จ (ครั้งที่ 2/3) ยอดคงเหลือไม่เพียงพอ กรุณาเติมเงินโดยเร็วที่สุด เพื่อไม่ให้การต่ออายุอัตโนมัติถูกปิดเนื่องจากล้มเหลวหลายครั้ง |

- **口径**：失败原因不再以引导词引出，直接与句首「（第N/M次）」并列成句；各语同步删引导词（en `Reason: ` / id `alasan: ` / th `สาเหตุ: ` / zh-HK `原因：`），原因句首字母按各语大小写惯例处理（en 由 `insufficient balance` 提为句首 `Insufficient balance.`）。原因句与其后的充值提醒（`Please top up…` / 「请尽快充值…」）语义关系不变，仅去前缀。
- **`index.html` 同步**：`notifyTemplates.renewFailed.body` 的「，原因：余额不足。」改为「，余额不足。」，其余插值（`${d.failCount}/${d.threshold}`）与句尾不变，插值结果与五语 `renewFailedBody` 仍逐字相同；`notifySample()` 的 `failCount` / `threshold` 继续使用，无字段增删。
- **文档同步**：`notify-events-timing.md` 第 7 行（`renewFailed`）正文列同步改值。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0（MISSING / ORPHAN / PLACEHOLDER / SUFFIX / TERM 均 0）；`locales/rent` 五语叶键 **1226** 条不变、键集一致。

### 2026-10-16 修订三十七：`orderOverdue` 正文「租期已结束」→「已到期」（改值不改键）

用户决定把 `orderOverdue`（订单已到期）正文的到期表述与标题及触发时机对齐：原「您的订单YZ202512180001**租期已结束**，请及时前往门店归还，以免产生额外费用；如仍需使用，可前往订单详情办理续租。」→「您的订单YZ202512180001**已到期**，请及时前往门店归还，以免产生额外费用；如仍需使用，可前往订单详情办理续租。」

- **改值 1 组（改值不改键 × 五语，键数不变）**：

  | 键 | 原值 | 新值 | zh-HK | en | id | th |
  | --- | --- | --- | --- | --- | --- | --- |
  | `user.home.pushNotify.orderOverdueBody` | 您的订单YZ202512180001**租期已结束**，请及时前往门店归还… | 您的订单YZ202512180001**已到期**，请及时前往门店归还… | 您的訂單YZ202512180001**已到期**，請及時前往門店歸還… | Your order YZ202512180001 **has expired.** Please return it at the store… | Pesanan Anda YZ202512180001 **telah berakhir.** Harap segera kembalikan di toko… | คำสั่งซื้อ YZ202512180001 ของคุณ**หมดอายุแล้ว** กรุณาคืนที่ร้านค้า… |

- **口径**：到期陈述由「租期已结束」改为「已到期」，与标题键 `orderOverdueTitle`（订单已到期 / Order Has Expired / คำสั่งซื้อหมดอายุแล้ว）及触发时机「订单状态变更为「已到期」」三点同口径；归还需知与续租入口的后半句一字未动。各语按「到期」而非「租期结束」重译（en `has expired`、id `telah berakhir`、th `หมดอายุแล้ว`），id 原「Masa sewa pesanan…」的时间状语提为主语残缺句，改为「Pesanan Anda … telah berakhir.」。
- **`index.html` 同步**：`notifyTemplates.orderOverdue.body` 的「${d.orderNo}租期已结束，」改为「${d.orderNo}已到期，」，`orderNo` 插值与后半句不变，插值结果与五语 `orderOverdueBody` 仍逐字相同。
- **文档同步**：`notify-events-timing.md` 第 8 行（`orderOverdue`）正文列同步改值。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0（MISSING / ORPHAN / PLACEHOLDER / SUFFIX / TERM 均 0）；`locales/rent` 五语叶键 **1226** 条不变、键集一致。

### 2026-10-16 修订三十八：`orderCompleted` 正文去结算时间（改值不改键）

用户决定把 `orderCompleted`（订单已完成）正文的完成时间戳去掉，与其余正文「不含时间戳」的口径对齐：原「您的订单YZ202512180001**已于2026-09-05 15:20:00完成结算**，感谢您的使用，期待再次为您服务。」→「您的订单YZ202512180001**已完成**，感谢您的使用，期待再次为您服务。」

- **改值 1 组（改值不改键 × 五语，键数不变）**：

  | 键 | 原值 | 新值 | zh-HK | en | id | th |
  | --- | --- | --- | --- | --- | --- | --- |
  | `user.home.pushNotify.orderCompletedBody` | 您的订单YZ202512180001**已于2026-09-05 15:20:00完成结算**，感谢您的使用… | 您的订单YZ202512180001**已完成**，感谢您的使用… | 您的訂單YZ202512180001**已完成**，感謝您的使用… | Your order YZ202512180001 **has been completed.** Thank you for your business… | Pesanan Anda YZ202512180001 **telah selesai.** Terima kasih atas kepercayaan Anda… | คำสั่งซื้อ YZ202512180001 ของคุณ**เสร็จสิ้นแล้ว** ขอบคุณที่ใช้บริการ… |

- **口径**：完成陈述由「已于{完成时间}完成结算」改为「已完成」，与标题键 `orderCompletedTitle`（订单已完成 / Order Completed / คำสั่งซื้อเสร็จสิ้น）同口径，且不再携带时间戳（同类正文中 `orderCreated` 的「30分钟内」为规则时限而非时间戳，`renewFailed` 的次数亦非时间戳，故不动）；答谢句「感谢您的使用…」一字未动。各语同步删时间状语（en `was settled on …` → `has been completed`、id `telah diselesaikan pada …` → `telah selesai`、th `ชำระบัญชีเสร็จสิ้นเมื่อ …` → `เสร็จสิ้นแล้ว`）。
- **`index.html` 同步**：`notifyTemplates.orderCompleted.body` 的「${d.orderNo}已于${d.finishTime}完成结算，」改为「${d.orderNo}已完成，」；`notifySample()` 中已无引用的 `finishTime:'2026-09-05 15:20:00'` 一并删除（同类瘦身见修订三十五去 `orderId`/`N`），插值结果与五语 `orderCompletedBody` 仍逐字相同。
- **文档同步**：`notify-events-timing.md` 第 10 行（`orderCompleted`）正文列同步改值。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0（MISSING / ORPHAN / PLACEHOLDER / SUFFIX / TERM 均 0）；`locales/rent` 五语叶键 **1226** 条不变、键集一致。

### 2026-10-16 修订三十九：`orderRefunding` 正文「退款申请已受理」→「退款中」、时限 1–3 → 1–7 个工作日（改值不改键）

用户决定把 `orderRefunding`（退款处理中）正文的受理口径改为进行中口径，并放宽预计时限：原「您的订单YZ202512180001**退款申请已受理**，退款金额Rp150.000，预计**1–3**个工作日原路退回。」→「您的订单YZ202512180001**退款中**，退款金额Rp150.000，预计**1–7**个工作日原路退回。」

- **改值 1 组（改值不改键 × 五语，键数不变）**：

  | 键 | 原值 | 新值 | zh-HK | en | id | th |
  | --- | --- | --- | --- | --- | --- | --- |
  | `user.home.pushNotify.orderRefundingBody` | 您的订单YZ202512180001**退款申请已受理**，退款金额Rp150.000，预计**1–3**个工作日原路退回。 | 您的订单YZ202512180001**退款中**，退款金额Rp150.000，预计**1–7**个工作日原路退回。 | 您的訂單YZ202512180001**退款中**，退款金額Rp150.000，預計**1–7**個工作日原路退回。 | Your order YZ202512180001 **is being refunded.** Refund amount: Rp150.000, expected to be returned to the original payment method within **1–7** business days. | Pesanan Anda YZ202512180001 **sedang dalam proses pengembalian dana.** Jumlah pengembalian Rp150.000, diperkirakan kembali ke metode pembayaran asal dalam **1–7** hari kerja. | คำสั่งซื้อ YZ202512180001 **อยู่ระหว่างการคืนเงิน** จำนวนเงินคืน Rp150.000 คาดว่าจะคืนกลับช่องทางเดิมภายใน **1–7** วันทำการ |

- **口径**：正文状态语由「退款申请已受理」（受理完成态）改为「退款中」（进行态），与标题键 `orderRefundingTitle`（退款处理中）同指一段进行中的退款流程，正文更简短直述；预计到账时限由「1–3 个工作日」改为「1–7 个工作日」（放宽 4 天），连接号沿用半角长破折号 `–`（U+2013，与其余金额/日期区间写法一致）。各语同步改：en `Your refund request … has been accepted` → `Your order … is being refunded`、id `Permintaan pengembalian dana … telah diterima` → `Pesanan Anda … sedang dalam proses pengembalian dana`、th `คำขอคืนเงิน … ได้รับการรับเรื่องแล้ว` → `คำสั่งซื้อ … อยู่ระหว่างการคืนเงิน`；时限五语同改 1–7。
- **`index.html` 同步**：`notifyTemplates.orderRefunding.body` 的「${d.orderNo}退款申请已受理，退款金额${d.amount}，预计1–3个工作日原路退回。」改为「${d.orderNo}退款中，退款金额${d.amount}，预计1–7个工作日原路退回。」，`orderNo` / `amount` 插值与其余句式不变，插值结果与五语 `orderRefundingBody` 仍逐字相同。
- **文档同步**：`notify-events-timing.md` 第 13 行（`orderRefunding`）正文列同步改值。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0（MISSING / ORPHAN / PLACEHOLDER / SUFFIX / TERM 均 0）；`locales/rent` 五语叶键 **1226** 条不变、键集一致。

### 2026-10-16 修订四十：两条退款事件触发时机精简（仅文档口径）

用户决定把费用与退款类的两条触发时机去掉「记录」主语、改直述事件：

- 第 13 行 `orderRefunding`：「**退款记录创建时**」→「**退款创建时**」（去掉「记录」二字，「创建时」结构保留）。
- 第 14 行 `orderRefunded`：「**退款记录状态变更为退款成功**」→「**退款成功**」（不再按记录状态流转表述，直接以事件结果命名，与事件名 `orderRefunded`、标题「退款成功」三点同口径；原表述为修订三十三去「账户与钱包」大类时所定）。

- **口径**：触发时机列至此全表均为「订单状态变更为「X」」或「XX时」两类句式；费用与退款三行分别为「商户改价成功时」「退款创建时」「退款成功」。
- **未改项**：第 12 行 `orderAdjusted` 触发时机「商户改价成功时」用户本轮未提，保持原样。
- **无代码/键值影响**：触发时机属 `notify-events-timing.md` 说明列，`index.html` 的 `notifyTemplates` 与 `locales/rent` 五语均无该文案副本，故不改动。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0（MISSING / ORPHAN / PLACEHOLDER / SUFFIX / TERM 均 0）；`locales/rent` 五语叶键 **1226** 条不变、键集一致。

### 2026-10-16 修订四十一：退款两条事件点击跳转改为「订单详情-退款记录」（含源码分流）

用户决定把费用与退款类中两条退款事件的点击跳转从「订单详情-费用明细」改为「订单详情-退款记录」：第 13 行 `orderRefunding`、第 14 行 `orderRefunded`。

- **文档**：`notify-events-timing.md` 第 26 / 27 行「点击跳转」列 → **订单详情-退款记录**；第 12 行 `orderAdjusted` 维持「订单详情-费用明细」（调整类与退款记录无关，用户本轮未提）。
- **口径**：跳转列现为三档——订单状态类 11 行「订单详情」、`orderAdjusted` 「订单详情-费用明细」、两条退款事件「订单详情-退款记录」，与「退款记录」页的承载对象（退款单）对齐，不再统一落到费用明细页。
- **`index.html` 同步（`onNotifyClick` 按事件分流）**：用户端消息点击由原来的「一律 `showFeeDetail.value=true`」改为——退款类（`eventId==='orderRefunding'||'orderRefunded'`）调用既有入口 `openRefundList()`（内部 `navOpen('refundList')`，打开 z=1895 的 `refund-list-page`，返回键走 `navBack()` 恢复进入前快照），其余事件仍 `showFeeDetail.value=true`；两种情况均先 `orderInfo.value=orderInfoOf(hit.order,hit.cat)` 装载目标订单（`refundRecords` computed 依赖 `orderInfo`，故退款记录列表随消息对应订单渲染）。注释同步改为「直达对应页」。
- **无键值影响**：跳转属交互行为，`locales/rent` 五语键值与键数不变（仍 1226 条）。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0（MISSING / ORPHAN / PLACEHOLDER / SUFFIX / TERM 均 0）；`locales/rent` 五语叶键 **1226** 条不变、键集一致。

### 2026-10-16 修订四十二：消息中心列表显式按通知时间倒序排序

用户明确「消息中心排序是时间倒序」。此前 `notifyMsgs` 仅对 `notifyList` 做 `map`，顺序靠种子书写顺序（恰好已倒序）但无排序逻辑保障；本轮在计算属性内**显式排序**。

- **`index.html` 同步（`notifyMsgs`）**：`notifyList.value` 先 `slice()` 浅拷贝（不改动种子原数组顺序，`read` 标记与 `find` 仍按原数组工作）再 `sort`：主键 `daysAgo` 升序（天数越小＝越新，靠前），次键 `hhmm` 降序（同一天时分越大靠前）；`sort` 稳定，同刻两条（如 `renewSuccess` / `renewReminder` 均为 1 天前 12:00）保持种子中先者在前。时间列显示逻辑（当天只显示 `hhmm`、跨天显示 `YYYY-MM-DD`）未动。
- **口径**：列表顺序＝通知时间倒序（最新在上），与「无今天/昨天分组、一列平铺卡片」并列成为消息中心的展示规则；本次仅固化已有视觉顺序，界面文案与五语键值零变化。
- **文档同步**：`notify-events-timing.md` 文首「> 展示顺序」句补记该口径，并说明清单表格顺序（分类序 1–14）与消息中心展示顺序无关。
- **无键值影响**：`locales/rent` 五语叶键 **1226** 条不变、键集一致。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0（MISSING / ORPHAN / PLACEHOLDER / SUFFIX / TERM 均 0）；`locales/rent` 五语叶键 **1226** 条不变、键集一致。

### 2026-10-16 修订四十三：商户端「消息通知」页两个大类改各自独立卡片

用户指出商户端该页两个大类（订单状态 / 费用与退款）与各自小类挤在同一张卡内，要求与用户端「消息中心页 / 手机系统通知」同形——每个大类各占一张独立卡片。

- **`index.html` 同步（`profileOV==='msg'` 页）**：`v-for="cat in msgCatOpts"` 由「一层 `.od-card` 包住两个大类的 `div`」改为**卡本身即循环项**（`<div class="od-card od-cat-card" v-for="cat in msgCatOpts" :key="cat.k">`），卡头（`.od-sec` + 大类开关）与小类块仍在卡内；`</div>` 相应少一层。
- **小类块 `v-show` → `v-if`**：大类关闭时卡内只剩卡头，改用 `v-if` 让卡头成为卡内唯一内容，从而命中既有 `#root-merchant .od-card>.od-sec:last-child`（去掉无对象的分隔线与多余下距、底部留白 15px）——此前 `v-show` 下 `:last-child` 判断不受 `display` 影响，会留下一条空分隔线。
- **新增样式 1 条**：`#root-merchant .od-card.od-cat-card{margin-top:8px}`——两个大类卡之间、以及「消息类型」分组标题到首卡的间距均 8px（与用户端 `mb-2` 同口径）；页面其余 `.od-card` 默认 16px 间距不变。
- **页面注释同步**：页面头注释与 `msgCatOpts` 上方注释补记「大类各占一张独立卡」「关闭时小类块用 `v-if`」口径，删去原「（v-show）」表述。
- **无键值影响**：纯结构/样式改动，界面文案与 `locales/rent` 五语键值、键数不变。
- 校验：`node scripts/i18n_check.mjs` 硬错误全 0（MISSING / ORPHAN / PLACEHOLDER / SUFFIX / TERM 均 0）。
