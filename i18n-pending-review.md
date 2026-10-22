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
