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
