# Hina — Shopify Designer Portfolio

A static portfolio site (plain HTML, CSS and vanilla JS). There's no build step, so you can upload the folder straight to Cloudflare Pages.

```
index.html        the whole one-page site
404.html          branded "page not found" page
favicon.svg       browser tab icon
_headers          optional Cloudflare caching & security headers
css/style.css     all styles (colors/fonts/spacing are variables at the top)
js/main.js        menu, before/after sliders, animations, contact form
images/           your screenshots and photos (see images/README.txt)
```

Preview locally: open `index.html` in a browser. To test the contact form, run a tiny server instead, e.g. `python3 -m http.server`, then visit http://localhost:8000.

---

## 1. Placeholders to replace

Search `index.html` for `[` to find every text placeholder.

### Must do before sharing
| What | Where |
|---|---|
| Email `[your-email@example.com]` | Contact links, footer social icons, JSON-LD |
| LinkedIn / Instagram / Facebook links `[https://…]` | Contact links, footer, JSON-LD `sameAs` |
| WhatsApp `[https://wa.me/15551234567]` (optional; delete the line if not used) | Contact links |
| Project points ("What wasn't working" / "What I changed") are **drafts**. Edit them to match each real project | Each `<article class="project">` |
| Results `[Result: e.g. +X% …]`. Use real numbers only, or remove them | Each project's Results box |
| Novie outcome `[Outcome: …]` | Novie project |
| Testimonials `[Client testimonial placeholder]`, `[Client name]`, `[Role, Brand name]`. Use real quotes only, or delete the section | Testimonials section |
| Bio `[Bio placeholder]` (both paragraphs) | About section |

### Details
| What | Where |
|---|---|
| Full name `Hina [Full Name]` | JSON-LD in `<head>` (also the `<title>`/footer if you want it) |
| "Shopify Partner" trust badge. It's commented out; **uncomment only if true** | Hero, `trust-line` |
| Reply time `[1 business day]` | Contact intro + success message in `js/main.js` |
| FAQ: `[X–Y weeks]`, time-zone overlap, audit contents/price, payment terms | FAQ section |
| `[$$]` price range | JSON-LD |

### Images (exact filenames, put in `/images`)
Until a file exists, a placehold.co placeholder appears automatically. Drop the real file in and it replaces the placeholder, with no HTML edits needed.

| File | Size |
|---|---|
| `hero-desktop.jpg` / `hero-mobile.jpg` | 1440×900 / 390×844 |
| `jennyjoy-before.jpg`, `jennyjoy-after.jpg` | 1440×900 |
| `jennyjoy-before-mobile.jpg`, `jennyjoy-after-mobile.jpg` | 390×844 |
| `subtle-before.jpg`, `subtle-after.jpg` (+ `-mobile` versions) | same as above |
| `novie-before.jpg`, `novie-after.jpg` (+ `-mobile` versions) | same as above |
| `hina.jpg` | 800×1000 portrait |
| `og-image.jpg` (link-preview image) | 1200×630 |

> If you'd rather not show a mobile view for a project, delete its `view-toggle` and the `view-panel--mobile` block.

---

## 2. Deploy free on Cloudflare Pages (Direct Upload)

1. **Sign up** at https://dash.cloudflare.com/sign-up (free plan; no domain needed).
2. In the dashboard sidebar, open **Workers & Pages**.
3. Click **Create** → choose the **Pages** tab → **Upload assets** (the option labelled "Use direct upload").
4. **Project name: `hina`**. This gives you `hina.pages.dev`. If the name is taken, Cloudflare will suggest a variant. In that case, update the canonical URL and `og:` URLs in `index.html` to match.
5. Click **Create project**, then **drag in the whole site folder** (the folder that contains `index.html`, *not* a parent folder) or a `.zip` of it.
6. Click **Deploy site**. After a few seconds it's live at **https://hina.pages.dev**.

**Redeploy after edits**
1. Edit the files on your computer.
2. Dashboard → **Workers & Pages** → **hina** → **Create deployment** (top right; may also read "Create new deployment").
3. Upload the folder again → **Save and Deploy**. The newest deployment becomes live; older ones stay in the list, so you can roll back.

Tip: after deploying, send yourself a test message through the contact form. FormSubmit emails hinamanzoor101@gmail.com an **Activate Form** link on the first submission. Click it once, then every message arrives normally (check Spam the first time).

**Contact form:** uses [FormSubmit](https://formsubmit.co), with no account needed. To change the receiving email, edit the form `action` in `index.html`. Optional: after activation, FormSubmit sends you a random alias string. Use `https://formsubmit.co/<alias>` as the action to hide your email from bots.

---

## 3. Before/after screenshot guide

**Recommended sizes**
- **Desktop:** 1440×900 (16:10). Capture at 1440 px wide, export the top 900 px.
- **Mobile:** 390×844 (iPhone 12–15 viewport). Export at 2× (780×1688) for sharpness if the file stays small.
- Export as **JPG, quality 75–80**, under ~250 KB each (use https://squoosh.app).

**How to capture consistent pairs**
1. Use Chrome DevTools device mode (`Cmd/Ctrl + Shift + M`), set an exact size (1440×900 or 390×844), then use the ⋮ menu → **Capture screenshot**. Use the same size for before and after.
2. Capture the **same page and scroll position** in both shots (e.g. homepage top, or the same product). The slider only works well when layouts line up.
3. **Grab the "before" now**, before you change anything. If the old site is gone, check the Wayback Machine (web.archive.org) or ask the client for old screenshots.
4. Close cookie banners, pop-ups and chat widgets, and use the same product/collection in both.
5. Use 100% browser zoom, a clean browser profile (no extensions showing), and wait for fonts and images to load fully.
6. For the hero, use your best "after" shot (desktop + matching mobile).
7. Name files exactly as listed above so they replace the placeholders automatically.

---

## Rebranding quickly
Open `css/style.css`. All colors, fonts, spacing and corner radii are CSS variables at the top (`--color-accent`, `--font-heading`, etc.). Change `--color-accent` and `--color-accent-dark` to switch from terracotta to sage or dusty rose. For a full switch, also search `style.css` for `A65232` and `166, 82, 50` (a checklist icon and a few soft shadows), and update `favicon.svg`.
