/* i18n 翻译对照表 · 页面运行时（由 scripts/i18n_reference.mjs 内联进产物）
   读取 window.__I18N_REF__ = { dir, dirs:[目录…], langs:[{code,label,source}], hideable:[code], src }
   dirs 可含多个目录（rent-user + rent-merchant 合并为一张 rent 表）。 */
(function () {
  var CFG = window.__I18N_REF__ || {};
  var DIR = CFG.dir;
  var DIRS = CFG.dirs && CFG.dirs.length ? CFG.dirs.slice() : [DIR];
  var LANGS = CFG.langs || [];
  var HIDEABLE = CFG.hideable || [];
  var SRC = CFG.src;

  function esc(s) {
    return String(s).split('&').join('&amp;').split('<').join('&lt;').split('>').join('&gt;');
  }

  /* 无正则高亮：每轮取最早出现的 token 切段，规避转义/回溯问题 */
  function highlight(raw, toks) {
    var low = raw.toLowerCase();
    var out = [];
    var i = 0;
    while (i < raw.length) {
      var at = -1;
      var len = 0;
      for (var t = 0; t < toks.length; t++) {
        var idx = low.indexOf(toks[t], i);
        if (idx >= 0 && (at < 0 || idx < at)) { at = idx; len = toks[t].length; }
      }
      if (at < 0) { out.push(esc(raw.slice(i))); break; }
      if (at > i) out.push(esc(raw.slice(i, at)));
      out.push('<mark>' + esc(raw.slice(at, at + len)) + '</mark>');
      i = at + len;
    }
    return out.join('');
  }

  /* 嵌套 JSON → 点路径扁平化（与 scripts/i18n_check.mjs 同口径） */
  function flatten(o, prefix, out) {
    for (var k in o) {
      if (!Object.prototype.hasOwnProperty.call(o, k)) continue;
      var v = o[k];
      var n = prefix ? prefix + '.' + k : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, n, out);
      else out[n] = v === null || v === undefined ? '' : String(v);
    }
    return out;
  }

  function cellOf(row, code, toks) {
    var raw = row[code];
    var cls = 'cell';
    var tip = '';
    var html;
    if (raw === undefined) {
      cls += ' miss'; tip = '该语言缺少此词条'; html = '— 缺失 —';
    } else if (raw === '') {
      cls += ' miss'; tip = '该语言此词条为空值'; html = '（空）';
    } else if (code !== SRC && raw === row[SRC]) {
      cls += ' same'; tip = '与中文相同：疑未翻译，请确认';
      html = toks.length ? highlight(raw, toks) : esc(raw);
    } else {
      html = toks.length ? highlight(raw, toks) : esc(raw);
    }
    return { cls: cls, tip: tip, html: html };
  }

  function buildColumns(toks) {
    var cols = [{ colKey: 'serial-number', title: '#', width: 64, align: 'right' }];
    LANGS.forEach(function (l) {
      cols.push({
        colKey: l.code,
        title: l.label,
        cell: function (h, params) {
          var c = cellOf(params.row, l.code, toks);
          /* Vue 3 直接给 innerHTML（Vue 2 的 domProps 在这里无效，会渲染成空单元格） */
          return h('span', {
            class: c.cls,
            title: c.tip || undefined,
            innerHTML: c.html
          });
        }
      });
    });
    return cols;
  }

  function statsOf(rows) {
    var total = rows.length;
    var miss = [];
    var same = [];
    LANGS.forEach(function (l) {
      if (l.source) return;
      var m = 0;
      var s = 0;
      rows.forEach(function (r) {
        var v = r[l.code];
        if (v === undefined || v === '') m++;
        else if (v === r[SRC]) s++;
      });
      miss.push(l.code + ' ' + m);
      same.push(l.code + ' ' + s);
    });
    var text = '共 ' + total + ' 条词条';
    if (total) text += ' · 缺失：' + miss.join(' / ') + ' · 与中文相同：' + same.join(' / ');
    return text;
  }

  var app = Vue.createApp({
    template: document.getElementById('app-tpl').innerHTML,
    data: function () {
      return {
        dir: DIR,
        /* 列配置弹窗只保留标题与按钮，去掉「请选择需要在表格中显示的数据列」说明行 */
        tblLocale: { columnConfigDescriptionText: '' },
        loading: true,
        error: '',
        rows: [],
        q: '',
        shown: HIDEABLE.slice(),
        statsText: '加载中…'
      };
    },
    computed: {
      toks: function () {
        var s = String(this.q || '').trim().toLowerCase();
        if (!s) return [];
        var arr = s.split(' ');
        var out = [];
        for (var i = 0; i < arr.length; i++) if (arr[i]) out.push(arr[i]);
        return out;
      },
      /* 搜索范围 = 当前可见的语言列（隐藏的列不参与匹配） */
      shownCodes: function () {
        var codes = [SRC];
        for (var i = 0; i < this.shown.length; i++) {
          var c = this.shown[i];
          if (HIDEABLE.indexOf(c) >= 0 && codes.indexOf(c) < 0) codes.push(c);
        }
        return codes;
      },
      /* 依赖 toks：关键词变化 → 重建列 → 单元格带高亮重渲染 */
      columns: function () {
        return buildColumns(this.toks);
      },
      columnController: function () {
        return { fields: HIDEABLE, placement: 'top-right', displayType: 'auto-width' };
      },
      view: function () {
        var toks = this.toks;
        var codes = this.shownCodes;
        if (!toks.length) return this.rows;
        return this.rows.filter(function (r) {
          for (var t = 0; t < toks.length; t++) {
            var hit = false;
            for (var i = 0; i < codes.length; i++) {
              var v = r[codes[i]];
              if (v !== undefined && String(v).toLowerCase().indexOf(toks[t]) >= 0) { hit = true; break; }
            }
            if (!hit) return false;
          }
          return true;
        });
      }
    },
    methods: {
      onDisplayColumnsChange: function (value) {
        this.shown = Array.isArray(value) ? value.slice() : [];
      },
      fail: function (msg) {
        this.loading = false;
        this.error = msg;
        this.statsText = '加载失败';
      },
      focusSearch: function () {
        var box = this.$refs.qbox;
        if (box && box.focus) box.focus();
      },
      load: function () {
        if (!window.Vue || !window.TDesign) {
          this.fail('前端依赖未加载：CDN 被拦截或断网（需要 vue.global.prod.js 与 tdesign-vue-next）。');
          return;
        }
        var self = this;
        /* 每个语言：并发拉取该分组下所有目录，扁平化后合并（共享段值一致，后者覆盖无副作用） */
        var jobs = LANGS.map(function (l) {
          var subs = DIRS.map(function (d) {
            var url = 'locales/' + d + '/' + l.code + '.json';
            return fetch(url, { cache: 'no-cache' }).then(function (res) {
              if (!res.ok) throw new Error(d + '/' + l.code + '.json → HTTP ' + res.status);
              return res.json().then(function (json) { return flatten(json, '', {}); },
                function () { throw new Error(d + '/' + l.code + '.json 不是合法 JSON'); });
            });
          });
          return Promise.all(subs).then(function (parts) {
            var merged = {};
            parts.forEach(function (part) {
              for (var k in part) {
                if (Object.prototype.hasOwnProperty.call(part, k)) merged[k] = part[k];
              }
            });
            return merged;
          });
        });
        Promise.all(jobs).then(function (all) {
          var byLang = {};
          LANGS.forEach(function (l, i) { byLang[l.code] = all[i]; });
          var keys = Object.keys(byLang[SRC] || {});
          var rows = keys.map(function (k) {
            var row = { __key: k };
            LANGS.forEach(function (l) {
              if (l.code === SRC) row[l.code] = byLang[SRC][k];
              else row[l.code] = byLang[l.code] && Object.prototype.hasOwnProperty.call(byLang[l.code], k) ? byLang[l.code][k] : undefined;
            });
            return row;
          });
          self.rows = rows;
          self.statsText = statsOf(rows);
          self.loading = false;
        }).catch(function (e) {
          self.fail('词条加载失败：' + (e && e.message ? e.message : '未知错误'));
        });
      }
    },
    mounted: function () {
      this.load();
      var self = this;
      document.addEventListener('keydown', function (e) {
        var tag = (e.target && e.target.tagName ? e.target.tagName : '').toLowerCase();
        if (e.key === '/' && tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          self.focusSearch();
        } else if (e.key === 'Escape' && self.q) {
          self.q = '';
        }
      });
    }
  });

  app.use(TDesign);
  app.mount('#app');
})();