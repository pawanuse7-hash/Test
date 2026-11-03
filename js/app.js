/*
 * DealFinds India – shared behaviour
 * Mobile menu, product cards, quick-view window, homepage sections, forms.
 * Plain JavaScript, no libraries. Loaded on every page (after site-config.js and products-data.js).
 */
(function () {
  "use strict";

  var CFG = window.DFI_CONFIG || {};
  var CATEGORIES = Array.isArray(window.DFI_CATEGORIES) ? window.DFI_CATEGORIES : [];
  var COLLECTIONS = Array.isArray(window.DFI_COLLECTIONS) ? window.DFI_COLLECTIONS : [];
  var PLACEHOLDER_RE = /REPLACE-WITH-YOUR-AFFILIATE-LINK/i;
  var AFFILIATE_REL = "sponsored nofollow noopener noreferrer";

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
  function icon(name, extraClass) {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "icon" + (extraClass ? " " + extraClass : ""));
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

  function isHttpUrl(u) { return typeof u === "string" && /^https?:\/\/[^\s]+$/i.test(u.trim()); }
  function isPlaceholder(u) { return !isHttpUrl(u) || PLACEHOLDER_RE.test(u); }

  /* A discount is only ever shown when the owner has marked it as verified. */
  function discountPercent(p) {
    if (p.discountVerified !== true) return 0;
    if (!(p.originalPrice > p.price)) return 0;
    var pct = Math.round((1 - p.price / p.originalPrice) * 100);
    return pct >= 1 ? pct : 0;
  }

  function catSlug(name) {
    for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].name === name) return CATEGORIES[i].slug;
    return null;
  }

  /* ------------------------------------------------------------------ data */
  var WARNINGS = [];
  function loadProducts() {
    var raw = Array.isArray(window.DFI_PRODUCTS) ? window.DFI_PRODUCTS : [];
    var seen = {};
    var knownCats = {};
    CATEGORIES.forEach(function (c) { knownCats[c.name] = true; });
    var out = [];
    raw.forEach(function (p, i) {
      var label = "Product #" + (i + 1) + (p && p.id ? " (" + p.id + ")" : "");
      if (!p || typeof p !== "object") { WARNINGS.push(label + ": not an object, skipped."); return; }
      if (!p.id || typeof p.id !== "string") { WARNINGS.push(label + ": missing id, skipped."); return; }
      if (seen[p.id]) { WARNINGS.push(label + ": duplicate id, skipped."); return; }
      if (!p.name) { WARNINGS.push(label + ": missing name, skipped."); return; }
      if (!(typeof p.price === "number" && isFinite(p.price) && p.price > 0)) { WARNINGS.push(label + ": price must be a number above 0, skipped."); return; }
      if (!p.image) { WARNINGS.push(label + ": missing image, skipped."); return; }
      if (!knownCats[p.category]) WARNINGS.push(label + ': category "' + p.category + '" is not listed in DFI_CATEGORIES.');
      (p.alsoIn || []).forEach(function (c) { if (!knownCats[c]) WARNINGS.push(label + ': alsoIn "' + c + '" is not listed in DFI_CATEGORIES.'); });
      if (!isHttpUrl(p.affiliateUrl)) WARNINGS.push(label + ": affiliateUrl is missing or not an https:// link; its button will be disabled.");
      if (p.originalPrice && p.discountVerified !== true) WARNINGS.push(label + ": originalPrice is ignored until discountVerified is true.");
      seen[p.id] = true;
      out.push(p);
    });
    return out;
  }
  var PRODUCTS = loadProducts();
  var HAS_SAMPLES = PRODUCTS.some(function (p) { return p.sample === true; });

  function inCategory(p, name) { return p.category === name || (Array.isArray(p.alsoIn) && p.alsoIn.indexOf(name) !== -1); }
  function byNewest(a, b) { return (b.addedOn || "").localeCompare(a.addedOn || "") || a.id.localeCompare(b.id); }
  function byPriceAsc(a, b) { return a.price - b.price || a.id.localeCompare(b.id); }

  /* ------------------------------------------------------------------ quick view */
  var HAS_DIALOG = typeof window.HTMLDialogElement === "function";
  var qv = null;
  function buildQuickView() {
    var closeBtn = el("button", { class: "qv-close", type: "button", "aria-label": "Close quick view" }, [icon("close")]);
    var img = el("img", { alt: "", width: "400", height: "500", decoding: "async" });
    var sampleBadge = el("span", { class: "badge badge-sample", text: "Sample" });
    var media = el("div", { class: "qv-media" }, [img, sampleBadge]);
    var cat = el("span", { class: "card-cat" });
    var title = el("h2", { id: "qv-title" });
    var price = el("div", { class: "price" });
    var desc = el("p", { class: "desc" });
    var note = el("p", { class: "qv-note" });
    var buy = el("a", { class: "btn btn-primary btn-block", target: "_blank", rel: AFFILIATE_REL }, []);
    var back = el("button", { class: "btn btn-ghost btn-block", type: "button", text: "Keep browsing" });
    var info = el("div", { class: "qv-info" }, [cat, title, price, desc, note, el("div", { class: "qv-actions" }, [buy, back])]);
    var dlg = el("dialog", { class: "qv", "aria-labelledby": "qv-title" }, [closeBtn, el("div", { class: "qv-grid" }, [media, info])]);
    document.body.appendChild(dlg);

    closeBtn.addEventListener("click", function () { dlg.close(); });
    back.addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", function () { document.documentElement.classList.remove("no-scroll"); });
    dlg.addEventListener("cancel", function () { document.documentElement.classList.remove("no-scroll"); });
    return { dlg: dlg, img: img, sampleBadge: sampleBadge, cat: cat, title: title, price: price, desc: desc, note: note, buy: buy };
  }

  function fillPrice(container, p) {
    container.textContent = "";
    container.appendChild(el("span", { class: "now", text: inr(p.price) }));
    var pct = discountPercent(p);
    if (pct) {
      container.appendChild(el("s", { class: "was" }, [el("span", { class: "sr-only", text: "Original price " }), inr(p.originalPrice)]));
      container.appendChild(el("span", { class: "off", text: pct + "% off" }));
    }
  }

  function setBuyLink(a, p, labelText) {
    a.textContent = "";
    a.appendChild(document.createTextNode(labelText + " "));
    var url = isHttpUrl(p.affiliateUrl) ? p.affiliateUrl.trim() : null;
    if (url) {
      a.setAttribute("href", url);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", AFFILIATE_REL);
      a.removeAttribute("aria-disabled");
      a.setAttribute("aria-label", labelText + ": " + p.name + " on Meesho (opens in a new tab)");
      a.appendChild(icon("external", "icon-nudge"));
    } else {
      a.removeAttribute("href");
      a.removeAttribute("target");
      a.setAttribute("aria-disabled", "true");
      a.setAttribute("role", "link");
      a.removeAttribute("aria-label");
      a.textContent = "Link coming soon";
    }
  }

  function openQuickView(p, trigger) {
    if (!HAS_DIALOG) return;
    if (!qv) qv = buildQuickView();
    qv.img.src = p.image;
    qv.img.alt = p.sample ? p.name + " (sample illustration)" : p.name;
    qv.sampleBadge.hidden = p.sample !== true;
    qv.cat.textContent = p.category;
    qv.title.textContent = p.name;
    fillPrice(qv.price, p);
    qv.desc.textContent = p.description || "";
    qv.desc.hidden = !p.description;
    var placeholder = isPlaceholder(p.affiliateUrl);
    if (p.sample === true || placeholder) {
      qv.note.setAttribute("data-sample", "true");
      qv.note.textContent = "Sample listing: the picture, price and link are placeholders until a real Meesho affiliate link is added. The button below only opens Meesho's home page.";
    } else {
      qv.note.removeAttribute("data-sample");
      qv.note.textContent = "You'll go to Meesho in a new tab. The price and availability on Meesho may differ from what's shown here, so check the final price before you buy. We may earn a commission at no extra cost to you.";
    }
    setBuyLink(qv.buy, p, "Buy Now");
    document.documentElement.classList.add("no-scroll");
    qv.dlg.showModal();
    qv.dlg.scrollTop = 0;
  }

  /* ------------------------------------------------------------------ product card */
  function createCard(p) {
    var pct = discountPercent(p);
    var altText = p.sample ? p.name + " (sample illustration)" : p.name;
    var img = el("img", { src: p.image, alt: altText, width: "400", height: "500", loading: "lazy", decoding: "async" });
    var mediaKids = [img];
    if (p.sample === true) mediaKids.push(el("span", { class: "badge badge-sample", text: "Sample" }));
    if (pct) mediaKids.push(el("span", { class: "badge badge-off", text: pct + "% off" }));

    var media;
    if (HAS_DIALOG) {
      mediaKids.push(el("span", { class: "quick", "aria-hidden": "true" }, [icon("eye"), "Quick view"]));
      media = el("button", { class: "card-media", type: "button", "aria-label": "Quick view: " + p.name }, mediaKids);
      media.addEventListener("click", function () { openQuickView(p, media); });
    } else {
      media = el("div", { class: "card-media" }, mediaKids);
    }

    var price = el("div", { class: "price" });
    fillPrice(price, p);

    var cta = el("a", { class: "btn btn-primary btn-sm btn-block" });
    setBuyLink(cta, p, "View Deal");

    return el("li", { class: "product" }, [
      el("article", { class: "card", "data-id": p.id, "data-placeholder": isPlaceholder(p.affiliateUrl) ? "true" : "false" }, [
        media,
        el("div", { class: "card-body" }, [
          el("span", { class: "card-cat", text: p.category }),
          el("h3", { class: "card-title", text: p.name }),
          price,
          cta
        ])
      ])
    ]);
  }

  function renderGrid(container, list, emptyText) {
    container.textContent = "";
    if (!list.length) {
      container.appendChild(el("li", { class: "noscript-msg", text: emptyText || "Products will appear here soon." }));
      return;
    }
    var frag = document.createDocumentFragment();
    list.forEach(function (p) { frag.appendChild(createCard(p)); });
    container.appendChild(frag);
  }

  /* ------------------------------------------------------------------ homepage sections */
  function renderHome() {
    var limit = function (node, d) { var n = parseInt(node.getAttribute("data-limit"), 10); return n > 0 ? n : d; };

    $$("[data-render='new-arrivals']").forEach(function (n) {
      renderGrid(n, PRODUCTS.slice().sort(byNewest).slice(0, limit(n, 8)));
    });
    $$("[data-render='best-deals']").forEach(function (n) {
      renderGrid(n, PRODUCTS.filter(function (p) { return p.bestDeal === true; }).sort(byPriceAsc).slice(0, limit(n, 8)),
        "Best deals will appear here once products are marked with bestDeal: true.");
    });
    $$("[data-render='featured']").forEach(function (n) {
      renderGrid(n, PRODUCTS.filter(function (p) { return p.featured === true; }).sort(byNewest).slice(0, limit(n, 8)),
        "Featured products will appear here once products are marked with featured: true.");
    });

    $$("[data-render='collections']").forEach(function (n) {
      n.textContent = "";
      COLLECTIONS.forEach(function (c) {
        n.appendChild(el("a", { class: "collection", href: "shop.html?collection=" + encodeURIComponent(c.slug) }, [
          el("img", { src: c.image, alt: "", width: "400", height: "500", loading: "lazy", decoding: "async" }),
          el("div", { class: "collection-body" }, [
            el("h3", { text: c.name }),
            el("p", { text: c.blurb }),
            el("span", { class: "go" }, ["Explore", icon("arrow-right")])
          ])
        ]));
      });
    });

    $$("[data-render='categories']").forEach(function (n) {
      n.textContent = "";
      CATEGORIES.forEach(function (c) {
        var count = PRODUCTS.filter(function (p) { return inCategory(p, c.name); }).length;
        n.appendChild(el("li", null, [
          el("a", { class: "cat-tile", href: "shop.html?category=" + encodeURIComponent(c.slug) }, [
            el("div", { class: "cat-img" }, [el("img", { src: c.image, alt: "", width: "400", height: "500", loading: "lazy", decoding: "async" })]),
            el("div", { class: "cat-info" }, [
              el("div", null, [el("h3", { text: c.name }), el("small", { text: count + (count === 1 ? " style" : " styles") })]),
              icon("arrow-right")
            ])
          ])
        ]));
      });
    });
  }

  /* ------------------------------------------------------------------ navigation */
  function initNav() {
    var toggle = $(".nav-toggle");
    var nav = $("#site-nav");
    var header = $(".site-header");
    if (header) {
      var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    toggle.addEventListener("click", function () { setOpen(toggle.getAttribute("aria-expanded") !== "true"); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setOpen(false); toggle.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (toggle.getAttribute("aria-expanded") === "true" && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
    var mq = window.matchMedia("(min-width: 900px)");
    var onMq = function () { if (mq.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener("change", onMq); else if (mq.addListener) mq.addListener(onMq);
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
        // Real endpoint configured: let the browser submit the form normally.
        form.setAttribute("action", action.trim());
        form.setAttribute("method", "POST");
        return;
      }

      // Fallback with no server: compose an email in the visitor's mail app.
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        // Honeypot field: real people never fill it in.
        var hp = form.querySelector("input[name='website']");
        if (hp && hp.value) return;
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
  }

  /* ------------------------------------------------------------------ public helpers */
  window.DFI = {
    products: PRODUCTS,
    categories: CATEGORIES,
    collections: COLLECTIONS,
    createCard: createCard,
    renderGrid: renderGrid,
    inCategory: inCategory,
    catSlug: catSlug,
    byNewest: byNewest,
    byPriceAsc: byPriceAsc,
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
    initNav();
    initEmailSlots();
    initForms();
    initMisc();
    renderHome();
    if (WARNINGS.length && window.console && console.warn) {
      console.warn("[DealFinds] Product data notes:\n- " + WARNINGS.join("\n- "));
    }
    var placeholders = PRODUCTS.filter(function (p) { return isPlaceholder(p.affiliateUrl); }).length;
    if (placeholders && window.console && console.info) {
      console.info("[DealFinds] " + placeholders + " of " + PRODUCTS.length + " products still use placeholder affiliate links. Run DFI.audit() for details.");
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
