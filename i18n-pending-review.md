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
