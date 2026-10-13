import glob
import json
import os
import sys

from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding="utf-8")

URL = "http://127.0.0.1:8137/index.html"
OUT = "e:/test/prototype-app-yadea-rental/docs/user-rental-sop/images"

INIT_JS = r"""
(() => {
  const b = document.querySelector('#host-bar .modes button[data-mode="single-u"]');
  if (b) b.click();
  if (!document.getElementById('__shot')) {
    const s = document.createElement('style');
    s.id = '__shot';
    s.textContent = '#host-bar{display:none!important}.demo-ops-stack{display:none!important}body{background:#EEF1F5!important}';
    document.head.appendChild(s);
  }
  window.__T = {
    p() { return document.getElementById('mount-user')._vnode.component.proxy; },
    prep(txt) {
      const u = document.getElementById('root-user');
      const key = String(txt).replace(/\s+/g, '');
      const list = [...u.querySelectorAll('*')].filter(e => {
        const t = (e.innerText || '').replace(/\s+/g, '');
        return t && t.includes(key);
      });
      list.sort((a, b) => a.querySelectorAll('*').length - b.querySelectorAll('*').length);
      window.__T._last = list;
      return list.map((e, i) => {
        const r = e.getBoundingClientRect();
        return { i, x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2),
                 w: Math.round(r.width), h: Math.round(r.height), kids: e.children.length,
                 cls: (e.className || '').toString().slice(0, 44) };
      });
    },
    tap(i) {
      const e = window.__T._last && window.__T._last[i];
      if (!e) return 'NF';
      e.click();
      return 'OK';
    },
    scroll(dir) {
      let n = 0;
      document.querySelectorAll('#root-user *').forEach(e => {
        const cs = getComputedStyle(e);
        if (/(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 4) {
          e.scrollTop = dir === 'top' ? 0 : e.scrollHeight;
          n++;
        }
      });
      return n;
    },
    snap() {
      const p = window.__T.p();
      return { showRent: p.showRent, showStore: p.showStore, showVehicle: p.showVehicle,
               showConfirm: p.showConfirm, showPayment: p.showPayment, showOrderDetail: p.showOrderDetail,
               showRenewPlan: p.showRenewPlan, showFeeDetail: p.showFeeDetail,
               status: p.orderInfo && p.orderInfo.status, payStatus: p.orderInfo && p.orderInfo.payStatus,
               autoRenew: p.autoRenew, renewVisible: p.renewEntryVisible,
               renewOrders: ((p.orderInfo && p.orderInfo.renewOrders) || []).map(r => r.renewType + '/' + r.payStatus + '/' + r.plan),
               feeKinds: (p.feeRows || []).map(r => r.kind + '·' + r.payStatus) };
    }
  };
  return document.body.className;
})()
"""


def main():
    for f in glob.glob(os.path.join(OUT, "*.png")):
        os.remove(f)

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 520, "height": 1000}, device_scale_factor=2)
        page.goto(URL, wait_until="load")
        page.wait_for_timeout(900)
        page.evaluate(INIT_JS)
        page.wait_for_timeout(400)

        def shot(name):
            page.wait_for_timeout(300)
            page.locator("#root-user").screenshot(path=os.path.join(OUT, name + ".png"))
            print("  SHOT", name)

        def snap():
            return page.evaluate("window.__T.snap()")

        def tap(txt, expect=None, tries=3):
            cands = [c for c in page.evaluate("(t) => window.__T.prep(t)", txt) if c["w"] > 8 and c["h"] > 8]
            for c in cands[:tries]:
                page.evaluate("(i) => window.__T.tap(i)", c["i"])
                page.wait_for_timeout(500)
                if expect is None or page.evaluate(expect):
                    return True
                page.mouse.click(c["x"], c["y"])
                page.wait_for_timeout(700)
                if expect is None or page.evaluate(expect):
                    return True
            print("  TAP-FAIL", txt, json.dumps(cands[:tries], ensure_ascii=False))
            return False

        def js(code):
            return page.evaluate("(() => { const p = window.__T.p(); " + code + " })()")

        # ── 第 1 章 租赁下单 ─────────────────────────────
        shot("01-home")

        tap("租赁入口", "window.__T.p().showRent===true")
        shot("02-rent")

        tap("立即选购", "window.__T.p().showStore===true")
        shot("03-store")

        tap("双流区雅和北路店", "window.__T.p().showVehicle===true")
        shot("04-vehicle")

        tap("立即租", "window.__T.p().showConfirm===true")
        shot("05-confirm")

        page.evaluate("window.__T.scroll('bottom')")
        shot("06-confirm-autorenew")

        js("p.openIdSelect(); return 'ok';")
        page.wait_for_timeout(700)
        shot("07-realname-select")

        js("p.openIdAdd(); return 'ok';")
        page.wait_for_timeout(700)
        js("p.idName='张伟'; p.idCardNo='110101199003077514'; p.driverNo='110101199003077514';"
           "p.idPickerKind='id'; p.commitIdPhoto(); p.idPickerKind='driver'; p.commitIdPhoto(); return 'ok';")
        page.wait_for_timeout(500)
        shot("08-realname-form")

        print("SUBMIT:", js("p.submitIdInfo(); return 'ok';"))
        page.wait_for_timeout(1000)
        print("IDLIST:", js("return (p.idInfoList||[]).length + '|err:' + p.idNameErr + p.idCardErr + p.driverErr + p.idPhotoErr + p.driverPhotoErr;"))
        print("SELECT-ID:", js("const r=(p.idInfoList||[])[0]; if(!r) return 'none'; p.confirmIdSelect(r); return r.name;"))
        page.wait_for_timeout(800)
        page.evaluate("window.__T.scroll('top')")
        shot("09-confirm-ready")

        print("ORDER:", js("p.confirmOrder(); return 'ok';"))
        page.wait_for_timeout(1200)
        shot("10-order-created")
        print("  after order:", json.dumps(snap(), ensure_ascii=False))

        js("if (p.openPayOrder) p.openPayOrder(); return 'ok';")
        page.wait_for_timeout(800)
        shot("11-payment")
        print("  after openpay:", json.dumps(snap(), ensure_ascii=False))

        js("p.confirmPayment(); return 'ok';")
        page.wait_for_timeout(1800)
        shot("12-order-paid")
        print("  after pay:", json.dumps(snap(), ensure_ascii=False))

        # ── 订单绑定车辆（取车入口）──────────────────────
        js("p.scanCtx='vehicle'; p.navOpen('scan'); return 'ok';")
        page.wait_for_timeout(1000)
        shot("12a-bind-scan")

        js("p.openManualInput(); return 'ok';")
        page.wait_for_timeout(900)
        js("p.manualVin='YD1234567890'; return 'ok';")
        page.wait_for_timeout(400)
        shot("12b-bind-vin")

        js("p.confirmManualVin(); return 'ok';")
        page.wait_for_timeout(1200)
        shot("12c-bind-device")

        js("p.openBindConfirm(); return 'ok';")
        page.wait_for_timeout(800)
        shot("12d-bind-confirm")
        print("  bind:", json.dumps(snap(), ensure_ascii=False))

        js("p.closeBindConfirm(); p.navBack(); return 'ok';")
        page.wait_for_timeout(1000)
        print("  back:", json.dumps(snap(), ensure_ascii=False))

        # ── 第 2 章 自动续租 ─────────────────────────────
        print("AUTORENEW:", js("p.toggleAutoRenew(); return String(p.autoRenew);"))
        page.wait_for_timeout(900)
        page.evaluate("window.__T.scroll('bottom')")
        shot("13-autorenew-on")
        print("  after autorenew:", json.dumps(snap(), ensure_ascii=False))

        js("p.showFeeDetail = true; return 'ok';")
        page.wait_for_timeout(800)
        shot("14-fee-auto")
        print("  fee:", json.dumps(snap(), ensure_ascii=False))

        # ── 第 3 章 手动续租 ─────────────────────────────
        js("p.showFeeDetail = false;"
           "p.orderInfo = Object.assign({}, p.orderInfo, {status:'progress', statusText:'使用中', statusColor:'#2B3F5F',"
           "frame:'LSVAU2Z0B12345000', pickupTime:'2026-10-12 17:30:00', plan:'时租×2小时'}); return 'ok';")
        page.wait_for_timeout(800)
        page.evaluate("window.__T.scroll('bottom')")
        shot("15-order-progress")
        print("  progress:", json.dumps(snap(), ensure_ascii=False))

        js("p.openRenew(); return 'ok';")
        page.wait_for_timeout(900)
        shot("16-renew-plan")
        print("  renew sheet:", json.dumps(snap(), ensure_ascii=False))

        js("p.renewPeriodIdx = 1; p.renewAddDays(); return 'ok';")
        page.wait_for_timeout(600)
        shot("17-renew-plan-day")
        print("  renew days:", js("return p.renewPeriodLabel + '/' + p.renewDays + '/' + p.renewRentFee;"))

        js("p.confirmRenew(); return 'ok';")
        page.wait_for_timeout(1000)
        js("p.showPayment = false; p.showFeeDetail = true; return 'ok';")
        page.wait_for_timeout(900)
        shot("18-renew-unpaid")
        print("  unpaid:", json.dumps(snap(), ensure_ascii=False))

        js("const r=(p.orderInfo.renewOrders||[]).filter(x=>x.payStatus!=='PAID'&&!x.canceled)[0];"
           "if(r) p.payRenewDirect(r.renewNo); return 'ok';")
        page.wait_for_timeout(900)
        shot("19-renew-payment")

        js("p.confirmPayment(); return 'ok';")
        page.wait_for_timeout(1800)
        shot("20-fee-manual")
        print("  final:", json.dumps(snap(), ensure_ascii=False))

        browser.close()


main()
