"""商户端 SOP 截图脚本 —— 驱动 index.html 商户端（#root-merchant）走完全链路。
用法：工作区根目录起 `python -m http.server 8139`，再 `python scripts/shoot-merchant-sop.py`。
产物：docs/merchant-rental-sop/images/*.png
"""
import glob
import json
import os
import sys

from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding="utf-8")

URL = "http://127.0.0.1:8139/index.html"
OUT = "e:/test/prototype-app-yadea-rental/docs/merchant-rental-sop/images"

INIT_JS = r"""
(() => {
  const b = document.querySelector('#host-bar .modes button[data-mode="single-m"]');
  if (b) b.click();
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
  window.__T = {
    p() { return document.getElementById('mount-merchant')._vnode.component.proxy; },
    ops(on) {
      document.getElementById('__shot-ops').textContent = on ? '' : '.demo-ops-stack{display:none!important}';
      return 'ok';
    },
    clear() { const p = window.__T.p(); if (p.toasts) p.toasts.splice(0); return 'ok'; },
    scroll(dir) {
      document.querySelectorAll('#root-merchant *').forEach(e => {
        const cs = getComputedStyle(e);
        if (/(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 4) {
          e.scrollTop = dir === 'top' ? 0 : e.scrollHeight;
        }
      });
      return 'ok';
    },
    snap() {
      const p = window.__T.p();
      return { login: p.showLogin, tab: p.tab, homeOV: p.homeOV,
               alert: p.curAlert && p.curAlert.status, alertMod: p.alertMod,
               vehOV: p.vehOV, vehMod: p.vehMod, ordersOV: p.ordersOV, ordersMod: p.ordersMod,
               roOV: p.roOV, profileOV: p.profileOV, profileSub: p.profileSub,
               uWalletView: p.uWalletView, uWalletOps: p.uWalletOps, pick: p.userPickActive,
               docSheet: p.showDocSheet, refund: p.showRefund, paySplit: p.showPaySplit,
               more: p.showMoreActions, dSt: p.dSt, dPaySt: p.dPaySt };
    }
  };
  return 'ok';
})()
"""


def main():
    os.makedirs(OUT, exist_ok=True)
    for f in glob.glob(os.path.join(OUT, "*.png")):
        os.remove(f)

    fails = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 560, "height": 1010}, device_scale_factor=2)
        page.goto(URL, wait_until="load")
        page.wait_for_timeout(900)
        page.evaluate(INIT_JS)
        page.wait_for_timeout(400)

        def js(code, wait=700):
            r = page.evaluate("(() => { const p = window.__T.p(); " + code + " })()")
            page.wait_for_timeout(wait)
            return r

        def step(label, code, sh=None, wait=750, sel="#root-merchant"):
            try:
                js(code, wait)
                if sh:
                    page.evaluate("window.__T.clear()")
                    page.wait_for_timeout(300)
                    page.locator(sel).screenshot(path=os.path.join(OUT, sh + ".png"))
                print("   >", label, json.dumps(page.evaluate("window.__T.snap()"), ensure_ascii=False))
            except Exception as e:  # noqa: BLE001
                fails.append(label + ": " + str(e)[:140])
                print("  !! FAIL", label, str(e)[:140])

        # ══════ 第 1 章 登录与系统选择 ══════
        step("01 密码登录", "p.doLogout(); return 'ok';", "01-login-password", 1800)
        step("02 账号登录", "p.setLoginMode('account'); p.loginAccount='merchant.admin'; p.loginPwd='888888'; p.loginAgree=true; return p.loginMode;", "02-login-account")
        step("03 选择系统", "p.showLogin=false; p.firstLogin=false; p.switchSource='first'; p.tab='profile'; p.profileOV=null; p.profileSub='subSwitchSystem'; return p.profileSub;", "03-switch-system", 1300)
        step("04 首页工作台", "p.switchSource='settings'; p.profileSub=null; p.demoLogin(); return p.tab;", "04-home", 1800)

        # ══════ 第 2 章 告警中心 ══════
        step("05 告警列表", "p.homeOpen('alerts'); return p.homeOV;", "05-alerts", 900)
        step("06 告警详情", "p.openAlertDetail(p.allAlerts[0]); return p.alert;", "06-alert-detail", 900)
        step("07 忽略原因", "p.alertMod='ignore'; p.ignoreReasonPick=p.ignoreReasons[3]; return p.ignoreReasonPick;", "07-alert-ignore")
        step("08 已忽略", "p.confirmIgnoreAlert(); return p.alert;", "08-alert-ignored", 1200)
        step("09 处理中", "p.reopenAlert(); p.startProcessAlert(); return p.alert;", "09-alert-processing", 1000)
        step("10 已关闭", "p.resolveAlert(); return p.alert;", "10-alert-closed", 1000)

        # ══════ 第 3 章 车辆管理 ══════
        step("11 车辆列表", "p.closeAlertDetail(); p.homeClose(); p.vehOV=null; p.vehClearFilters(); p.setTab('vehicles'); return p.tab;", "11-veh-list", 1000)
        step("12 车辆筛选", "p.vehOpenFS(); return 'ok';", "12-veh-filter", 650)
        step("12b 关闭筛选", "p.vehResetFS(); p.vehApplyFS(); return 'ok';", None, 900)
        step("13 车辆详情", "p.vehOpenDetail(p.vehicles[1]); return p.vehOV;", "13-veh-detail", 850)
        step("14 车辆定位", "p.openVehLocation(); return p.vehOV;", "14-veh-location", 1100)
        step("15 车辆轨迹", "p.goBack(); p.openVehTrack(); return p.vehOV;", "15-veh-track", 1200)
        step("16 编辑车辆", "p.goBack(); p.openVehEdit(); return p.vehOV;", "16-veh-edit", 850)
        step("17 绑定用户", "p.goBack(); p.openUserPick('vehicle'); p.userPickQ='user0'; return p.userPickList.length;", "17-veh-bind-user", 850)
        step("18 解绑车辆", "p.closeUserPick(); p.vehMod='unbind'; return p.vehMod;", "18-veh-unbind")
        step("19 车辆报失", "p.vehMod=null; p.vehOpenLost(); return p.vehMod;", "19-veh-lost")
        step("20 新增车辆", "p.vehMod=null; p.goBack(); p.vehOpenAdd(); p.addModel=p.vehModels[0].name; p.addVin='LSVAU2Z0E55555000'; return p.addModel;", "20-veh-add", 850)

        # ══════ 第 4 章 电池管理 ══════
        step("21 电池列表", "p.goBack(); p.ordersOV=null; p.battClearFilters(); p.setTab('orders'); return p.tab;", "21-batt-list", 1000)
        step("22 电池筛选", "p.battOpenFS(); return 'ok';", "22-batt-filter", 650)
        step("23 电池详情", "p.battResetFS(); p.battApplyFS(); p.battOpenDetail(p.batteries[1]); return p.ordersOV;", "23-batt-detail", 1400)
        step("24 电池定位", "p.openBattLocation(); return p.ordersOV;", "24-batt-location", 1100)
        step("25 电池轨迹", "p.goBack(); p.openBattTrack(); return p.ordersOV;", "25-batt-track", 1200)
        step("26 禁止放电", "p.goBack(); p.battOpenDischarge(); return p.battMod;", "26-batt-discharge", 800)
        step("27 电池报失", "p.battMod=null; p.battOpenReportLost(); return p.battMod;", "27-batt-lost", 800)
        step("28 编辑电池", "p.battMod=null; p.goBack(); p.openBattEdit(); return p.ordersOV;", "28-batt-edit", 850)
        step("29 新增电池", "p.battMod=null; p.goBack(); p.openBattAdd(); return p.ordersOV;", "29-batt-add", 850)

        # ══════ 第 5 章 订单管理 ══════
        step("30 订单列表", "p.battMod=null; p.vehMod=null; p.goBack(); p.homeOpenOrders('vehicle'); return p.ordersOV;", "30-order-list", 1000)
        step("31 订单筛选", "p.ordersOpenFS(); return 'ok';", "31-order-filter", 650)
        step("31b 关闭筛选", "p.ordersResetFS(); p.ordersApplyFS(); return 'ok';", None, 900)
        step("32 订单详情", "p.ordersOpenDetail(p.orders.filter(o=>o.type==='vehicle'&&o.status==='progress')[0]); return p.do_&&p.do_.id;", "32-order-detail", 950)
        step("33 费用明细", "p.ordersOV='feedetail'; return p.feeRows.length;", "33-order-fee-detail", 850)
        step("34 更多操作", "p.ordersOV='detail'; p.openRowMore(p.feeRows[0]); return p.more;", "34-order-more-actions")
        step("35 改价弹窗", "p.showMoreActions=false; p.openPaySplit(p.feeRows[0]); return p.paySplit;", "35-order-price-change", 950)
        step("36 改价确认", "p.submitPaySplit(); return p.ordersMod;", "36-order-price-confirm", 850)
        step("37 结束订单退款", "p.psConfirmMod=null; p.showPaySplit=false; p.openRefund('return', p.feeRows[0]); return p.refund;", "37-order-refund-return", 950)
        step("38 结束订单确认", "p.submitRefund(); return p.ordersMod;", "38-order-end-confirm", 950)
        step("39 退款记录", "p.ordersMod=null; p.showRefund=false;"
             "window.__c=['YD202608100007','YD202608190008','YD202608100001','YD202608190001'];"
             "for(var i=0;i<window.__c.length;i++){var o=p.orders.filter(function(x){return x.id===window.__c[i]})[0];"
             "p.ordersOpenDetail(o);if((p.curRefunds||[]).length){break}}"
             "p.openRefundRecords(p.feeRows[0]); return (p.curRefunds||[]).length;", "39-order-refund-records", 950)
        step("40 改价记录", "p.goBack(); p.ordersOV='oprecords'; return p.opRecords.length;", "40-order-oprecords", 850)
        step("41 订单资料", "p.ordersOV='detail'; p.openDocsPage(); return p.ordersOV;", "41-order-docs", 850)
        step("42 资料上传", "p.openDocSheet(); return p.docSheet;", "42-order-doc-sheet", 850)
        step("43 绑定车辆", "p.showDocSheet=false; p.openOrderPick('assignVehicle'); p.orderPickSel=p.orderPickList[0]; return p.orderPickList.length;", "43-order-pick-vehicle", 850)
        step("44 结束订单", "p.closeOrderPick(); p.openRefund('return', p.feeRows[0]); p.submitRefund(); return p.ordersMod;", "44-order-end-confirm", 1000)
        step("45 订单已结束", "p.ordersConfirmMod(); return p.dSt;", "45-order-complete", 1300)

        # ══════ 第 6 章 充值订单 ══════
        step("46 充值订单列表", "p.closeOrderList(); p.roOpenList(); return p.roOV;", "46-ro-list", 1100)
        step("47 充值订单筛选", "p.roOpenFS(); return 'ok';", "47-ro-filter", 650)
        step("48 充值订单详情", "p.roResetFS(); p.roApplyFS(); p.roOpenDetail(p.rechargeOrders[0]); return p.curRechargeOrder&&p.curRechargeOrder.id;", "48-ro-detail", 1100)
        step("49 充值退款", "p.roOpenRefund(); return p.roRefundMod;", "49-ro-refund", 850)
        step("50 取消订单", "p.roRefundMod=false; p.roRequestCancel(); return p.roCancelMod;", "50-ro-cancel", 800)
        step("51 充值退款记录", "p.roCancelMod=false; p.roOpenRefunds(); return p.roOV;", "51-ro-refunds", 950)

        # ══════ 第 7 章 我的 · 门店与配置 ══════
        step("52 我的", "p.goBack(); p.roCloseList(); p.profileOV=null; p.profileSub=null; p.setTab('profile'); return p.tab;", "52-profile", 1000)
        step("53 门店列表", "p.openMenu('store'); return p.profileOV;", "53-store-list", 1100)
        step("54 车型管理", "p.profileSub=null; p.profileOV=null; p.openMenu('model'); return p.profileOV;", "54-model", 1300)
        step("55 编辑车型", "p.openModelEdit(p.profileModels[0]); return p.profileSub;", "55-model-edit", 950)
        step("56 电池型号", "p.profileSub=null; p.profileOV=null; p.openMenu('battModel'); return p.profileOV;", "56-battmodel", 1300)
        step("57 编辑电池型号", "p.openBattModelEdit(p.profileBattModels[0]); return p.profileSub;", "57-battmodel-edit", 950)
        step("58 套餐管理", "p.profileSub=null; p.profileOV=null; p.openMenu('package'); return p.profileOV;", "58-package", 1300)
        step("59 充值配置", "p.profileSub=null; p.profileOV=null; p.openMenu('recharge'); return p.profileOV;", "59-recharge-config", 1300)
        step("60 编辑充值配置", "p.openRechargeEdit(0); return p.profileSub;", "60-recharge-edit", 950)
        step("61 订单配置", "p.profileSub=null; p.profileOV=null; p.openMenu('config'); return p.profileOV;", "61-order-config", 1300)
        step("62 客服信息", "p.profileSub=null; p.profileOV=null; p.openMenu('cs'); return p.profileOV;", "62-cs-info", 1300)
        step("63 编辑客服", "p.openCsEdit(0); return p.profileSub;", "63-cs-edit", 950)
        step("64 系统设置", "p.profileSub=null; p.profileOV=null; p.openMenu('settings'); return p.profileOV;", "64-settings", 1300)

        # ══════ 第 8 章 组织与权限 ══════
        step("65 账号管理", "p.profileSub=null; p.profileOV=null; p.openMenu('account'); return p.profileOV;", "65-account-list", 1300)
        step("66 新增账号", "p.openAccAdd(); p.fa.account='new.manager'; p.fa.name='New Manager'; return p.profileSub;", "66-account-add", 950)
        step("67 职位管理", "p.profileSub=null; p.profileOV=null; p.openMenu('pos'); return p.profileOV;", "67-pos-list", 1300)
        step("68 职位详情", "p.openPosDetail(p.positions[0]); return p.profileSub;", "68-pos-detail", 950)
        step("69 用户管理", "p.profileSub=null; p.profileOV=null; p.openMenu('user'); return p.profileOV;", "69-user-list", 1300)
        step("70 用户详情", "p.openUserDetail(p.userList[0]); return p.profileSub;", "70-user-detail", 1000)
        step("71 用户钱包", "window.__T.scroll('bottom'); return 'ok';", "71-user-wallet", 600)
        step("72 钱包操作", "window.__T.scroll('top'); p.openUWalletOps(); return p.uWalletOps;", "72-wallet-ops", 800)
        step("73 钱包调账", "p.uWalletOps=false; p.openUAdjust(); return p.uWalletSheet;", "73-wallet-adjust", 900)

        # ══════ 附 原型操作栏（权限演示） ══════
        try:
            js("p.uWalletSheet=''; p.closeUWallet(); return 'ok';", 900)
            page.evaluate("window.__T.ops(true)")
            page.wait_for_timeout(500)
            page.locator("#root-merchant .demo-ops").screenshot(path=os.path.join(OUT, "74-perm-panel.png"))
            print("   > 74 原型操作栏 ok")
            page.evaluate("window.__T.ops(false)")
        except Exception as e:  # noqa: BLE001
            fails.append("74 原型操作栏: " + str(e)[:140])
            print("  !! FAIL 74", str(e)[:140])

        browser.close()

    n = len(glob.glob(os.path.join(OUT, "*.png")))
    print("\n图片总数:", n)
    print("FAILS:", json.dumps(fails, ensure_ascii=False, indent=1) if fails else "none")


main()
