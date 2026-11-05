/*
 * DealFinds India – app-style behaviour (redesign)
 * ---------------------------------------------------------------------------
 * One file for every page. It reads the product list from js/products-data.js
 * (window.DFI_PRODUCTS / DFI_CATEGORIES / DFI_COLLECTIONS) and js/site-config.js
 * (window.DFI_CONFIG), exactly like the original site, so your data never changes.
 *
 * What it does
 *   - Home: department rail, collection banners, category arches, price tiles, product rails
 *   - Shop: search, quick chips, filter sheet, sort sheet, URL-synced state, "show more"
 *   - Everywhere: product sheet with a sticky "View on Meesho" button, saved items
 *     (kept only in the visitor's own browser), categories sheet, more sheet, toast, forms
 *
 * Plain JavaScript, no libraries. Text is always inserted with textContent, never innerHTML.
 */
(function () {
  "use strict";

  var CFG = window.DFI_CONFIG || {};
  var CATEGORIES = Array.isArray(window.DFI_CATEGORIES) ? window.DFI_CATEGORIES : [];
  var COLLECTIONS = Array.isArray(window.DFI_COLLECTIONS) ? window.DFI_COLLECTIONS : [];
  var PLACEHOLDER_RE = /REPLACE-WITH-YOUR-AFFILIATE-LINK/i;
  var AFFILIATE_REL = "sponsored nofollow noopener noreferrer";
  var WOMEN = "Women's Fashion";
  var MEN = "Men's Fashion";
  var PAGE = document.body.getAttribute("data-page") || "";
  var PAGE_SIZE = 12;
  var HAS_DIALOG = typeof window.HTMLDialogElement === "function" && typeof document.createElement("dialog").showModal === "function";
  var HAS_POPOVER = typeof HTMLElement !== "undefined" && typeof HTMLElement.prototype.showPopover === "function";

  /* ------------------------------------------------------------------ helpers */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === false || v === null || v === undefined) return;
        if (k === "class") node.className = v;
        else if (k === "text") node.textContent = v;
        else node.setAttribute(k, v === true ? "" : v);
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  var SVG_NS = "http://www.w3.org/2000/svg";
  function icon(name, extra) {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "icon" + (extra ? " " + extra : ""));
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var use = document.createElementNS(SVG_NS, "use");
    use.setAttribute("href", "#i-" + name);
    svg.appendChild(use);
    return svg;
  }

  var nf;
  try { nf = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }); } catch (e) { nf = null; }
  function inr(n) { return "₹" + (nf ? nf.format(n) : String(Math.round(n))); }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }

  function isHttpUrl(u) { return typeof u === "string" && /^https?:\/\/[^\s]+$/i.test(u.trim()); }
  function isPlaceholder(u) { return !isHttpUrl(u) || PLACEHOLDER_RE.test(u); }

  /* A discount is only ever shown when the owner has marked it as verified. */
  function discountPercent(p) {
    if (p.discountVerified !== true) return 0;
    if (!(p.originalPrice > p.price)) return 0;
    var pct = Math.round((1 - p.price / p.originalPrice) * 100);
    return pct >= 1 ? pct : 0;
  }

  function catByName(name) { for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].name === name) return CATEGORIES[i]; return null; }
  function catBySlug(slug) { for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].slug === slug) return CATEGORIES[i]; return null; }
  function colBySlug(slug) { for (var i = 0; i < COLLECTIONS.length; i++) if (COLLECTIONS[i].slug === slug) return COLLECTIONS[i]; return null; }
  function isGenderCat(c) { return c && (c.name === WOMEN || c.name === MEN); }

  /* ------------------------------------------------------------------ data */
  var WARNINGS = [];
  function loadProducts() {
    var raw = Array.isArray(window.DFI_PRODUCTS) ? window.DFI_PRODUCTS : [];
    var seen = {};
    var known = {};
    CATEGORIES.forEach(function (c) { known[c.name] = true; });
    var out = [];
    raw.forEach(function (p, i) {
      var label = "Product #" + (i + 1) + (p && p.id ? " (" + p.id + ")" : "");
      if (!p || typeof p !== "object") { WARNINGS.push(label + ": not an object, skipped."); return; }
      if (!p.id || typeof p.id !== "string") { WARNINGS.push(label + ": missing id, skipped."); return; }
      if (seen[p.id]) { WARNINGS.push(label + ": duplicate id, skipped."); return; }
      if (!p.name) { WARNINGS.push(label + ": missing name, skipped."); return; }
      if (!(typeof p.price === "number" && isFinite(p.price) && p.price > 0)) { WARNINGS.push(label + ": price must be a number above 0, skipped."); return; }
      if (!p.image) { WARNINGS.push(label + ": missing image, skipped."); return; }
      if (!known[p.category]) WARNINGS.push(label + ': category "' + p.category + '" is not listed in DFI_CATEGORIES.');
      (p.alsoIn || []).forEach(function (c) { if (!known[c]) WARNINGS.push(label + ': alsoIn "' + c + '" is not listed in DFI_CATEGORIES.'); });
      if (!isHttpUrl(p.affiliateUrl)) WARNINGS.push(label + ": affiliateUrl is missing or not an https:// link; its button will be disabled.");
      if (p.originalPrice && p.discountVerified !== true) WARNINGS.push(label + ": originalPrice is ignored until discountVerified is true.");
      seen[p.id] = true;
      out.push(p);
    });
    return out;
  }
  var PRODUCTS = loadProducts();
  var BY_ID = {};
  PRODUCTS.forEach(function (p) { BY_ID[p.id] = p; });
  var HAS_SAMPLES = PRODUCTS.some(function (p) { return p.sample === true; });

  function inCategory(p, name) { return p.category === name || (Array.isArray(p.alsoIn) && p.alsoIn.indexOf(name) !== -1); }
  function genderOf(p) { return inCategory(p, WOMEN) ? "women" : inCategory(p, MEN) ? "men" : ""; }
  function byNewest(a, b) { return (b.addedOn || "").localeCompare(a.addedOn || "") || a.id.localeCompare(b.id); }
  function byPriceAsc(a, b) { return a.price - b.price || a.id.localeCompare(b.id); }
  function byPriceDesc(a, b) { return b.price - a.price || a.id.localeCompare(b.id); }
  var SORTS = {
    "newest": { label: "Newest first", fn: byNewest },
    "price-asc": { label: "Price: low to high", fn: byPriceAsc },
    "price-desc": { label: "Price: high to low", fn: byPriceDesc }
  };

  var BANDS = [
    { id: "u299", label: "Up to ₹299", head: "Up to", top: "₹299", test: function (p) { return p.price <= 299; } },
    { id: "u499", label: "Up to ₹499", head: "Up to", top: "₹499", test: function (p) { return p.price <= 499; } },
    { id: "u799", label: "Up to ₹799", head: "Up to", top: "₹799", test: function (p) { return p.price <= 799; } },
    { id: "u999", label: "Up to ₹999", head: "Up to", top: "₹999", test: function (p) { return p.price <= 999; } },
    { id: "o1000", label: "₹1,000 & above", head: "From", top: "₹1,000", test: function (p) { return p.price >= 1000; } }
  ];
  function bandById(id) { for (var i = 0; i < BANDS.length; i++) if (BANDS[i].id === id) return BANDS[i]; return null; }

  /* ------------------------------------------------------------------ storage (never throws) */
  var memStore = {};
  var store = {
    get: function (k) { try { var v = window.localStorage.getItem(k); return v === null ? (memStore[k] || null) : v; } catch (e) { return memStore[k] || null; } },
    set: function (k, v) { memStore[k] = v; try { window.localStorage.setItem(k, v); } catch (e) { /* private mode: stays in memory */ } }
  };

  /* ------------------------------------------------------------------ saved items */
  var SAVED_KEY = "dfi-saved-v2";
  var saved = (function () {
    var ids = [];
    try { var raw = JSON.parse(store.get(SAVED_KEY) || "[]"); if (Array.isArray(raw)) ids = raw; } catch (e) { ids = []; }
    return ids.filter(function (id) { return typeof id === "string" && BY_ID[id]; });
  })();
  function isSaved(id) { return saved.indexOf(id) !== -1; }
  function persistSaved() { store.set(SAVED_KEY, JSON.stringify(saved)); }
  function liveSay(msg) { var l = $("#dfi-live"); if (l) { l.textContent = ""; window.setTimeout(function () { l.textContent = msg; }, 30); } }

  function syncSaved() {
    $$("[data-saved-count]").forEach(function (n) { n.textContent = String(saved.length); n.hidden = saved.length === 0; });
    $$("[data-save]").forEach(function (b) {
      var on = isSaved(b.getAttribute("data-save"));
      b.setAttribute("aria-pressed", on ? "true" : "false");
      var p = BY_ID[b.getAttribute("data-save")];
      if (p) b.setAttribute("aria-label", (on ? "Remove from saved: " : "Save: ") + p.name);
    });
  }
  function toggleSaved(id, source) {
    var p = BY_ID[id];
    if (!p) return;
    var i = saved.indexOf(id);
    if (i === -1) { saved.unshift(id); toast("Saved to your list"); liveSay("Saved: " + p.name); }
    else { saved.splice(i, 1); toast("Removed from saved"); liveSay("Removed: " + p.name); }
    persistSaved();
    syncSaved();
    if (source) { source.classList.remove("heart-pop"); void source.offsetWidth; source.classList.add("heart-pop"); }
  }

  /* ------------------------------------------------------------------ toast (top layer, so it shows above sheets) */
  var toastEl = null, toastTimer = 0;
  function toast(msg) {
    if (!toastEl) {
      toastEl = el("div", { class: "toast", "aria-hidden": "true" });
      if (HAS_POPOVER) toastEl.setAttribute("popover", "manual");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    try {
      if (HAS_POPOVER) { try { toastEl.hidePopover(); } catch (e) { /* not open */ } toastEl.showPopover(); }
      else toastEl.classList.add("is-on");
    } catch (e) { toastEl.classList.add("is-on"); }
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      try { if (HAS_POPOVER) toastEl.hidePopover(); } catch (e) { /* ignore */ }
      toastEl.classList.remove("is-on");
    }, 2200);
  }

  /* ------------------------------------------------------------------ sheets */
  var current = null, uid = 0;
  function lockScroll(on) { document.documentElement.classList.toggle("no-scroll", on); }

  function openSheet(o) {
    if (!HAS_DIALOG) return null;
    var opener = o.opener || (current && current.opener) || document.activeElement;
    if (current) { try { current.dlg.close(); } catch (e) { /* ignore */ } }
    var id = "sheet-title-" + (++uid);
    var title = el("h2", { id: id, text: o.title || "" });
    var x = el("button", { class: "sheet-x", type: "button", "aria-label": "Close" }, [icon("close")]);
    var body = el("div", { class: "sheet-body" });
    var foot = el("div", { class: "sheet-foot", hidden: true });
    var dlg = el("dialog", { class: "sheet " + (o.className || ""), "aria-labelledby": id }, [el("div", { class: "sheet-head" }, [title, x]), body, foot]);
    var api = { dlg: dlg, title: title, body: body, foot: foot, opener: opener, close: function () { dlg.close(); } };

    x.addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", function () {
      if (current === api) {
        current = null;
        lockScroll(false);
        if (opener && opener.focus && document.contains(opener)) { try { opener.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
      }
      dlg.remove();
    });

    document.body.appendChild(dlg);
    o.build(api);
    lockScroll(true);
    current = api;
    dlg.showModal();
    body.scrollTop = 0;
    return api;
  }

  /* ------------------------------------------------------------------ product pieces */
  function priceBits(p, cls) {
    var out = [el("b", { text: inr(p.price) })];
    var pct = discountPercent(p);
    if (pct) {
      out.push(el("s", null, [el("span", { class: "sr-only", text: "Original price " }), inr(p.originalPrice)]));
      out.push(el("em", { text: pct + "% off" }));
    }
    return el("span", { class: cls }, out);
  }

  function heartPair() { return [icon("heart", "i-off"), icon("heart-solid", "i-on")]; }

  function createCard(p, opts) {
    opts = opts || {};
    var pct = discountPercent(p);
    var tags = [];
    if (p.sample === true) tags.push(el("span", { class: "tag tag-sample", text: "Sample" }));
    if (pct) tags.push(el("span", { class: "tag tag-off", text: pct + "% off" }));
    var img = el("img", { src: p.image, alt: p.sample ? p.name + " (sample illustration)" : p.name, width: "400", height: "500", loading: opts.eager ? "eager" : "lazy", decoding: "async" });
    var media = el("span", { class: "pc-img" }, [img, tags.length ? el("span", { class: "pc-tags" }, tags) : null]);
    var meta = p.category;
    var open = el("button", { class: "pc-open", type: "button", "aria-label": p.name + ", " + inr(p.price) + (pct ? ", " + pct + "% off" : "") + ". View details" }, [
      media,
      el("span", { class: "pc-body" }, [
        el("span", { class: "pc-name", text: p.name }),
        priceBits(p, "pc-price"),
        el("span", { class: "pc-meta", text: meta })
      ])
    ]);
    var save = el("button", { class: "pc-save", type: "button", "data-save": p.id, "aria-pressed": isSaved(p.id) ? "true" : "false", "aria-label": (isSaved(p.id) ? "Remove from saved: " : "Save: ") + p.name }, heartPair());
    open.addEventListener("click", function () { openProduct(p, open); });
    save.addEventListener("click", function () { toggleSaved(p.id, save); });
    return el("li", null, [el("article", { class: "pc", "data-id": p.id, "data-placeholder": isPlaceholder(p.affiliateUrl) ? "true" : "false" }, [open, save])]);
  }

  function fillGrid(container, list, emptyText) {
    container.textContent = "";
    if (!list.length) { container.appendChild(el("li", { class: "noscript-msg", text: emptyText || "Products will appear here soon." })); return; }
    var frag = document.createDocumentFragment();
    list.forEach(function (p) { frag.appendChild(createCard(p)); });
    container.appendChild(frag);
  }

  function setBuy(a, p) {
    a.textContent = "";
    var url = isHttpUrl(p.affiliateUrl) ? p.affiliateUrl.trim() : null;
    if (!url) {
      a.removeAttribute("href"); a.removeAttribute("target"); a.removeAttribute("aria-label");
      a.setAttribute("role", "link"); a.setAttribute("aria-disabled", "true");
      a.appendChild(document.createTextNode("Link coming soon"));
      return;
    }
    var label = isPlaceholder(p.affiliateUrl) ? "Open Meesho (sample)" : "View on Meesho";
    a.setAttribute("href", url);
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", AFFILIATE_REL);
    a.removeAttribute("role"); a.removeAttribute("aria-disabled");
    a.setAttribute("aria-label", label + ": " + p.name + " (opens in a new tab)");
    a.appendChild(document.createTextNode(label));
    a.appendChild(icon("external", "icon-s"));
  }

  function related(p) {
    var same = PRODUCTS.filter(function (q) { return q.id !== p.id && q.category === p.category; });
    if (same.length < 6) {
      var g = genderOf(p);
      PRODUCTS.forEach(function (q) { if (q.id !== p.id && same.indexOf(q) === -1 && g && genderOf(q) === g) same.push(q); });
    }
    return same.slice(0, 8);
  }

  function fillProduct(api, p) {
    var pct = discountPercent(p);
    api.title.textContent = "Product details";
    api.body.textContent = "";
    var tags = [];
    if (p.sample === true) tags.push(el("span", { class: "tag tag-sample", text: "Sample" }));
    var media = el("div", { class: "p-media" }, [
      el("img", { src: p.image, alt: p.sample ? p.name + " (sample illustration)" : p.name, width: "400", height: "500", decoding: "async" })
    ].concat(tags));

    var placeholder = isPlaceholder(p.affiliateUrl);
    var noteText;
    if (p.sample === true || placeholder) {
      noteText = "Sample listing: the picture, price and link are placeholders until a real Meesho affiliate link is added. The button only opens Meesho's home page.";
    } else {
      noteText = "You'll go to Meesho in a new tab. Price and availability on Meesho may differ from what's shown here, so check the final price before you buy. We may earn a commission at no extra cost to you.";
    }
    var note = el("p", { class: "p-note", "data-sample": (p.sample === true || placeholder) ? "true" : false }, [icon("info", "icon-s"), el("span", { text: noteText })]);

    var info = el("div", { class: "p-info" }, [
      el("span", { class: "p-cat", text: p.category }),
      el("h3", { class: "p-title", text: p.name }),
      priceBits(p, "p-price"),
      p.description ? el("p", { class: "p-desc", text: p.description }) : null,
      note
    ]);

    var rel = related(p);
    if (rel.length) {
      var strip = el("div", { class: "mini" });
      rel.forEach(function (q) {
        var b = el("button", { type: "button", "aria-label": q.name + ", " + inr(q.price) }, [
          el("img", { src: q.image, alt: "", width: "400", height: "500", loading: "lazy", decoding: "async" }),
          el("span", { text: inr(q.price) })
        ]);
        b.addEventListener("click", function () { fillProduct(api, q); api.body.setAttribute("tabindex", "-1"); api.body.focus({ preventScroll: true }); api.body.scrollTop = 0; });
        strip.appendChild(b);
      });
      info.appendChild(el("div", { class: "p-more" }, [el("h3", { text: "You may also like" }), strip]));
    }
    api.body.appendChild(media);
    api.body.appendChild(info);

    api.foot.hidden = false;
    api.foot.textContent = "";
    var save = el("button", { class: "btn btn-ghost btn-icon", type: "button", "data-save": p.id, "aria-pressed": isSaved(p.id) ? "true" : "false", "aria-label": (isSaved(p.id) ? "Remove from saved: " : "Save: ") + p.name }, heartPair());
    save.addEventListener("click", function () { toggleSaved(p.id, save); });
    var buy = el("a", { class: "btn btn-gold btn-block" });
    setBuy(buy, p);
    api.foot.appendChild(save);
    api.foot.appendChild(buy);
  }

  function openProduct(p, opener) {
    var api = openSheet({ title: "Product details", className: "psheet", opener: opener, build: function (a) { fillProduct(a, p); } });
    if (!api && isHttpUrl(p.affiliateUrl)) window.open(p.affiliateUrl.trim(), "_blank", "noopener,noreferrer");
  }

  /* ------------------------------------------------------------------ shared sheets */
  function catTile(c, href) {
    var count = PRODUCTS.filter(function (p) { return inCategory(p, c.name); }).length;
    return el("a", { class: "cat-tile", href: href, "data-nav": "true" }, [
      el("span", { class: "cat-art" }, [el("img", { src: c.image, alt: "", width: "400", height: "500", loading: "lazy", decoding: "async" })]),
      el("span", null, [el("b", { text: c.name }), el("small", { text: plural(count, "style", "styles") })])
    ]);
  }

  function openCategories(opener) {
    openSheet({
      title: "Categories", className: "csheet", opener: opener,
      build: function (api) {
        var women = catByName(WOMEN), men = catByName(MEN);
        var forTiles = [];
        if (women) forTiles.push(catTile(women, "shop.html?for=women"));
        if (men) forTiles.push(catTile(men, "shop.html?for=men"));
        if (forTiles.length) api.body.appendChild(el("section", { class: "group" }, [el("h3", { text: "Shop for" }), el("div", { class: "cat-tiles" }, forTiles)]));

        var tiles = CATEGORIES.filter(function (c) { return !isGenderCat(c); }).map(function (c) { return catTile(c, "shop.html?category=" + encodeURIComponent(c.slug)); });
        api.body.appendChild(el("section", { class: "group" }, [el("h3", { text: "Categories" }), el("div", { class: "cat-tiles" }, tiles)]));

        if (COLLECTIONS.length) {
          var items = COLLECTIONS.map(function (c) {
            var n = PRODUCTS.filter(function (p) { return (p.collections || []).indexOf(c.slug) !== -1; }).length;
            return el("li", null, [el("a", { href: "shop.html?collection=" + encodeURIComponent(c.slug), "data-nav": "true" }, [
              el("span", null, [c.name, el("small", { text: c.blurb })]),
              el("span", { class: "fine", text: plural(n, "style", "styles") })
            ])]);
          });
          api.body.appendChild(el("section", { class: "group" }, [el("h3", { text: "Collections" }), el("ul", { class: "collection-list" }, items)]));
        }
        api.body.addEventListener("click", function (e) {
          var a = e.target.closest && e.target.closest("a[data-nav]");
          if (!a || !shopApi) return;
          e.preventDefault();
          shopApi.apply(new URL(a.href, window.location.href).searchParams);
          api.close();
        });
      }
    });
  }

  function openSaved(opener) {
    openSheet({
      title: "Saved items", className: "ssheet", opener: opener,
      build: function (api) {
        function draw() {
          api.body.textContent = "";
          api.foot.textContent = "";
          if (!saved.length) {
            api.foot.hidden = true;
            api.body.appendChild(el("div", { class: "empty" }, [
              el("span", { class: "arch", "aria-hidden": "true" }, [icon("heart")]),
              el("h3", { text: "Nothing saved yet" }),
              el("p", { text: "Tap the heart on any product to keep it here. Saved items stay on this phone only." }),
              el("a", { class: "btn btn-primary", href: "shop.html", text: "Browse products" })
            ]));
            return;
          }
          var rows = el("ul", { class: "rows" });
          saved.forEach(function (id) {
            var p = BY_ID[id];
            if (!p) return;
            var thumb = el("button", { class: "row-img", type: "button", "aria-label": "View details: " + p.name }, [el("img", { src: p.image, alt: "", width: "400", height: "500", loading: "lazy" })]);
            thumb.addEventListener("click", function () { openProduct(p, null); });
            var info = el("div", { class: "row-info" }, [el("b", { text: p.name }), el("span", { text: inr(p.price) }), el("small", { text: p.category })]);
            var rm = el("button", { class: "row-x", type: "button", "aria-label": "Remove from saved: " + p.name }, [icon("trash")]);
            rm.addEventListener("click", function () {
              toggleSaved(id);
              draw();
              var next = $(".row-x", api.dlg);
              (next || $(".sheet-x", api.dlg)).focus();
            });
            rows.appendChild(el("li", { class: "row" }, [thumb, info, rm]));
          });
          api.body.appendChild(rows);
          api.body.appendChild(el("p", { class: "fine", text: "Saved items are kept only in this browser on this device. Prices and availability can change on Meesho." }));
          api.foot.hidden = false;
          var clear = el("button", { class: "btn btn-ghost", type: "button", text: "Clear all" });
          clear.addEventListener("click", function () { saved.length = 0; persistSaved(); syncSaved(); toast("Saved list cleared"); draw(); $(".sheet-x", api.dlg).focus(); });
          var browse = el("a", { class: "btn btn-primary", href: "shop.html", text: "Keep browsing" });
          api.foot.appendChild(clear);
          api.foot.appendChild(browse);
        }
        draw();
      }
    });
  }

  function openMore(opener) {
    openSheet({
      title: "More", className: "msheet", opener: opener,
      build: function (api) {
        var links = [
          ["about.html", "About DealFinds India"],
          ["contact.html", "Contact us"],
          ["affiliate-disclosure.html", "Affiliate disclosure"],
          ["privacy-policy.html", "Privacy policy"],
          ["terms.html", "Terms & conditions"]
        ];
        api.body.appendChild(el("ul", { class: "linklist" }, links.map(function (l) {
          return el("li", null, [el("a", { href: l[0] }, [el("span", { text: l[1] }), icon("chevron-right")])]);
        })));
        api.body.appendChild(el("p", { class: "fine", text: "DealFinds India is an independent affiliate website. We don't sell products or take payments. Orders, delivery and returns are handled by Meesho. We may earn a commission when you buy through our links, at no extra cost to you." }));
      }
    });
  }

  function initOpeners() {
    $$("[data-open]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        if (!HAS_DIALOG) return; // link fallback (hrefs on the tabs) keeps working
        e.preventDefault();
        var kind = b.getAttribute("data-open");
        if (kind === "saved") openSaved(b);
        else if (kind === "categories") openCategories(b);
        else if (kind === "more") openMore(b);
      });
    });
  }

  /* ------------------------------------------------------------------ home page */
  function renderHome() {
    var rail = $("#dept-rail");
    if (rail) {
      rail.textContent = "";
      var items = [["All", "shop.html"], ["Women", "shop.html?for=women"], ["Men", "shop.html?for=men"]];
      CATEGORIES.forEach(function (c) { if (!isGenderCat(c)) items.push([c.name, "shop.html?category=" + encodeURIComponent(c.slug)]); });
      items.forEach(function (it) { rail.appendChild(el("li", null, [el("a", { href: it[1], text: it[0] })])); });
    }

    var banners = $("#banners");
    if (banners) {
      banners.textContent = "";
      COLLECTIONS.forEach(function (c, i) {
        var n = PRODUCTS.filter(function (p) { return (p.collections || []).indexOf(c.slug) !== -1; }).length;
        banners.appendChild(el("a", { class: "banner v" + ((i % 4) + 1), href: "shop.html?collection=" + encodeURIComponent(c.slug) }, [
          el("span", { class: "banner-copy" }, [
            el("span", null, [
              el("span", { class: "banner-kicker", text: "Collection" }),
              el("span", { class: "banner-title", text: c.name }),
              el("span", { class: "banner-sub", text: c.blurb })
            ]),
            el("span", { class: "banner-cta" }, ["Shop " + plural(n, "style", "styles"), icon("arrow-right", "icon-s")])
          ]),
          el("span", { class: "banner-art", "aria-hidden": "true" }, [el("img", { src: c.image, alt: "", width: "400", height: "500", loading: i === 0 ? "eager" : "lazy", decoding: "async" })])
        ]));
      });
      var dots = $("#banner-dots");
      if (dots) {
        dots.textContent = "";
        COLLECTIONS.forEach(function (c, i) { dots.appendChild(el("span", { class: i === 0 ? "on" : "" })); });
        var ticking = false;
        banners.addEventListener("scroll", function () {
          if (ticking) return;
          ticking = true;
          window.requestAnimationFrame(function () {
            ticking = false;
            var first = banners.firstElementChild;
            if (!first) return;
            var step = first.getBoundingClientRect().width + 12;
            var idx = Math.max(0, Math.min(COLLECTIONS.length - 1, Math.round(banners.scrollLeft / step)));
            $$("span", dots).forEach(function (d, i) { d.classList.toggle("on", i === idx); });
          });
        }, { passive: true });
      }
    }

    var cats = $("#cat-row");
    if (cats) {
      cats.textContent = "";
      var list = [];
      var w = catByName(WOMEN), m = catByName(MEN);
      if (w) list.push([w, "shop.html?for=women", "Women"]);
      if (m) list.push([m, "shop.html?for=men", "Men"]);
      CATEGORIES.forEach(function (c) { if (!isGenderCat(c)) list.push([c, "shop.html?category=" + encodeURIComponent(c.slug), c.name]); });
      list.forEach(function (it) {
        cats.appendChild(el("li", null, [el("a", { class: "cat", href: it[1] }, [
          el("span", { class: "cat-art" }, [el("img", { src: it[0].image, alt: "", width: "400", height: "500", loading: "lazy", decoding: "async" })]),
          el("span", { text: it[2] })
        ])]));
      });
    }

    var tiles = $("#price-tiles");
    if (tiles) {
      tiles.textContent = "";
      BANDS.forEach(function (b, i) {
        var n = PRODUCTS.filter(b.test).length;
        if (!n) return;
        tiles.appendChild(el("a", { class: "ptile t" + ((i % 5) + 1), href: "shop.html?price=" + b.id }, [
          el("small", { text: b.head }), el("strong", { text: b.top }), el("span", { text: plural(n, "style", "styles") })
        ]));
      });
    }

    var rails = {
      "new-arrivals": function () { return PRODUCTS.slice().sort(byNewest).slice(0, 8); },
      "best-deals": function () { return PRODUCTS.filter(function (p) { return p.bestDeal === true; }).sort(byPriceAsc).slice(0, 8); },
      "featured": function () { return PRODUCTS.filter(function (p) { return p.featured === true; }).sort(byNewest).slice(0, 8); }
    };
    $$("[data-render]").forEach(function (n) {
      var fn = rails[n.getAttribute("data-render")];
      if (!fn) return;
      var list = fn();
      var section = n.closest("section");
      if (!list.length && section) { section.hidden = true; return; }
      fillGrid(n, list);
    });

    $$("[data-total]").forEach(function (n) { n.textContent = plural(PRODUCTS.length, "style", "styles"); });
  }

  /* ------------------------------------------------------------------ shop page */
  var shopApi = null;

  function words(s) { return String(s).toLowerCase().replace(/['’]/g, "").split(/[^a-z0-9]+/).filter(Boolean); }
  var EXTRA_WORDS = {
    "T-Shirts": ["tshirt", "tshirts", "tee", "tees"],
    "Sarees": ["sari", "saris"],
    "Kurtis": ["kurti", "kurta", "kurtas"],
    "Jeans": ["denim"],
    "Accessories": ["accessory"]
  };
  var HAY = {};
  PRODUCTS.forEach(function (p) {
    var parts = [p.name, p.category].concat(p.alsoIn || []);
    (p.collections || []).forEach(function (s) { var c = colBySlug(s); if (c) parts.push(c.name); });
    var w = words(parts.join(" "));
    [p.category].concat(p.alsoIn || []).forEach(function (c) { (EXTRA_WORDS[c] || []).forEach(function (x) { w.push(x); }); });
    HAY[p.id] = w;
  });

  function initShop() {
    var grid = $("#grid"), countEl = $("#count"), pillsEl = $("#pills"), clearBtn = $("#clear"), moreBox = $("#more"), moreBtn = $("#more-btn"), moreNote = $("#more-note");
    var emptyBox = $("#empty"), chipsRow = $("#chips"), sortBtn = $("#sort-btn"), filterBtn = $("#filter-btn"), qInput = $("#q"), searchForm = $("#search-form");
    if (!grid || !countEl || !chipsRow) return;

    var state = { q: "", gender: "", category: "", collection: "", price: "", sort: "newest", shown: PAGE_SIZE };

    function readFrom(params) {
      state.q = (params.get("q") || "").trim().slice(0, 80);
      var g = params.get("for") || "";
      var cat = params.get("category") || "";
      if (cat === "womens-fashion") { g = g || "women"; cat = ""; }
      if (cat === "mens-fashion") { g = g || "men"; cat = ""; }
      state.gender = (g === "women" || g === "men") ? g : "";
      var c = catBySlug(cat);
      state.category = c && !isGenderCat(c) ? cat : "";
      var col = params.get("collection") || "";
      state.collection = colBySlug(col) ? col : "";
      var pr = params.get("price") || "";
      state.price = bandById(pr) ? pr : "";
      var s = params.get("sort") || "newest";
      state.sort = SORTS[s] ? s : "newest";
      state.shown = PAGE_SIZE;
    }
    function writeUrl() {
      var params = new URLSearchParams();
      if (state.q) params.set("q", state.q);
      if (state.gender) params.set("for", state.gender);
      if (state.category) params.set("category", state.category);
      if (state.collection) params.set("collection", state.collection);
      if (state.price) params.set("price", state.price);
      if (state.sort !== "newest") params.set("sort", state.sort);
      var qs = params.toString();
      try { window.history.replaceState(null, "", window.location.pathname + (qs ? "?" + qs : "") + window.location.hash); } catch (e) { /* file:// in some browsers */ }
    }

    function matches(p, skip) {
      skip = skip || "";
      if (skip !== "gender" && state.gender && !inCategory(p, state.gender === "women" ? WOMEN : MEN)) return false; // unisex items can be in both
      if (skip !== "category" && state.category) { var c = catBySlug(state.category); if (!c || !inCategory(p, c.name)) return false; }
      if (skip !== "collection" && state.collection && (p.collections || []).indexOf(state.collection) === -1) return false;
      if (skip !== "price" && state.price) { var b = bandById(state.price); if (b && !b.test(p)) return false; }
      if (state.q) {
        var tokens = words(state.q);
        var hay = HAY[p.id] || [];
        for (var i = 0; i < tokens.length; i++) {
          var t = tokens[i], hit = false;
          for (var j = 0; j < hay.length; j++) { if (hay[j].indexOf(t) === 0) { hit = true; break; } }
          if (!hit) return false;
        }
      }
      return true;
    }
    function filtered() { return PRODUCTS.filter(function (p) { return matches(p); }).sort(SORTS[state.sort].fn); }
    function activeCount() { return (state.gender ? 1 : 0) + (state.category ? 1 : 0) + (state.collection ? 1 : 0) + (state.price ? 1 : 0); }

    /* ---- quick chips ---- */
    var quick = [];
    function buildChips() {
      quick = [];
      [["women", "Women"], ["men", "Men"]].forEach(function (g) { quick.push({ key: "gender", val: g[0], label: g[1] }); });
      CATEGORIES.forEach(function (c) { if (!isGenderCat(c)) quick.push({ key: "category", val: c.slug, label: c.name }); });
      quick.forEach(function (q) {
        q.node = el("button", { class: "chip", type: "button", "aria-pressed": "false", text: q.label });
        q.node.addEventListener("click", function () {
          state[q.key] = state[q.key] === q.val ? "" : q.val;
          state.shown = PAGE_SIZE;
          render();
        });
        chipsRow.appendChild(q.node);
      });
    }
    function syncChips() {
      quick.forEach(function (q) { q.node.setAttribute("aria-pressed", state[q.key] === q.val ? "true" : "false"); });
      var n = activeCount();
      var badge = $(".badge", filterBtn);
      badge.textContent = String(n);
      badge.hidden = n === 0;
      filterBtn.setAttribute("aria-label", n ? "Filters, " + n + " active" : "Filters");
      $("span:first-of-type", sortBtn).textContent = state.sort === "newest" ? "Sort" : SORTS[state.sort].label;
      sortBtn.setAttribute("aria-label", "Sort: " + SORTS[state.sort].label);
    }

    /* ---- active pills ---- */
    function pillList() {
      var out = [];
      if (state.q) out.push({ label: "“" + state.q + "”", clear: function () { state.q = ""; qInput.value = ""; } });
      if (state.gender) out.push({ label: state.gender === "women" ? "Women" : "Men", clear: function () { state.gender = ""; } });
      if (state.category) { var c = catBySlug(state.category); out.push({ label: c ? c.name : state.category, clear: function () { state.category = ""; } }); }
      if (state.collection) { var col = colBySlug(state.collection); out.push({ label: col ? col.name : state.collection, clear: function () { state.collection = ""; } }); }
      if (state.price) { var b = bandById(state.price); out.push({ label: b ? b.label : state.price, clear: function () { state.price = ""; } }); }
      return out;
    }
    function drawPills() {
      $$(".pill", pillsEl).forEach(function (n) { n.remove(); });
      var list = pillList();
      list.forEach(function (it) {
        var b = el("button", { class: "pill", type: "button", "aria-label": "Remove filter: " + it.label }, [it.label, icon("close")]);
        b.addEventListener("click", function () { it.clear(); state.shown = PAGE_SIZE; render(); });
        pillsEl.insertBefore(b, clearBtn);
      });
      clearBtn.hidden = list.length < 2 && !(list.length === 1 && state.sort !== "newest");
    }

    function clearAll() {
      state.q = ""; state.gender = ""; state.category = ""; state.collection = ""; state.price = ""; state.sort = "newest"; state.shown = PAGE_SIZE;
      qInput.value = "";
      render();
    }

    /* ---- results ---- */
    function render(focusFirstNew) {
      var list = filtered();
      var from = grid.children.length;
      grid.textContent = "";
      var frag = document.createDocumentFragment();
      list.slice(0, state.shown).forEach(function (p, i) { frag.appendChild(createCard(p, { eager: i < 4 })); });
      grid.appendChild(frag);
      grid.hidden = list.length === 0;
      emptyBox.hidden = list.length !== 0;
      var label = plural(list.length, "style", "styles");
      countEl.textContent = state.q ? label + " for “" + state.q + "”" : label;
      var more = list.length > state.shown;
      moreBox.hidden = !more;
      if (more) moreNote.textContent = "Showing " + state.shown + " of " + list.length;
      syncChips();
      drawPills();
      writeUrl();
      if (focusFirstNew && from && grid.children[from]) { var b = $(".pc-open", grid.children[from]); if (b) b.focus({ preventScroll: false }); }
      if (sheetSync) sheetSync();
    }

    /* ---- sort sheet ---- */
    sortBtn.addEventListener("click", function () {
      openSheet({
        title: "Sort by", className: "ssort", opener: sortBtn,
        build: function (api) {
          var ul = el("ul", { class: "linklist" });
          Object.keys(SORTS).forEach(function (key) {
            var b = el("button", { type: "button", class: "chip chip-wide", "aria-pressed": state.sort === key ? "true" : "false" }, [SORTS[key].label, state.sort === key ? icon("check") : null]);
            b.addEventListener("click", function () { state.sort = key; state.shown = PAGE_SIZE; render(); api.close(); });
            ul.appendChild(el("li", null, [b]));
          });
          api.body.appendChild(ul);
        }
      });
    });

    /* ---- filter sheet ---- */
    var sheetSync = null;
    filterBtn.addEventListener("click", function () {
      openSheet({
        title: "Filters", className: "sfilter", opener: filterBtn,
        build: function (api) {
          var picks = [];
          function group(title, key, options) {
            var chips = options.map(function (o) {
              var b = el("button", { class: "chip", type: "button", "aria-pressed": "false", text: o.label });
              b.addEventListener("click", function () { state[key] = state[key] === o.val && o.val !== "" ? "" : o.val; state.shown = PAGE_SIZE; render(); });
              picks.push({ key: key, val: o.val, node: b });
              return b;
            });
            api.body.appendChild(el("section", { class: "group" }, [el("h3", { text: title }), el("div", { class: "chips", role: "group", "aria-label": title }, chips)]));
          }
          group("Shop for", "gender", [{ val: "", label: "All" }, { val: "women", label: "Women" }, { val: "men", label: "Men" }]);
          var catOpts = [{ val: "", label: "All" }];
          CATEGORIES.forEach(function (c) { if (!isGenderCat(c)) catOpts.push({ val: c.slug, label: c.name }); });
          group("Category", "category", catOpts);
          if (COLLECTIONS.length) {
            var colOpts = [{ val: "", label: "All" }];
            COLLECTIONS.forEach(function (c) { colOpts.push({ val: c.slug, label: c.name }); });
            group("Collection", "collection", colOpts);
          }
          var priceOpts = [{ val: "", label: "Any price" }];
          BANDS.forEach(function (b) { priceOpts.push({ val: b.id, label: b.label }); });
          group("Price", "price", priceOpts);

          var clear = el("button", { class: "btn btn-ghost", type: "button", text: "Clear all" });
          var show = el("button", { class: "btn btn-primary", type: "button" });
          clear.addEventListener("click", function () { state.gender = ""; state.category = ""; state.collection = ""; state.price = ""; state.shown = PAGE_SIZE; render(); });
          show.addEventListener("click", function () { api.close(); });
          api.foot.hidden = false;
          api.foot.appendChild(clear);
          api.foot.appendChild(show);

          sheetSync = function () {
            picks.forEach(function (pk) { pk.node.setAttribute("aria-pressed", state[pk.key] === pk.val ? "true" : "false"); });
            var n = filtered().length;
            show.textContent = n ? "Show " + plural(n, "style", "styles") : "No styles found";
            clear.disabled = activeCount() === 0;
          };
          api.dlg.addEventListener("close", function () { sheetSync = null; });
          sheetSync();
        }
      });
    });

    /* ---- search box (live on this page) ---- */
    var timer = 0;
    qInput.addEventListener("input", function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(function () { state.q = qInput.value.trim().slice(0, 80); state.shown = PAGE_SIZE; render(); }, 150);
    });
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      window.clearTimeout(timer);
      state.q = qInput.value.trim().slice(0, 80);
      state.shown = PAGE_SIZE;
      render();
      qInput.blur();
    });
    moreBtn.addEventListener("click", function () { state.shown += PAGE_SIZE; render(true); });
    clearBtn.addEventListener("click", clearAll);
    var emptyClear = $("#empty-clear");
    if (emptyClear) emptyClear.addEventListener("click", clearAll);

    shopApi = {
      apply: function (params) { readFrom(params); qInput.value = state.q; render(); window.scrollTo(0, 0); }
    };

    buildChips();
    readFrom(new URLSearchParams(window.location.search));
    qInput.value = state.q;
    render();
  }

  /* ------------------------------------------------------------------ forms & small bits */
  function configuredEmail() { return typeof CFG.contactEmail === "string" ? CFG.contactEmail.trim() : ""; }
  function emailIsPlaceholder() { return !configuredEmail() || /@example\.(com|org|net)$/i.test(configuredEmail()); }

  function initEmailSlots() {
    var email = configuredEmail();
    if (!email) return;
    $$("[data-email]").forEach(function (n) {
      n.textContent = email;
      if (n.tagName === "A") n.setAttribute("href", "mailto:" + email);
    });
  }
  function setStatus(form, msg, warn) {
    var s = $(".form-status", form);
    if (!s) return;
    s.textContent = msg;
    s.classList.toggle("is-warn", !!warn);
  }
  function initForms() {
    $$("form[data-form]").forEach(function (form) {
      var kind = form.getAttribute("data-form"); // "newsletter" | "contact"
      var action = kind === "newsletter" ? CFG.newsletterFormAction : CFG.contactFormAction;
      if (typeof action === "string" && /^https:\/\//i.test(action.trim())) {
        form.setAttribute("action", action.trim());
        form.setAttribute("method", "POST");
        return;
      }
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        var hp = form.querySelector("input[name='website']");
        if (hp && hp.value) return; // honeypot
        if (emailIsPlaceholder()) {
          setStatus(form, "Setup needed: add your real email address as contactEmail in js/site-config.js (or set a form endpoint) to receive messages.", true);
          return;
        }
        var to = configuredEmail();
        var subject, body;
        var data = new FormData(form);
        if (kind === "newsletter") {
          subject = "Newsletter sign-up";
          body = "Please add this address to the DealFinds India newsletter:\n\n" + (data.get("email") || "");
        } else {
          subject = "[DealFinds India] " + (data.get("topic") || "Message");
          body = (data.get("message") || "") + "\n\n-- \nName: " + (data.get("name") || "") + "\nEmail: " + (data.get("email") || "");
        }
        setStatus(form, "Your email app should open with the message ready to send. If nothing opens, write to " + to + ".", false);
        window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      });
    });
  }
  function initMisc() {
    $$("[data-year]").forEach(function (n) { n.textContent = String(new Date().getFullYear()); });
    $$("[data-sample-notice]").forEach(function (n) { n.hidden = !HAS_SAMPLES; });
    if (!$("#dfi-live")) document.body.appendChild(el("div", { id: "dfi-live", class: "sr-only", role: "status", "aria-live": "polite" }));
  }

  /* ------------------------------------------------------------------ public helpers */
  window.DFI = {
    products: PRODUCTS,
    categories: CATEGORIES,
    collections: COLLECTIONS,
    saved: function () { return saved.slice(); },
    discountPercent: discountPercent,
    hasSamples: HAS_SAMPLES,
    /** Console helper: lists every product and whether it still has a placeholder affiliate link. */
    audit: function () {
      var rows = PRODUCTS.map(function (p) {
        return { id: p.id, name: p.name, sample: p.sample === true, affiliateLink: isPlaceholder(p.affiliateUrl) ? "PLACEHOLDER" : "real link", discount: discountPercent(p) ? "verified" : "-" };
      });
      if (console.table) console.table(rows); else console.log(rows);
      var left = rows.filter(function (r) { return r.affiliateLink === "PLACEHOLDER"; }).length;
      console.log(left + " of " + rows.length + " products still use placeholder affiliate links.");
      return rows;
    }
  };

  /* ------------------------------------------------------------------ start */
  function start() {
    initMisc();
    initEmailSlots();
    initForms();
    initOpeners();
    syncSaved();
    if (PAGE === "home") renderHome();
    if (PAGE === "shop") initShop();
    if (WARNINGS.length && window.console && console.warn) console.warn("[DealFinds] Product data notes:\n- " + WARNINGS.join("\n- "));
    var placeholders = PRODUCTS.filter(function (p) { return isPlaceholder(p.affiliateUrl); }).length;
    if (placeholders && window.console && console.info) console.info("[DealFinds] " + placeholders + " of " + PRODUCTS.length + " products still use placeholder affiliate links. Run DFI.audit() for details.");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
