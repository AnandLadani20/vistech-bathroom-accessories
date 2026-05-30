# Vistech by Shree Om Steel - Bathroom Accessories Website

Production-ready luxury bathroom accessories company website built with HTML5, CSS3, JavaScript, jQuery, Bootstrap 5, Slick Slider, AOS, Lightbox, and JSON-driven products.

## Quick Start

**Products page works offline** — open `products.html` directly (double-click) or use a local server.

1. Open `products.html` in your browser — all **65 products** load from `assets/js/products-data.js` (no Python, no AJAX).
2. Optional local server:
   ```bash
   npx serve .
   ```
   Then visit `http://localhost:3000/products.html`

**Product detail pages:** `product-details.html?id=1` through `?id=65`

## Pages

| Page | File |
|------|------|
| Home | `index.html` |
| About | `about.html` |
| Products | `products.html` |
| Product Details | `product-details.html?id=1` |
| Catalogue | `catalogue.html` |
| Gallery | `gallery.html` |
| Contact | `contact.html` |
| Privacy | `privacy-policy.html` |
| Terms | `terms.html` |
| Sitemap | `sitemap.html` |
| 404 | `404.html` |

## Customize

- **Products**: Edit `assets/js/products-data.js` (catalog data) and `assets/json/products.json` (optional copy). No Python required at runtime.
- **Logo**: `assets/images/logo.png` (from `assets/logo/Vistech Logo.jpg`)
- **Brand colors**: Red `#e31e24`, black, white (from Vistech logo)
- **PDFs**: Replace files in `assets/pdf/` (company profile from your catalogue is already linked)
- **Contact**: Update phone, email, address in `contact.html` and footer
- **Domain**: Replace `https://www.omsteelbath.com` in meta tags and `sitemap.xml`

## Tech Stack

Bootstrap 5 · jQuery · Slick Carousel · AOS · Lightbox2 · jQuery Validate
