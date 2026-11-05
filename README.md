# DealFinds India: app-style redesign (preview branch)

**Discover Fashion. Find Better Deals.**

> **This is the `redesign-app-style` branch.** It holds a new, app-style design of the site for
> side-by-side comparison. The `main` branch (your live website) is not touched by this branch.
> Nothing here goes live until you merge it into `main`.

A mobile-first fashion shopping experience for Indian shoppers, built with plain **HTML, CSS and
JavaScript** (no framework, no build step, no paid services). Visitors browse women's and men's
fashion in a phone-app layout and tap **View on Meesho** to open the product on Meesho in a new tab.

> **The products are still samples.** All 28 products use original illustrations (not photos of real
> listings), example prices and **placeholder affiliate links** that only open Meesho's home page.
> Nothing earns commission until you replace them with your own links. See
> [Go live checklist](#go-live-checklist).

---

## What's new in this design

| Area | What you get |
| --- | --- |
| App bar | DealFinds India logo, always-visible search box, Saved (heart) button with a count |
| Bottom tab bar (phones) | Home, Categories, Shop, Saved, More, like a shopping app. On computers it becomes a top menu |
| Home | Department rail, 4 swipeable collection banners, category arches, "shop by budget" tiles, New arrivals and Best deals rails, Featured picks, how it works, newsletter |
| Shop | Live search, quick chips (Women, Men, categories), **Sort** sheet, **Filters** sheet (shop for, category, collection, price), active-filter pills, "Show more" |
| Product sheet | Tap any product: large picture, price, sample notice, "You may also like", and a **sticky View on Meesho button** with a Save heart |
| Saved items | Heart any product. The list is kept only in the visitor's own browser (never sent anywhere) |
| Branding | Original indigo, madder-red and marigold palette, arch shapes and a hanger-in-an-arch logo. No Meesho logo, name styling or colours are used |
| Installable | "Add to Home screen" on Android Chrome (web app manifest and icons included) |

Your **product list, categories, collections and email settings are reused unchanged**
(`js/products-data.js` and `js/site-config.js`), and every page keeps its original address and its
original wording (About, Contact, Privacy Policy, Terms, Affiliate Disclosure).

### Honesty rules (kept from the original site)

- **No fake reviews or ratings.** There is no review or rating feature.
- **No fake discounts.** A "% off" label and "was" price appear **only** when a product has
  `discountVerified: true`. Otherwise `originalPrice` is ignored.
- **No invented affiliate links.** Every link is either your real link or a clearly marked
  placeholder (`…#REPLACE-WITH-YOUR-AFFILIATE-LINK-…`). Placeholder buttons say
  **"Open Meesho (sample)"** and the sheet explains that they only open Meesho's home page.
- **Sample products are labelled** with a **Sample** badge on every card and a notice in the sheet.
- **Affiliate disclosure is always visible** in the strip under the app bar and in the footer.
- **No login, cart or payment.** Purchases happen on Meesho.

---

## Folder structure

```
.
├── index.html                  Home
├── shop.html                   Search, filters, sorting
├── about.html                  About Us
├── contact.html                Contact Us
├── privacy-policy.html         Privacy Policy
├── affiliate-disclosure.html   Affiliate Disclosure
├── terms.html                  Terms & Conditions
├── 404.html                    "Page not found" (self-contained, works on any host)
├── manifest.webmanifest        "Add to Home screen" details (NEW)
├── sitemap.xml, robots.txt     Unchanged (page addresses did not change)
├── css/
│   ├── dfi-app.css             ALL styling for this design (NEW)
│   └── style.css               Old design's stylesheet, no longer used by these pages
├── js/
│   ├── site-config.js          ← your email address and optional form endpoints (unchanged)
│   ├── products-data.js        ← THE product list, categories, collections (unchanged)
│   ├── dfi-app.js              All behaviour for this design (NEW)
│   └── app.js, shop.js         Old design's scripts, no longer used by these pages
└── assets/
    ├── brand/                  New logo, favicon, app icons, share image (NEW)
    ├── fonts/                  Self-hosted DM Sans and Playfair Display (SIL OFL)
    ├── img/                    Product, category and collection illustrations (unchanged)
    └── favicon.svg, logo-mark.svg, apple-touch-icon.png, og-image.png   Old branding, no longer used
```

Nothing from `main` was deleted. The old design's files are left in place so that you can compare;
after you decide, the unused files can be removed in a separate clean-up.

The two files you will edit most are marked with **←**.

---

## Preview the redesign

### On your Android phone

The branch is **not** shown on your live GitHub Pages address (GitHub Pages serves only one branch,
`main`). Do **not** change the Pages source to this branch: that would replace your live site.
Pick one of these instead:

**A. Cloudflare Pages (free, gives a separate test address for this branch)**

1. Sign in at <https://dash.cloudflare.com> → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**, and choose the `pawanuse7-hash/Test` repository.
2. Production branch: `main`. Build command: leave empty. Output directory: `/` (or leave empty).
3. **Save and Deploy.** Cloudflare also builds every other branch as a *preview*. Open the
   project's **Deployments** tab and the **Preview** entry for `redesign-app-style`; its address looks like
   `https://redesign-app-style.<your-project>.pages.dev`.
4. Open that address in Chrome on your phone.

**B. Netlify (free, one branch only)**

1. <https://app.netlify.com> → **Add new site** → **Import an existing project** → GitHub →
   `pawanuse7-hash/Test`.
2. Set **Branch to deploy** to `redesign-app-style`. Build command empty, publish directory `.`.
3. Open the `*.netlify.app` address on your phone.

**C. Straight on the phone, no account (Termux)**

1. Download the branch as a ZIP: on GitHub choose the `redesign-app-style` branch → **Code** →
   **Download ZIP**, and unzip it on the phone.
2. In Termux: `pkg install python`, then `cd` into the unzipped folder and run
   `python -m http.server 8000`.
3. Open `http://localhost:8000` in Chrome on the same phone.

**D. From a computer on the same Wi-Fi**

1. Download and unzip the branch (as above), open a terminal in the folder and run
   `python3 -m http.server 8000`.
2. On the phone (same Wi-Fi) open `http://<your-computer's-IP-address>:8000` in Chrome.

Once it opens, use Chrome's menu → **Add to Home screen** to see it as an app icon.

### On a computer

Open `index.html` by double-clicking it, or run `python3 -m http.server 8000` and open
<http://localhost:8000>.

---

## Add or edit products

Exactly as before: edit **`js/products-data.js`**. Copy a product block, give it a new `id`, fill in
the fields, put the picture in `assets/img/products/`, and paste **your own** Meesho affiliate link
into `affiliateUrl`. The file's header explains every field. Remove `sample: true` (and the
placeholder link) for real products.

Optional flags: `featured: true` (Featured picks), `bestDeal: true` (Best deals rail),
`collections: ["festive-edit"]` (collection banners and filter).
In your browser's console, run `DFI.audit()` to list products that still have placeholder links.

---

## Go live checklist

- [ ] Add your real affiliate links (and check your affiliate network's rules on how links may be used).
- [ ] Use pictures you have the right to use. Do not copy photos from Meesho or other sites without permission.
- [ ] Remove `sample: true` from real products. Only set `discountVerified: true` after checking the discount yourself.
- [ ] Set your real address as `contactEmail` in `js/site-config.js`.
- [ ] Read the About, Privacy, Terms and Affiliate Disclosure pages and make sure they describe what you really do.

### Replacing the live site with this design (when you approve it)

Only do this after you have reviewed the preview.

1. On GitHub open a **Pull request** from `redesign-app-style` into `main` and review the changes.
2. **Merge** it. GitHub Pages rebuilds `main` and your live site switches to the new design within a minute or two.
3. To go back, revert the merge commit on GitHub (the old design is still in the history).

---

## Notes

- **Fonts** are self-hosted, so the site makes no requests to Google Fonts and shares nothing with them.
- **Saved items** are stored in the visitor's own browser (`localStorage`) and never leave their device.
- **GitHub Pages terms.** GitHub Pages is for static sites and is not meant to run an online business or take payments. This site only links out and never handles payments.
- **Address.** Canonical, sharing and sitemap addresses assume `https://pawanuse7-hash.github.io/Test/`. If you host elsewhere, replace that address in the HTML files, `sitemap.xml` and `robots.txt`.
- **Tested** with automated browser checks at Android phone sizes (360 and 412 px wide), a tablet and a desktop: search, filters, sorting, sheets, saved items, keyboard use, placeholder links, text contrast and tap-target size.
