# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Tourberry is a static HTML/CSS website for a Russian-language travel agency based in Yakutsk. No build tools, no frameworks, no package manager — all files are served as-is.

## Previewing the site

Open any HTML file directly in a browser, or serve locally:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## File structure

- `index.html` — main landing page (hero, tours, about, contact form)
- `china.html` — China tours destination page
- `visa.html` — visa services page
- `privacy.html` — privacy policy
- `style.css` — shared stylesheet imported by all pages
- Page-specific styles live in `<style>` blocks inside each HTML file's `<head>`

## CSS architecture

`style.css` defines the global design system. Each page imports it and adds page-specific styles inline. Key variables:

```css
--navy: #0e2240      /* primary brand color */
--orange: #ff5500    /* CTAs and accents */
--teal: #3dc9bd      /* secondary accent */
```

**Legacy aliases** still referenced in older markup:

```css
--gold      → same as --orange (#e04a00)
--gold-light → same as --teal (#3dc9bd)
--gold-btn  → same as --orange (#ff5500)
```

Use `--orange` and `--teal` for new code; keep legacy names when editing existing sections that reference them to avoid churn.

**Fonts**: Montserrat for body/UI, Playfair Display (serif, often italic) for headings.

**Breakpoints**: 900px (footer reflow), 768px (hamburger nav, single-column forms), 480px (button sizing).

## Content language

All user-facing content is in Russian. Keep new copy in Russian.

## Deployment

The repo has a remote at `origin/main`. Push to deploy (no CI pipeline).
