/*
 * DealFinds India – product data
 * ==================================================================
 * This is the ONLY file you need to edit to add, change or remove products.
 * Save the file and refresh the page to see your changes.
 *
 * HOW TO ADD A PRODUCT
 *   1. Copy any product block inside DFI_PRODUCTS (from "{" to "},").
 *   2. Give it a new, unique id.
 *   3. Fill in the fields below. Put your image in assets/img/products/.
 *   4. Paste YOUR Meesho affiliate link into affiliateUrl.
 *   5. Delete the line  sample: true  (and the placeholder link) once the product is real.
 *
 * FIELDS
 *   id               Unique text id, e.g. "dfi-029". Never reuse an id.
 *   name             Product name shown on the card.
 *   category         ONE of the category names listed in DFI_CATEGORIES below (exact spelling).
 *   alsoIn           Optional. Extra category names where the product should also appear,
 *                    e.g. ["Women's Fashion", "Ethnic Wear"].
 *   price            Selling price in rupees, as a plain number (549, not "₹549").
 *   originalPrice    Optional. The higher "was" price. It is shown ONLY when discountVerified is true.
 *   discountVerified Set to true ONLY after you have personally checked that the original price
 *                    and the discount are real on Meesho. Without it, no discount is displayed.
 *   image            Path to the product image (SVG, JPG, PNG or WebP). 4:5 portrait works best.
 *   description      One or two plain sentences (shown in the quick-view window).
 *   affiliateUrl     Your own Meesho affiliate link for THIS product. It must start with https://
 *   addedOn          Date added, as "YYYY-MM-DD". Used for "Newest" sorting and New Arrivals.
 *   featured         Optional. true = appears in "Featured Products" on the homepage.
 *   bestDeal         Optional. true = appears in "Best Deals" on the homepage.
 *   collections      Optional. Collection slugs from DFI_COLLECTIONS, e.g. ["festive-edit"].
 *   sample           true = clearly labelled "Sample" on the site. Remove it for real products.
 *
 * AFFILIATE LINKS
 *   Links containing REPLACE-WITH-YOUR-AFFILIATE-LINK are PLACEHOLDERS. They only open the
 *   Meesho home page and earn nothing. Replace each one with the real affiliate link you
 *   generated in your Meesho affiliate account. Never guess or edit a link by hand.
 *   Open the browser console and run  DFI.audit()  to list every product that still has one.
 *
 * ABOUT THE SAMPLE PRODUCTS BELOW
 *   Names, prices, images and links are illustrative placeholders only. The pictures are
 *   original illustrations drawn for this project, not photographs of real listings.
 */

window.DFI_CATEGORIES = [
  { slug: "womens-fashion", name: "Women's Fashion", blurb: "Everyday and occasion wear for women", image: "assets/img/categories/womens-fashion.svg" },
  { slug: "mens-fashion",   name: "Men's Fashion",   blurb: "Smart, casual and festive menswear",   image: "assets/img/categories/mens-fashion.svg" },
  { slug: "ethnic-wear",    name: "Ethnic Wear",     blurb: "Festive and traditional Indian styles", image: "assets/img/categories/ethnic-wear.svg" },
  { slug: "western-wear",   name: "Western Wear",    blurb: "Dresses, jackets and modern basics",    image: "assets/img/categories/western-wear.svg" },
  { slug: "kurtis",         name: "Kurtis",          blurb: "Printed, embroidered and everyday kurtis", image: "assets/img/categories/kurtis.svg" },
  { slug: "sarees",         name: "Sarees",          blurb: "Festive, casual and party sarees",      image: "assets/img/categories/sarees.svg" },
  { slug: "shirts",         name: "Shirts",          blurb: "Formal, casual and striped shirts",     image: "assets/img/categories/shirts.svg" },
  { slug: "t-shirts",       name: "T-Shirts",        blurb: "Tees, stripes and graphic prints",      image: "assets/img/categories/t-shirts.svg" },
  { slug: "jeans",          name: "Jeans",           blurb: "Slim, straight and relaxed fits",       image: "assets/img/categories/jeans.svg" },
  { slug: "accessories",    name: "Accessories",     blurb: "Bags, jewellery, watches and more",     image: "assets/img/categories/accessories.svg" }
];

window.DFI_COLLECTIONS = [
  { slug: "festive-edit",    name: "Festive Edit",    blurb: "Sarees, kurtis and kurtas for celebrations", image: "assets/img/collections/festive-edit.svg" },
  { slug: "everyday-basics", name: "Everyday Basics", blurb: "Easy tees and jeans for daily wear",         image: "assets/img/collections/everyday-basics.svg" },
  { slug: "office-ready",    name: "Office Ready",    blurb: "Smart shirts and clean denim",               image: "assets/img/collections/office-ready.svg" },
  { slug: "weekend-casuals", name: "Weekend Casuals", blurb: "Dresses, jackets and relaxed layers",        image: "assets/img/collections/weekend-casuals.svg" }
];

window.DFI_PRODUCTS = [
  {
    id: "dfi-001",
    name: "Teal Floral Print Kurti",
    category: "Kurtis",
    alsoIn: ["Women's Fashion", "Ethnic Wear"],
    price: 549,
    image: "assets/img/products/dfi-001.svg",
    description: "Straight-cut kurti with a small floral print, V-neck, three-quarter sleeves and a contrast hem border.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-001",
    addedOn: "2026-10-28",
    featured: true,
    collections: ["festive-edit"],
    sample: true
  },
  {
    id: "dfi-002",
    name: "Mustard Straight-Fit Kurti",
    category: "Kurtis",
    alsoIn: ["Women's Fashion", "Ethnic Wear"],
    price: 449,
    image: "assets/img/products/dfi-002.svg",
    description: "Plain mustard kurti with a contrast yoke and hem border. Easy to pair with leggings or palazzos.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-002",
    addedOn: "2026-10-20",
    bestDeal: true,
    sample: true
  },
  {
    id: "dfi-003",
    name: "Indigo Block Print Kurti",
    category: "Kurtis",
    alsoIn: ["Women's Fashion", "Ethnic Wear"],
    price: 629,
    image: "assets/img/products/dfi-003.svg",
    description: "Indigo kurti with a block-print inspired pattern and a gold-toned yoke.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-003",
    addedOn: "2026-10-30",
    featured: true,
    collections: ["festive-edit"],
    sample: true
  },
  {
    id: "dfi-004",
    name: "Ivory Kurti with Rose Trim",
    category: "Kurtis",
    alsoIn: ["Women's Fashion", "Ethnic Wear"],
    price: 699,
    image: "assets/img/products/dfi-004.svg",
    description: "Soft ivory kurti with rose-pink trims and a button placket.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-004",
    addedOn: "2026-10-12",
    sample: true
  },
  {
    id: "dfi-005",
    name: "Maroon Zari Border Festive Saree",
    category: "Sarees",
    alsoIn: ["Women's Fashion", "Ethnic Wear"],
    price: 1099,
    image: "assets/img/products/dfi-005.svg",
    description: "Deep maroon saree with a golden zari-style border and contrast blouse piece.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-005",
    addedOn: "2026-10-29",
    featured: true,
    collections: ["festive-edit"],
    sample: true
  },
  {
    id: "dfi-006",
    name: "Teal Polka Dot Saree with Red Border",
    category: "Sarees",
    alsoIn: ["Women's Fashion", "Ethnic Wear"],
    price: 799,
    image: "assets/img/products/dfi-006.svg",
    description: "Teal saree with a polka-dot pattern, a red border and a coral blouse piece.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-006",
    addedOn: "2026-10-18",
    bestDeal: true,
    sample: true
  },
  {
    id: "dfi-007",
    name: "Peach Floral Print Saree",
    category: "Sarees",
    alsoIn: ["Women's Fashion", "Ethnic Wear"],
    price: 749,
    image: "assets/img/products/dfi-007.svg",
    description: "Light peach saree with a floral print and a deep plum border.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-007",
    addedOn: "2026-10-25",
    sample: true
  },
  {
    id: "dfi-008",
    name: "Royal Blue Festive Saree",
    category: "Sarees",
    alsoIn: ["Women's Fashion", "Ethnic Wear"],
    price: 1249,
    image: "assets/img/products/dfi-008.svg",
    description: "Royal blue saree with a gold border and a matching gold blouse piece.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-008",
    addedOn: "2026-10-31",
    featured: true,
    collections: ["festive-edit"],
    sample: true
  },
  {
    id: "dfi-009",
    name: "Sky Blue Classic Shirt",
    category: "Shirts",
    alsoIn: ["Men's Fashion"],
    price: 499,
    image: "assets/img/products/dfi-009.svg",
    description: "Full-sleeve shirt in sky blue with a chest pocket and a regular collar.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-009",
    addedOn: "2026-10-22",
    featured: true,
    collections: ["office-ready"],
    sample: true
  },
  {
    id: "dfi-010",
    name: "Navy Pinstripe Shirt",
    category: "Shirts",
    alsoIn: ["Men's Fashion"],
    price: 549,
    image: "assets/img/products/dfi-010.svg",
    description: "Navy shirt with fine vertical stripes, a pocket and a button-down placket.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-010",
    addedOn: "2026-10-27",
    bestDeal: true,
    collections: ["office-ready"],
    sample: true
  },
  {
    id: "dfi-011",
    name: "Sand Beige Casual Shirt",
    category: "Shirts",
    alsoIn: ["Men's Fashion"],
    price: 479,
    image: "assets/img/products/dfi-011.svg",
    description: "Relaxed full-sleeve shirt in a warm sand shade for weekends.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-011",
    addedOn: "2026-10-15",
    collections: ["weekend-casuals"],
    sample: true
  },
  {
    id: "dfi-012",
    name: "White Crew-Neck T-Shirt with Wave Print",
    category: "T-Shirts",
    alsoIn: ["Men's Fashion", "Women's Fashion", "Western Wear"],
    price: 299,
    image: "assets/img/products/dfi-012.svg",
    description: "Short-sleeve crew-neck tee in white with a simple wave graphic on the chest.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-012",
    addedOn: "2026-10-26",
    bestDeal: true,
    collections: ["everyday-basics"],
    sample: true
  },
  {
    id: "dfi-013",
    name: "Navy Striped T-Shirt",
    category: "T-Shirts",
    alsoIn: ["Men's Fashion", "Western Wear"],
    price: 349,
    image: "assets/img/products/dfi-013.svg",
    description: "Classic navy and grey striped tee with a ribbed crew neck.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-013",
    addedOn: "2026-10-30",
    featured: true,
    collections: ["everyday-basics"],
    sample: true
  },
  {
    id: "dfi-014",
    name: "Rust Sun Graphic T-Shirt",
    category: "T-Shirts",
    alsoIn: ["Men's Fashion", "Women's Fashion", "Western Wear"],
    price: 329,
    image: "assets/img/products/dfi-014.svg",
    description: "Rust-coloured tee with a bold sun graphic on the front.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-014",
    addedOn: "2026-11-01",
    featured: true,
    collections: ["everyday-basics"],
    sample: true
  },
  {
    id: "dfi-015",
    name: "Forest Green Basic T-Shirt",
    category: "T-Shirts",
    alsoIn: ["Men's Fashion", "Western Wear"],
    price: 249,
    image: "assets/img/products/dfi-015.svg",
    description: "Plain forest green tee, an easy everyday layer.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-015",
    addedOn: "2026-10-10",
    bestDeal: true,
    collections: ["everyday-basics"],
    sample: true
  },
  {
    id: "dfi-016",
    name: "Slim-Fit Dark Blue Jeans",
    category: "Jeans",
    alsoIn: ["Men's Fashion", "Western Wear"],
    price: 799,
    image: "assets/img/products/dfi-016.svg",
    description: "Dark blue slim-fit jeans with a five-pocket design and contrast stitching.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-016",
    addedOn: "2026-10-24",
    featured: true,
    collections: ["everyday-basics", "office-ready"],
    sample: true
  },
  {
    id: "dfi-017",
    name: "Mid-Blue Straight-Leg Jeans",
    category: "Jeans",
    alsoIn: ["Women's Fashion", "Western Wear"],
    price: 849,
    image: "assets/img/products/dfi-017.svg",
    description: "Mid-blue straight-leg jeans with a comfortable high waist.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-017",
    addedOn: "2026-10-29",
    sample: true
  },
  {
    id: "dfi-018",
    name: "Light-Wash Relaxed Jeans",
    category: "Jeans",
    alsoIn: ["Men's Fashion", "Western Wear"],
    price: 899,
    image: "assets/img/products/dfi-018.svg",
    description: "Light-wash relaxed-fit jeans for a laid-back look.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-018",
    addedOn: "2026-10-14",
    collections: ["weekend-casuals"],
    sample: true
  },
  {
    id: "dfi-019",
    name: "Red Floral Print Midi Dress",
    category: "Western Wear",
    alsoIn: ["Women's Fashion"],
    price: 699,
    image: "assets/img/products/dfi-019.svg",
    description: "Sleeveless midi dress with thin straps, a fitted bodice and a flared floral skirt.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-019",
    addedOn: "2026-10-31",
    featured: true,
    collections: ["weekend-casuals"],
    sample: true
  },
  {
    id: "dfi-020",
    name: "Teal Polka Dot Dress with Puff Sleeves",
    category: "Western Wear",
    alsoIn: ["Women's Fashion"],
    price: 749,
    image: "assets/img/products/dfi-020.svg",
    description: "Teal polka-dot dress with puff sleeves and a gathered skirt.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-020",
    addedOn: "2026-10-21",
    collections: ["weekend-casuals"],
    sample: true
  },
  {
    id: "dfi-021",
    name: "Blush Pink Flared Dress",
    category: "Western Wear",
    alsoIn: ["Women's Fashion"],
    price: 599,
    image: "assets/img/products/dfi-021.svg",
    description: "Blush pink strappy dress with a pleated, flared skirt.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-021",
    addedOn: "2026-10-17",
    bestDeal: true,
    sample: true
  },
  {
    id: "dfi-022",
    name: "Olive Green Bomber Jacket",
    category: "Western Wear",
    alsoIn: ["Men's Fashion"],
    price: 1199,
    image: "assets/img/products/dfi-022.svg",
    description: "Zip-front bomber jacket in olive green with ribbed cuffs, collar and hem.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-022",
    addedOn: "2026-11-01",
    featured: true,
    collections: ["weekend-casuals"],
    sample: true
  },
  {
    id: "dfi-023",
    name: "Ivory Festive Kurta for Men",
    category: "Ethnic Wear",
    alsoIn: ["Men's Fashion"],
    price: 899,
    image: "assets/img/products/dfi-023.svg",
    description: "Ivory kurta with a mandarin collar, a gold button placket and side slits.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-023",
    addedOn: "2026-10-19",
    collections: ["festive-edit"],
    sample: true
  },
  {
    id: "dfi-024",
    name: "Teal Kurta for Men",
    category: "Ethnic Wear",
    alsoIn: ["Men's Fashion"],
    price: 849,
    image: "assets/img/products/dfi-024.svg",
    description: "Teal full-sleeve kurta with a mandarin collar and a button placket.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-024",
    addedOn: "2026-10-23",
    collections: ["festive-edit"],
    sample: true
  },
  {
    id: "dfi-025",
    name: "Tan Canvas Tote Bag",
    category: "Accessories",
    alsoIn: ["Women's Fashion"],
    price: 399,
    image: "assets/img/products/dfi-025.svg",
    description: "Roomy tote bag in tan with a front pocket and sturdy shoulder handles.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-025",
    addedOn: "2026-10-28",
    featured: true,
    bestDeal: true,
    collections: ["weekend-casuals"],
    sample: true
  },
  {
    id: "dfi-026",
    name: "Black Square Frame Sunglasses",
    category: "Accessories",
    alsoIn: ["Men's Fashion", "Women's Fashion"],
    price: 249,
    image: "assets/img/products/dfi-026.svg",
    description: "Bold square-frame sunglasses with smoke-blue lenses.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-026",
    addedOn: "2026-10-16",
    collections: ["weekend-casuals"],
    sample: true
  },
  {
    id: "dfi-027",
    name: "Gold-Tone Jhumka Earrings",
    category: "Accessories",
    alsoIn: ["Women's Fashion", "Ethnic Wear"],
    price: 199,
    image: "assets/img/products/dfi-027.svg",
    description: "Traditional dome-shaped jhumkas with red stones and pearl-style drops.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-027",
    addedOn: "2026-10-30",
    bestDeal: true,
    collections: ["festive-edit"],
    sample: true
  },
  {
    id: "dfi-028",
    name: "Brown Strap Analog Watch",
    category: "Accessories",
    alsoIn: ["Men's Fashion"],
    price: 599,
    image: "assets/img/products/dfi-028.svg",
    description: "Analog watch with a round gold-tone case, a cream dial and a brown strap.",
    affiliateUrl: "https://www.meesho.com/#REPLACE-WITH-YOUR-AFFILIATE-LINK-dfi-028",
    addedOn: "2026-10-13",
    sample: true
  }
];
