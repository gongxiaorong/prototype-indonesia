# 新增词条 · 译文复核清单

> 范围：2026-10-22 i18n 试点 key 化期间新增的 7 个词条（五语齐全，`i18n_check.mjs` 无 MISSING）。
> 状态：均为**人工新增译文**（非机翻）；2026-10-22 已由用户确认通过，全部标记「已复核」，无需改动 JSON。
> 后续新增词条按同一流程登记，复核通过后在本文件对应行标记「已复核」。

| # | key | zh-CN | en | id | th | zh-HK | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `common.login.envTitle` | 选择环境 | Select Environment | Pilih Lingkungan | เลือกสภาพแวดล้อม | 選擇環境 | 已复核 |
| 2 | `common.login.register` | 注册账号 | Register Account | Daftar Akun | ลงทะเบียนบัญชี | 註冊帳號 | 已复核 |
| 3 | `common.toast.codeSent` | 验证码已发送 | Verification code sent | Kode verifikasi terkirim | ส่งรหัสยืนยันแล้ว | 驗證碼已發送 | 已复核 |
| 4 | `common.version.later` | 稍后提醒 | Remind Me Later | Ingatkan Nanti | เตือนภายหลัง | 稍後提醒 | 已复核 |
| 5 | `user.login.registerDemo` | 注册账号（原型演示） | Register Account (Prototype Demo) | Daftar Akun (Demo Prototipe) | ลงทะเบียนบัญชี (เดโมต้นแบบ) | 註冊帳號（原型演示） | 已复核 |
| 6 | `merchant.login.registerDemo` | 注册账号（原型演示） | Register Account (Prototype Demo) | Daftar Akun (Demo Prototipe) | ลงทะเบียนบัญชี (เดโมต้นแบบ) | 註冊帳號（原型演示） | 已复核 |
| 7 | `merchant.home.deviceManagement` | 设备管理 | Device Management | Manajemen Perangkat | จัดการอุปกรณ์ | 設備管理 | 已复核 |

说明：

- 1–4 位于 `common.*`，两端（`rent-user` / `rent-merchant`）逐字镜像（`SHARED` 校验通过）。
- 5 仅 `rent-user`，6–7 仅 `rent-merchant`，不参与共享段镜像。
- 新增后已重跑 `node scripts/i18n_bundle.mjs`，两端语言包同步更新。

## 第 7 批（JS 层文案，2026-10-22）

> 用户端 JS 层 toast / 状态文案 key 化新增 9 个词条；除 `common.toast.accountSaved` 外均只在 `rent-user`。
> 按既定口径为**人工初稿（机器辅助）**，状态「待复核」；复核通过后改为「已复核」。

| # | key | zh-CN | en | id | th | zh-HK | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `common.toast.accountSaved` | 账号已保存 | Account saved | Akun disimpan | บันทึกบัญชีแล้ว | 帳號已儲存 | 待复核 |
| 2 | `user.toast.renewFailedUnpaid` | 存在未支付订单，续租失败 | Renewal failed: unpaid order exists | Perpanjangan gagal: ada pesanan yang belum dibayar | ต่ออายุไม่สำเร็จ: มีคำสั่งซื้อที่ยังไม่ชำระ | 存在未支付訂單，續租失敗 | 待复核 |
| 3 | `user.vehicles.noBindableBattery` | 暂无可绑定电池 | No battery available to bind | Tidak ada baterai untuk diikat | ไม่มีแบตเตอรี่ให้ผูก | 暫無可綁定電池 | 待复核 |
| 4 | `user.vehicles.noBindableVehicle` | 暂无可绑定车辆 | No vehicle available to bind | Tidak ada kendaraan untuk diikat | ไม่มียานพาหนะให้ผูก | 暫無可綁定車輛 | 待复核 |
| 5 | `user.vehicles.lockClosed` | 已关锁 | Locked | Terkunci | ล็อคแล้ว | 已關鎖 | 待复核 |
| 6 | `user.vehicles.lockOpened` | 已开锁 | Unlocked | Kunci Terbuka | ปลดล็อคแล้ว | 已開鎖 | 待复核 |
| 7 | `user.wallet.storeSelected` | 已选择门店 | Store selected | Toko dipilih | เลือกร้านค้าแล้ว | 已選擇門店 | 待复核 |
| 8 | `user.orders.orderPlaced` | 下单成功 | Order placed | Pesanan dibuat | สั่งซื้อสำเร็จ | 下單成功 | 待复核 |
| 9 | `user.wallet.selectStoreFirst` | 请先选择门店 | Please select a store first | Pilih toko terlebih dahulu | กรุณาเลือกร้านค้าก่อน | 請先選擇門店 | 待复核 |

说明：

- 第 5–7 条与商户端既有 `merchant.vehicles.lockToast*` / `merchant.wallet.selectedToast` 同句，译文已按商户端对齐（`TERM` 0 差异）。
- 第 9 条与 `merchant.wallet.selectFirst` 同句，译文已对齐。

## 第 8 批（商户端 JS / 模板收尾，2026-10-23）

> 本轮为商户端 JS 层（状态映射、菜单、筛选 chip、toast、订单配置片段）与模板尾项新增的词条；除 `common.*` 外均只在 `rent-merchant`。
> 状态「待复核」（人工初稿，机器辅助）；`zh-HK` 见 JSON，本表略。

| # | key | zh-CN | en | id | th | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `common.action.confirmLabel` | 确认 | Confirm | Konfirmasi | ยืนยัน | 待复核 |
| 2 | `common.action.clear` | 清空 | Clear | Kosongkan | ล้าง | 待复核 |
| 3 | `common.action.useCurrentLocation` | 使用当前定位 | Use Current Location | Gunakan Lokasi Saat Ini | ใช้ตำแหน่งปัจจุบัน | 待复核 |
| 4 | `common.dateTime.startDate` | 开始日期 | Start Date | Tanggal Mulai | วันที่เริ่ม | 待复核 |
| 5 | `common.dateTime.endDate` | 结束日期 | End Date | Tanggal Selesai | วันที่สิ้นสุด | 待复核 |
| 6 | `common.orders.orderNoPlaceholder` | 请输入订单编号 | Enter order number | Masukkan nomor pesanan | กรุณากรอกหมายเลขคำสั่งซื้อ | 待复核 |
| 7 | `merchant.wallet.ledgerOrderConsume` | 订单消费 | Order Expense | Pengeluaran Pesanan | ค่าใช้จ่ายคำสั่งซื้อ | 待复核 |
| 8 | `merchant.wallet.ledgerRechargeRefund` | 充值退款 | Top-up Refund | Pengembalian Isi Ulang | คืนเงินการเติม | 待复核 |
| 9 | `merchant.wallet.ledgerGift` | 赠送 | Bonus | Bonus | โบนัส | 待复核 |
| 10 | `merchant.wallet.confirmDeleteRechargeDesc` | 确定删除该充值配置？删除后不可恢复。 | Delete this top-up config? This cannot be undone. | Hapus konfigurasi isi ulang ini? Tindakan ini tidak dapat dibatalkan. | ลบการตั้งค่าเติมเงินนี้หรือไม่? ไม่สามารถกู้คืนได้ | 待复核 |
| 11 | `merchant.chargingDevice.addSuccess` | 设备已新增 | Device added | Perangkat ditambahkan | เพิ่มอุปกรณ์แล้ว | 待复核 |
| 12 | `merchant.chargingDevice.infoSaved` | 设备信息已保存 | Device info saved | Info perangkat disimpan | บันทึกข้อมูลอุปกรณ์แล้ว | 待复核 |
| 13 | `merchant.chargingDevice.priceSaved` | 定价已保存 | Pricing saved | Harga disimpan | บันทึกการตั้งราคาแล้ว | 待复核 |
| 14 | `merchant.chargingDevice.shopChanged` | 所属门店已更换 | Store changed | Toko diubah | เปลี่ยนสโตร์แล้ว | 待复核 |
| 15 | `merchant.chargingDevice.disabledToast` | 设备已禁用 | Device disabled | Perangkat dinonaktifkan | ปิดใช้งานอุปกรณ์แล้ว | 待复核 |
| 16 | `merchant.chargingDevice.enabledToast` | 设备已启用 | Device enabled | Perangkat diaktifkan | เปิดใช้งานอุปกรณ์แล้ว | 待复核 |
| 17 | `merchant.chargingDevice.addTitle` | 新增设备 | Add device | Tambah perangkat | เพิ่มอุปกรณ์ | 待复核 |
| 18 | `merchant.chargingDevice.editTitle` | 编辑设备 | Edit device | Edit perangkat | แก้ไขอุปกรณ์ | 待复核 |
| 19 | `merchant.orders.refundDoneFull` | 退款已办结：全部退款 | Refund completed: full refund | Refund selesai: pengembalian penuh | คืนเงินเสร็จสิ้น: คืนเต็มจำนวน | 待复核 |
| 20 | `merchant.orders.refundDonePartial` | 退款已办结：部分退款 | Refund completed: partial refund | Refund selesai: pengembalian sebagian | คืนเงินเสร็จสิ้น: คืนบางส่วน | 待复核 |
| 21 | `merchant.chargingOrder.detailTitle` | 充电订单详情 | Charging order details | Detail pesanan pengisian | รายละเอียดคำสั่งชาร์จ | 待复核 |
| 22 | `merchant.chargingOrder.refundListTitle` | 充电订单退款记录 | Charging order refund records | Riwayat pengembalian pesanan pengisian | บันทึกการคืนเงินคำสั่งชาร์จ | 待复核 |
| 23 | `merchant.orders.listVehicleTitle` | 车辆订单列表 | Vehicle order list | Daftar pesanan kendaraan | รายการคำสั่งซื้อรถ | 待复核 |
| 24 | `merchant.orders.listBatteryTitle` | 电池订单列表 | Battery order list | Daftar pesanan baterai | รายการคำสั่งซื้อแบตเตอรี่ | 待复核 |
| 25 | `merchant.orders.listPackageTitle` | 套餐订单列表 | Package order list | Daftar pesanan paket | รายการคำสั่งซื้อแพ็กเกจ | 待复核 |
| 26 | `merchant.orders.listRechargeTitle` | 充值订单列表 | Top-up order list | Daftar pesanan isi ulang | รายการคำสั่งซื้อเติมเงิน | 待复核 |
| 27 | `merchant.orders.listChargeTitle` | 充电订单列表 | Charging order list | Daftar pesanan pengisian | รายการคำสั่งซื้อการชาร์จ | 待复核 |
| 28 | `merchant.profile.editPushConfig` | 编辑推送配置 | Edit push settings | Edit pengaturan push | แก้ไขการตั้งค่าการแจ้งเตือน | 待复核 |
| 29 | `merchant.profile.unbindVehicleTitle` | 解绑车辆 | Unbind Vehicle | Lepas Kendaraan | ยกเลิกการผูกยานพาหนะ | 待复核 |
| 30 | `merchant.profile.unbindBatteryTitle` | 解绑电池 | Unbind Battery | Lepas Baterai | ยกเลิกการผูกแบตเตอรี่ | 待复核 |
| 31 | `merchant.orders.batteryNo` | 电池编号 | Battery No. | Nomor Baterai | หมายเลขแบตเตอรี่ | 待复核 |
| 32 | `merchant.wallet.title` | 钱包 | Wallet | Dompet | กระเป๋าเงิน | 待复核 |
| 33 | `merchant.orders.refundChannel` | 退款渠道 | Refund channel | Saluran pengembalian dana | ช่องทางการคืนเงิน | 待复核 |
| 34 | `merchant.orders.endReason` | 结束原因 | End reason | Alasan berakhir | เหตุผลการสิ้นสุด | 待复核 |
| 35 | `merchant.chargingDevice.disableAction` | 禁用设备 | Disable device | Nonaktifkan perangkat | ปิดใช้งานอุปกรณ์ | 待复核 |
| 36 | `merchant.chargingDevice.enableAction` | 启用设备 | Enable device | Aktifkan perangkat | เปิดใช้งานอุปกรณ์ | 待复核 |
| 37 | `merchant.chargingDevice.addrMapSelect` | 地图选择地址 | Select on Map | Pilih di Peta | เลือกบนแผนที่ | 待复核 |
| 38 | `merchant.orders.endOrderTitle` | 结束该订单 | End this order | Akhiri pesanan ini | สิ้นสุดคำสั่งซื้อนี้ | 待复核 |
| 39 | `merchant.chargingDevice.inputDeviceNo` | 请输入设备编号 | Please enter device number | Masukkan nomor pengisi daya | กรุณากรอกหมายเลขอุปกรณ์ | 待复核 |
| 40 | `merchant.orders.endOrderConfirm` | 确定结束该订单？ | End this order? | Akhiri pesanan ini? | สิ้นสุดคำสั่งซื้อนี้? | 待复核 |
| 41 | `merchant.orders.endReasonPlaceholder` | 请输入结束原因（不超过 255 字） | Enter end reason (max 255 characters) | Masukkan alasan berakhir (maks. 255 karakter) | กรุณากรอกเหตุผลการสิ้นสุด (ไม่เกิน 255 ตัวอักษร) | 待复核 |
| 42 | `merchant.message.settingsCategoryHead` | 消息类型 | Message Types | Jenis Pesan | ประเภทข้อความ | 待复核 |
| 43 | `merchant.config.hourlyPlan` | 时租方案 | Hourly plan | Paket per jam | แพ็กเกจรายชั่วโมง | 待复核 |
| 44 | `merchant.config.otherPlan` | 其它方案 | Other plans | Paket lainnya | แพ็กเกจอื่น ๆ | 待复核 |
| 45 | `merchant.config.hourlyPlanBefore` | 时租方案到期前 | Before hourly plan expires | Sebelum paket per jam berakhir | ก่อนแพ็กเกจรายชั่วโมงหมดอายุ | 待复核 |
| 46 | `merchant.config.otherPlanBefore` | 其它方案到期前 | Before other plans expire | Sebelum paket lain berakhir | ก่อนแพ็กเกจอื่นหมดอายุ | 待复核 |
| 47 | `merchant.config.autoRenewMinutes` | 分钟自动续租 | Auto-renew in minutes | Perpanjangan otomatis dalam menit | ต่ออายุอัตโนมัติเป็นนาที | 待复核 |
| 48 | `merchant.config.autoRenewDays` | 天自动续租 | Auto-renew in days | Perpanjangan otomatis dalam hari | ต่ออายุอัตโนมัติเป็นวัน | 待复核 |
| 49 | `merchant.config.toExpiringMinutes` | 分钟，自动变更为「即将到期」状态 | minutes, then status changes to "Expiring Soon" | menit, lalu status berubah menjadi "Segera Berakhir" | นาที แล้วสถานะจะเปลี่ยนเป็น "ใกล้หมดอายุ" | 待复核 |
| 50 | `merchant.config.toExpiringDays` | 天，自动变更为「即将到期」状态 | days, then status changes to "Expiring Soon" | hari, lalu status berubah menjadi "Segera Berakhir" | วัน แล้วสถานะจะเปลี่ยนเป็น "ใกล้หมดอายุ" | 待复核 |
| 51 | `merchant.config.toBreachMinutes` | 分钟，自动变更为「违约锁单」状态 | minutes, then status changes to "Default Locked" | menit, lalu status berubah menjadi "Terkunci Wanprestasi" | นาที แล้วสถานะจะเปลี่ยนเป็น "ถูกล็อกจากการผิดสัญญา" | 待复核 |
| 52 | `merchant.config.toBreachDays` | 天，自动变更为「违约锁单」状态 | days, then status changes to "Default Locked" | hari, lalu status berubah menjadi "Terkunci Wanprestasi" | วัน แล้วสถานะจะเปลี่ยนเป็น "ถูกล็อกจากการผิดสัญญา" | 待复核 |
| 53 | `merchant.orders.cancelReasonPlaceholder` | 请输入取消原因 | Enter cancellation reason | Masukkan alasan pembatalan | กรุณากรอกเหตุผลการยกเลิก | 待复核 |
| 54 | `merchant.orders.endOrderHint` | 结束后订单进入「已完成」；已支付订单会补记支付时间，未支付订单不产生支付时间 | The order becomes "Completed" after ending; paid orders record the payment time, unpaid orders do not. | Setelah diakhiri, pesanan menjadi "Selesai"; pesanan yang sudah dibayar mencatat waktu pembayaran, pesanan belum dibayar tidak. | เมื่อสิ้นสุดแล้วคำสั่งซื้อจะเปลี่ยนเป็น "เสร็จสิ้น"; คำสั่งซื้อที่ชำระแล้วจะบันทึกเวลาชำระ ส่วนที่ยังไม่ชำระจะไม่บันทึก | 待复核 |
| 55 | `merchant.orders.refundConfirmTotal` | 确认执行退款？合计退款 {amount} | Confirm refund? Total refund {amount} | Konfirmasi pengembalian dana? Total pengembalian {amount} | ยืนยันการคืนเงิน? ยอดคืนรวม {amount} | 待复核 |
| 56 | `merchant.orders.refundConfirmAmount` | 确认执行退款？退款金额 {amount} | Confirm refund? Refund amount {amount} | Konfirmasi pengembalian dana? Jumlah pengembalian {amount} | ยืนยันการคืนเงิน? จำนวนเงินคืน {amount} | 待复核 |
| 57 | `merchant.map.noResult` | 没有找到相关地点 | No matching places found | Tempat terkait tidak ditemukan | ไม่พบสถานที่ที่เกี่ยวข้อง | 待复核 |
| 58 | `merchant.unit.copies` | 份 | document(s) | dokumen | เอกสาร | 待复核 |
| 59 | `merchant.orders.unitHour` | 小时 | Hours | Jam | ชั่วโมง | 待复核 |
| 60 | `merchant.orders.unitDay` | 天 | Days | Hari | วัน | 待复核 |
| 61 | `merchant.orders.unitWeek` | 周 | Weeks | Minggu | สัปดาห์ | 待复核 |
| 62 | `merchant.orders.unitMonth` | 个月 | Months | Bulan | เดือน | 待复核 |

## 第 9 批（页面标题 / pill / 通知配置收尾，2026-10-23）

> 本轮修复两端页面标题与筛选 pill、通知配置事件名、证件类型、区号国家名、轨迹 POI 等；`common.dialcode.hongkong` 两端新增（`merchant.dialcode.hongkong` 重复键已删除）。
> 状态「待复核」；完整五语见 JSON。

| # | key | zh-CN | en | 状态 |
| --- | --- | --- | --- | --- |
| 1 | `user.idInfo.license` | 驾驶证 | Driver's License | 待复核 |
| 2 | `user.charge.noDevices` | 暂无充电桩和门店 | No charging stations or stores nearby | 待复核 |
| 3 | `user.orders.refundReason` | 退款原因 | Refund Reason | 待复核 |
| 4 | `user.idInfo.supplement` | 补充资料 | Additional Documents | 待复核 |
| 5 | `user.orders.batteryNo` | 电池编号 | Battery No. | 待复核 |
| 6 | `user.orders.cancelRenew` | 取消续租 | Cancel Renewal | 待复核 |
| 7 | `user.orders.cancelRenewConfirm` | 确定取消该续租？取消后不可恢复 | Cancel this renewal? This cannot be undone | 待复核 |
| 8 | `user.orders.pay` | 支付 | Pay | 待复核 |
| 9 | `user.idInfo.deleteConfirm` | 确定要删除该实名信息吗？删除后不可恢复 | Delete this identity info? This cannot be undone. | 待复核 |
| 10 | `user.common.moreOps` | 更多操作 | More Actions | 待复核 |
| 11 | `user.wallet.selectStoreWallet` | 选择门店钱包 | Select Store Wallet | 待复核 |
| 12 | `user.wallet.giftAmount` | 赠送金额 | Bonus Amount | 待复核 |
| 13 | `user.wallet.rechargeDetail` | 充值明细 | Top-up Details | 待复核 |
| 14 | `merchant.orders.endOrderConfirmDesc` | 确定结束该订单？结束后订单不可恢复为充电中 | End this order? It cannot return to charging afterwards. | 待复核 |
| 15 | `merchant.package.imageSizeHint` | 尺寸：{w}px × {h}px | Size: {w}px × {h}px | 待复核 |
| 16 | `common.dialcode.hongkong` | 中国香港 | Hong Kong | 待复核 |
| 17 | `merchant.message.channelCenter` | 消息中心 | Message Center | 待复核 |
| 18 | `merchant.message.categoryFeeRefund` | 费用与退款 | Fees & Refunds | 待复核 |
| 19 | `merchant.notify.renewReminderTitle` | 订单自动续租 | Order Auto Renewal | 待复核 |
| 20 | `merchant.notify.renewSuccessTitle` | 订单自动续租成功 | Order Auto Renewed Successfully | 待复核 |
| 21 | `merchant.notify.renewFailedTitle` | 订单自动续租失败 | Order Auto Renewal Failed | 待复核 |
| 22 | `merchant.notify.orderCreatedTitle` | 订单已创建 | Order Created | 待复核 |
| 23 | `merchant.notify.orderPaidTitle` | 订单支付成功 | Payment Successful | 待复核 |
| 24 | `merchant.notify.deviceBoundTitle` | 订单已开始 | Order Started | 待复核 |
| 25 | `merchant.notify.orderExpiringTitle` | 订单即将到期 | Order Due Soon | 待复核 |
| 26 | `merchant.notify.orderOverdueTitle` | 订单已到期 | Order Has Expired | 待复核 |
| 27 | `merchant.notify.orderBreachTitle` | 车辆/电池已远程锁定 | Vehicle/Battery Remotely Locked | 待复核 |
| 28 | `merchant.notify.orderCompletedTitle` | 订单已完成 | Order Completed | 待复核 |
| 29 | `merchant.notify.orderCancelledTitle` | 订单已取消 | Order cancelled | 待复核 |
| 30 | `merchant.notify.orderAdjustedTitle` | 订单金额已调整 | Order Amount Adjusted | 待复核 |
| 31 | `merchant.notify.orderRefundingTitle` | 退款处理中 | Refund in Progress | 待复核 |
| 32 | `merchant.notify.orderRefundedTitle` | 退款成功 | Refund Successful | 待复核 |

## 第 10 批（用户端订单列表口径统一，2026-10-23）

> 用户端「车辆租赁 / 充电订单 / 充值订单」三个订单列表的标题栏与筛选 pill 统一为同一形态（nav-bar 不画分割线、筛选条 padding 与间距一致、可横向滚动），并顺带补齐状态文案。
> 新增 3 个词条（译文取自 rent-merchant 同句，TERM 0 差异）：user.orders.payPartialRefund（部分退款）、user.orders.payFullRefund（全部退款）、user.orders.payProcessing（支付中）。
> 同时清理：删除已无引用的 PAY_ST_MAP 与 payChannelLabel（两端各自内联 i18n 版本）；修复用户端 copyText 参数名遮蔽 i18n t 的问题；订单列表/详情状态文案统一由 ORDER_ST_I18N / chargeStatusTag / rechargeStatusTag 输出。
