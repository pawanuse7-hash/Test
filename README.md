# DealFinds India

**Discover Fashion. Find Better Deals.**

A fast, premium-looking fashion affiliate website for Indian shoppers. Visitors browse
curated fashion picks and tap **View Deal** to open the product on **Meesho** in a new tab.

Built with plain **HTML, CSS and JavaScript**: no framework, no build step, no paid
APIs, no database. You can host it for free on GitHub Pages, Netlify, Cloudflare Pages or
any ordinary web host.

> **Important: the products in this repository are samples.**
> All 28 products use original illustrations (not photos of real listings), example
> prices, and **placeholder affiliate links** that only open Meesho's home page. Nothing
> earns commission until you replace them with your own links. See
> [Go live checklist](#go-live-checklist).

---

## What's included

| Area | Details |
| --- | --- |
| Pages | Home, Shop, About Us, Contact Us, Privacy Policy, Affiliate Disclosure, Terms & Conditions, custom 404 |
| Home | Hero banner, trending collections, new arrivals, best deals, popular categories, featured products, newsletter, footer |
| Categories | Women's Fashion, Men's Fashion, Ethnic Wear, Western Wear, Kurtis, Sarees, Shirts, T-Shirts, Jeans, Accessories |
| Product card | Image, name, price in ₹, original price *(only when verified)*, discount label *(only when verified)*, category, **View Deal** button |
| Shop page | Search by name, category filter, sort by price (low→high, high→low) and newest, responsive grid, "Show more" |
| Quick view | Tap a product picture for a pop-up with a **Buy Now** button |
| Affiliate links | One link per product, opens in a new tab with `rel="sponsored nofollow noopener noreferrer"` |
| Mobile | Mobile-first layout, slide-down menu, large tap targets, tested on Android phone sizes (320 to 412 px wide) |
| SEO | Unique title and description per page, Open Graph and Twitter tags, canonical URLs, JSON-LD, `sitemap.xml`, `robots.txt`, semantic HTML |
| Accessibility | Skip link, keyboard-friendly menu and dialog, visible focus rings, `prefers-reduced-motion` support |

### Honesty rules built into the code

- **No fake reviews or ratings.** The site has no review or rating feature.
- **No fake discounts.** A discount label and "was" price appear **only** when a product has
  `discountVerified: true`. Without it, `originalPrice` is ignored.
- **No invented affiliate links.** Every link is either your real link or a clearly marked
  placeholder (`…#REPLACE-WITH-YOUR-AFFILIATE-LINK-…`).
- **Sample products are labelled.** Anything with `sample: true` shows a **Sample** badge and a
  notice in the quick-view pop-up.
- **No fake login, cart or payment.** Purchases happen on Meesho.
- **Original branding.** Nothing is copied or scraped from Meesho.

---

## Folder structure

```
.
├── index.html                  Home page
├── shop.html                   Search, filters and sorting
├── about.html                  About Us
├── contact.html                Contact Us
├── privacy-policy.html         Privacy Policy
├── affiliate-disclosure.html   Affiliate Disclosure
├── terms.html                  Terms & Conditions
├── 404.html                    "Page not found" (used automatically by GitHub Pages)
├── sitemap.xml                 For search engines
├── robots.txt                  For search engines
├── README.md                   This file
├── css/
│   └── style.css               All styling (design tokens at the top)
├── js/
│   ├── site-config.js          ← your email address and optional form endpoints
│   ├── products-data.js        ← THE product list, categories and collections
│   ├── app.js                  Menu, product cards, quick view, home sections, forms
│   └── shop.js                 Shop page: search, filters, sorting
└── assets/
    ├── favicon.svg, logo-mark.svg, apple-touch-icon.png, og-image.png
    ├── fonts/                  Self-hosted DM Sans and Playfair Display (SIL OFL licence files included)
    └── img/
        ├── hero-rail.svg
        ├── categories/         One picture per category
        ├── collections/        One picture per homepage collection
        └── products/           dfi-001.svg … dfi-028.svg (sample illustrations)
```

The two files you will edit most are marked with **←**.

---

## Preview the website

Pick whichever is easiest.

**1. Double-click `index.html`.**
It opens in your browser and works as-is. (You may see harmless font-preload warnings in the
developer console; the fonts still load.)

**2. Run a tiny local server (recommended).** This behaves exactly like a real host.

```bash
# Python (already installed on most computers)
python3 -m http.server 8000
# then open http://localhost:8000

# or Node.js
npx serve .
```

**3. Preview on your Android phone.** Run the server above, make sure the phone is on the same
Wi-Fi, and open `http://<your-computer's-IP-address>:8000` in Chrome. Or deploy to GitHub
Pages (below) and open the live address on the phone.

---

## Publish for free on GitHub Pages

1. Push this repository to GitHub (the files must be in the repository root, which they are).
2. Open the repository on GitHub → **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose branch
   **`main`** and folder **`/ (root)`**, then **Save**.
4. After a minute or two the site is live at
   **`https://pawanuse7-hash.github.io/Test/`**.

### Using a different address or a custom domain

The canonical links, Open Graph tags, `sitemap.xml`, `robots.txt` and `404.html` use the full
address `https://pawanuse7-hash.github.io/Test/`. (`404.html` has to use full addresses because
GitHub Pages shows it for missing pages at any folder depth.)

If your site will live somewhere else, replace that address everywhere with your own, in one
command (macOS and Linux; on Windows use a find-and-replace across the folder in your editor):

```bash
grep -rl 'https://pawanuse7-hash.github.io/Test/' . --include='*.html' --include='*.xml' --include='*.txt' \
  | xargs sed -i 's#https://pawanuse7-hash.github.io/Test/#https://www.your-domain.in/#g'
```

On macOS, use `sed -i ''` instead of `sed -i`. Keep the trailing `/`. After publishing,
submit `sitemap.xml` in [Google Search Console](https://search.google.com/search-console).

---

## Add, edit or remove products

Everything lives in **`js/products-data.js`**. Save the file and refresh the page. No build
step is needed.

### Add a product

1. Put the product picture in `assets/img/products/` (portrait 4:5, around 800×1000 px, works
   best; JPG, PNG, WebP or SVG).
2. Copy any block in `DFI_PRODUCTS`, paste it at the end, and change the values:

```js
{
  id: "dfi-029",                         // unique, never reused
  name: "Navy Cotton Kurti",
  category: "Kurtis",                    // must match a name in DFI_CATEGORIES exactly
  alsoIn: ["Women's Fashion", "Ethnic Wear"],   // optional extra categories
  price: 599,                            // plain number, in rupees
  image: "assets/img/products/dfi-029.jpg",
  description: "Straight-cut cotton kurti with three-quarter sleeves.",
  affiliateUrl: "PASTE-YOUR-OWN-MEESHO-AFFILIATE-LINK-HERE",   // must start with https://
  addedOn: "2026-11-03",                 // YYYY-MM-DD, drives "Newest" and New Arrivals
  featured: true                         // optional: show in Featured Products
  // bestDeal: true,                     // optional: show in Best Deals
  // collections: ["festive-edit"],      // optional: homepage collections
  // sample: true                        // delete this line for real products
}
```

### Edit or remove a product

Change any value in its block, or delete the whole block from `{` to `},`. The Shop page,
home page sections, category counts and "new arrivals" all update by themselves.

### Show a discount (only when it is real)

```js
price: 549,
originalPrice: 899,
discountVerified: true     // set ONLY after you have checked the offer on Meesho yourself
```

The site then shows the "was" price and the percentage, which it calculates from your two
numbers. If `discountVerified` is missing or `false`, no discount is shown at all.

### Categories and collections

`DFI_CATEGORIES` and `DFI_COLLECTIONS`, in the same file, define the category tiles, filter chips
and homepage collections. To add a category, add a block there and use its exact `name` in your
products.

### Check your data

Open the browser console (press **F12**) and run:

```js
DFI.audit()
```

It lists every product and whether it still has a placeholder affiliate link. Mistakes such as a
duplicate id, a missing price or an unknown category are reported in the console as well, and
the site keeps working while skipping the faulty product.

---

## Affiliate links

- Each product has its **own** `affiliateUrl`. **View Deal** (on cards) and **Buy Now** (in the
  quick-view pop-up) both open that link in a new tab.
- Generate links from your Meesho affiliate account and paste them in as given. Do not
  guess or hand-edit them.
- A link containing `REPLACE-WITH-YOUR-AFFILIATE-LINK` is a placeholder. It opens Meesho's home
  page and **earns nothing**.
- If a product has no valid `https://` link, its button is disabled and reads *Link coming soon*.
- Read the terms of Meesho's affiliate programme before launch, including what you may do with
  product images, prices and descriptions. That is why the sample products use original
  illustrations rather than pictures taken from Meesho.

---

## Contact and newsletter forms

Edit **`js/site-config.js`**:

```js
contactEmail: "you@your-domain.in",   // shown on the Contact and legal pages
contactFormAction: "",                // optional form-service URL (e.g. Formspree, Getform)
newsletterFormAction: ""              // optional form-service URL
```

- With the endpoints left empty, a visitor's form opens **their own email app** with the message
  ready to send to `contactEmail`. This needs no server.
- Until you set a real `contactEmail`, submitting a form shows a "Setup needed" notice instead of
  pretending the message was sent.
- To receive messages directly, create a free form on a form service and paste its URL into
  `contactFormAction` and/or `newsletterFormAction`.

---

## Go live checklist

- [ ] Replace every placeholder affiliate link with your real Meesho affiliate link (`DFI.audit()` shows what is left).
- [ ] Replace sample products and illustrations with your real picks. Remove `sample: true` from each.
- [ ] Set your real `contactEmail` in `js/site-config.js`.
- [ ] Read the legal pages (Privacy Policy, Terms, Affiliate Disclosure) and adjust them to how you actually operate. They are general templates, **not legal advice**, so have a professional check them if you can.
- [ ] Update the site address everywhere if you are not using `https://pawanuse7-hash.github.io/Test/` (see above).
- [ ] Update `lastmod` dates in `sitemap.xml` when you make big changes.
- [ ] Open the live site on a real Android phone and tap through the menu, search, a filter and a View Deal button.

---

## How it was tested

An automated browser run (Chromium via Playwright) covered about 1,200 checks across a Pixel 7
(412 px), a 360 px and a 320 px Android phone, a 768 px tablet and a desktop screen:

- all 8 pages load with no console errors, no failed requests and no broken images;
- no sideways scrolling on any page at any of those widths;
- every internal link and `#anchor` resolves;
- the mobile menu opens, closes (Esc, outside tap, link tap) and navigates;
- search, all 10 category filters, the three sort orders, "Show more", reset and shareable
  `?category=…&sort=…` links behave correctly and chip counts match the results;
- every product's View Deal link equals its own `affiliateUrl`, opens in a new tab and carries
  the `sponsored` / `noopener` attributes;
- no discount badge appears while no discount is verified;
- the quick-view pop-up, its Buy Now link and the Sample notice work.

---

## Credits

- Fonts: [DM Sans](https://fonts.google.com/specimen/DM+Sans) and
  [Playfair Display](https://fonts.google.com/specimen/Playfair+Display), self-hosted under the
  SIL Open Font License (licence texts are in `assets/fonts/`).
- All logos and product pictures are original illustrations created for this project.
- DealFinds India is an independent website. It is not owned by, endorsed by or affiliated with
  Meesho. Meesho is a trademark of its owner.
