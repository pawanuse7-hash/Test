/*
 * DealFinds India – Shop page: search, category filter, sorting, "show more".
 * Needs js/app.js (window.DFI). Filters are kept in the URL, so a filtered view can be shared:
 *   shop.html?q=kurti&category=kurtis&sort=price-asc
 */
(function () {
  "use strict";
  if (!window.DFI) return;

  var D = window.DFI;
  var PAGE_SIZE = 12;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v === false || v === null || v === undefined) return;
      if (k === "class") n.className = v; else if (k === "text") n.textContent = v; else n.setAttribute(k, v === true ? "" : v);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function icon(name) {
    var ns = "http://www.w3.org/2000/svg";
    var s = document.createElementNS(ns, "svg"); s.setAttribute("class", "icon"); s.setAttribute("aria-hidden", "true"); s.setAttribute("focusable", "false");
    var u = document.createElementNS(ns, "use"); u.setAttribute("href", "#i-" + name); s.appendChild(u); return s;
  }

  var grid = $("#product-grid");
  var searchInput = $("#search");
  var sortSelect = $("#sort");
  var chipsBox = $("#category-chips");
  var countEl = $("#result-count");
  var emptyBox = $("#empty-state");
  var moreWrap = $("#load-more-wrap");
  var moreBtn = $("#load-more");
  var activeBox = $("#active-filters");
  var form = $("#shop-form");
  if (!grid || !searchInput || !sortSelect || !chipsBox) return;

  var SORTS = { "newest": D.byNewest, "price-asc": D.byPriceAsc, "price-desc": function (a, b) { return b.price - a.price || a.id.localeCompare(b.id); } };
  var state = { q: "", category: "", collection: "", sort: "newest", shown: PAGE_SIZE };

  /* ---------- URL <-> state ---------- */
  function readUrl() {
    var params = new URLSearchParams(window.location.search);
    state.q = (params.get("q") || "").trim().slice(0, 80);
    var cat = params.get("category") || "";
    state.category = D.categories.some(function (c) { return c.slug === cat; }) ? cat : "";
    var col = params.get("collection") || "";
    state.collection = D.collections.some(function (c) { return c.slug === col; }) ? col : "";
    var sort = params.get("sort") || "newest";
    state.sort = SORTS[sort] ? sort : "newest";
  }
  function writeUrl() {
    var params = new URLSearchParams();
    if (state.q) params.set("q", state.q);
    if (state.category) params.set("category", state.category);
    if (state.collection) params.set("collection", state.collection);
    if (state.sort !== "newest") params.set("sort", state.sort);
    var qs = params.toString();
    var url = window.location.pathname + (qs ? "?" + qs : "") + window.location.hash;
    try { window.history.replaceState(null, "", url); } catch (e) { /* file:// in some browsers */ }
  }

  /* ---------- filtering ---------- */
  function categoryName(slug) {
    for (var i = 0; i < D.categories.length; i++) if (D.categories[i].slug === slug) return D.categories[i].name;
    return "";
  }
  function haystack(p) { return (p.name + " " + p.category + " " + (p.alsoIn || []).join(" ")).toLowerCase(); }
  function normalizeQuery(q) { return q.toLowerCase().replace(/['’]/g, "").split(/\s+/).filter(Boolean); }

  function filtered() {
    var tokens = normalizeQuery(state.q);
    var catName = state.category ? categoryName(state.category) : "";
    var list = D.products.filter(function (p) {
      if (catName && !D.inCategory(p, catName)) return false;
      if (state.collection && (p.collections || []).indexOf(state.collection) === -1) return false;
      if (tokens.length) {
        var h = haystack(p).replace(/['’]/g, "");
        for (var i = 0; i < tokens.length; i++) if (h.indexOf(tokens[i]) === -1) return false;
      }
      return true;
    });
    return list.sort(SORTS[state.sort]);
  }

  /* ---------- rendering ---------- */
  function renderChips() {
    chipsBox.textContent = "";
    function chip(label, slug, count) {
      var pressed = state.category === slug;
      var b = el("button", { class: "chip", type: "button", "data-slug": slug, "aria-pressed": pressed ? "true" : "false" }, [label, el("span", { class: "n", text: String(count) })]);
      b.addEventListener("click", function () {
        state.category = pressed ? "" : slug;
        state.shown = PAGE_SIZE;
        update(true);
      });
      return b;
    }
    chipsBox.appendChild(chip("All", "", D.products.length));
    D.categories.forEach(function (c) {
      var n = D.products.filter(function (p) { return D.inCategory(p, c.name); }).length;
      chipsBox.appendChild(chip(c.name, c.slug, n));
    });
  }

  function renderActive() {
    activeBox.textContent = "";
    var any = false;
    function tag(label, onClear) {
      any = true;
      var b = el("button", { type: "button", "aria-label": "Remove filter: " + label }, [icon("close")]);
      b.addEventListener("click", onClear);
      activeBox.appendChild(el("span", { class: "filter-tag" }, [label, b]));
    }
    if (state.collection) {
      var col = D.collections.filter(function (c) { return c.slug === state.collection; })[0];
      tag("Collection: " + (col ? col.name : state.collection), function () { state.collection = ""; state.shown = PAGE_SIZE; update(true); });
    }
    if (state.q) tag("Search: “" + state.q + "”", function () { state.q = ""; searchInput.value = ""; state.shown = PAGE_SIZE; update(true); });
    activeBox.hidden = !any;
  }

  function update(syncUrl) {
    var list = filtered();
    var visible = list.slice(0, state.shown);

    if (syncUrl) writeUrl();
    // Re-rendering the chips would drop keyboard focus, so remember which chip had it.
    var focused = document.activeElement;
    var focusedSlug = focused && focused.classList && focused.classList.contains("chip") ? focused.getAttribute("data-slug") : null;
    renderChips();
    if (focusedSlug !== null) {
      var again = chipsBox.querySelector('.chip[data-slug="' + focusedSlug + '"]');
      if (again) again.focus({ preventScroll: true });
    }
    renderActive();

    grid.textContent = "";
    var frag = document.createDocumentFragment();
    visible.forEach(function (p) { frag.appendChild(D.createCard(p)); });
    grid.appendChild(frag);

    var total = D.products.length;
    if (!list.length) {
      countEl.textContent = "No products match your filters.";
    } else if (list.length === total) {
      countEl.textContent = "Showing " + visible.length + " of " + total + " products";
    } else {
      countEl.textContent = "Showing " + visible.length + " of " + list.length + " matching products (" + total + " in total)";
    }
    emptyBox.hidden = list.length > 0;
    grid.hidden = list.length === 0;

    var remaining = list.length - visible.length;
    moreWrap.hidden = remaining <= 0;
    if (remaining > 0) moreBtn.textContent = "Show more (" + remaining + " left)";
    sortSelect.value = state.sort;
  }

  function resetAll() {
    state.q = ""; state.category = ""; state.collection = ""; state.sort = "newest"; state.shown = PAGE_SIZE;
    searchInput.value = "";
    update(true);
  }

  /* ---------- events ---------- */
  var timer = null;
  searchInput.addEventListener("input", function () {
    window.clearTimeout(timer);
    timer = window.setTimeout(function () {
      state.q = searchInput.value.trim().slice(0, 80);
      state.shown = PAGE_SIZE;
      update(true);
    }, 140);
  });
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    window.clearTimeout(timer);
    state.q = searchInput.value.trim().slice(0, 80);
    state.shown = PAGE_SIZE;
    update(true);
    searchInput.blur();
  });
  sortSelect.addEventListener("change", function () { state.sort = SORTS[sortSelect.value] ? sortSelect.value : "newest"; state.shown = PAGE_SIZE; update(true); });
  moreBtn.addEventListener("click", function () {
    var before = grid.children.length;
    state.shown += PAGE_SIZE;
    update(false);
    var first = grid.children[before];
    var focusTarget = first && first.querySelector("button, a");
    if (focusTarget) focusTarget.focus({ preventScroll: false });
  });
  $("#reset-filters") && $("#reset-filters").addEventListener("click", resetAll);
  $("#clear-all") && $("#clear-all").addEventListener("click", resetAll);

  /* ---------- start ---------- */
  readUrl();
  searchInput.value = state.q;
  update(false);
  if (window.location.hash === "#search") searchInput.focus();
})();
