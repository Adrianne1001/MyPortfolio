# Copilot Instructions for MyPortfolio

## Project Overview
Static single-page portfolio website for Adrianne John Basuel, based on the "Ultra Profile" template from TemplateMo. No build tools or server required—open [index.html](../index.html) directly in a browser.

## Technology Stack
- **Bootstrap 3.x** – Grid system (`col-md-*`, `col-sm-*`), navbar, progress bars, responsive utilities
- **jQuery** – Required by all plugins; loaded from `js/jquery.js`
- **Isotope.js** – Portfolio filtering with `data-filter` attributes
- **jquery.nav.js** – One-page scroll navigation with active state highlighting
- **Font Awesome** – Icons via `fa fa-*` classes (e.g., `fa-dashboard`, `fa-github`)

## File Structure
| Path | Purpose |
|------|---------|
| `index.html` | Single-page entry point with all sections |
| `css/templatemo-style.css` | Custom styles (modify this, not Bootstrap) |
| `js/custom.js` | Isotope filter logic and navigation behavior |
| `images/` | Portfolio images (`portfolio-img*.jpg`) and backgrounds |

## Section IDs in index.html
Sections are navigated via anchor links. Each `<section>` has an `id` attribute:
- `#home` – Hero with title and CTA button
- `#work` – Three service cards with Font Awesome icons
- `#portfolio` – Filterable gallery (Isotope)
- `#resume` – Profile info + skill progress bars
- `#about` – Background section with personal description
- `#contact` – Contact form (static, no backend)

## Key Patterns

### Adding Portfolio Items
Add new items inside `.iso-box-wrapper` in [index.html](../index.html#L118). Use filter classes to control visibility:
```html
<div class="iso-box html wordpress col-md-3 col-sm-3 col-xs-12">
  <div class="portfolio-thumb">
    <img src="images/portfolio-img9.jpg" class="fluid-img" alt="Project Name">
    <div class="portfolio-overlay">
      <h3 class="portfolio-item-title">Project Name</h3>
      <p>Description text.</p>
    </div>
  </div>
</div>
```
Filter categories: `html`, `photoshop`, `wordpress`, `mobile` (defined in `.filter-wrapper`).

### Brand Color
Primary accent color is `#eb5424` (orange). Used throughout [templatemo-style.css](../css/templatemo-style.css) for:
- Navigation active/hover states
- Buttons (`.tm-view-more-btn`)
- Section headings (`.tm-work-h3`, `.tm-red-text`)
- Portfolio overlay background

### Skill Progress Bars
Located in `#resume` section. Update percentage in both `aria-valuenow` and inline `width`:
```html
<h4 class="tm-progress-label">Skill Name <small class="progress-percent-small">85%</small></h4>
<div class="progress tm-progress">
  <div class="progress-bar progress-bar-danger" role="progressbar" 
       aria-valuenow="85" aria-valuemin="0" aria-valuemax="100" style="width: 85%;"></div>
</div>
```

### Adding New Sections
1. Create a `<section id="newsection">` block
2. Add navigation link in `.main-navigation` with matching `href="#newsection"`
3. Apply `smoothScroll` class for animated scrolling

## Development Notes
- **No build step** – Edit files directly and refresh browser
- **Contact form is non-functional** – Requires backend integration (e.g., Formspree, Netlify Forms) to work
- **Images** – Place new images in `images/` folder; use descriptive names
- **Responsive breakpoints** – Bootstrap 3 defaults (xs: <768px, sm: ≥768px, md: ≥992px, lg: ≥1200px)

## External Links
- Resume: Google Drive link in `#home` CTA button and `#resume` section
- Social: Facebook, LinkedIn, GitHub links in `#social` section
