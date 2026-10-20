# General Cleaning Services — Phoenix, AZ

Conversion-focused marketing website for General Cleaning Services, a residential and
commercial cleaning company serving Phoenix, Arizona and the greater Valley.

Built with vanilla HTML, CSS and JavaScript — no build step, no dependencies.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Entry point — all page sections and both forms |
| `styles.css` | Design system, layout and responsive rules |
| `script.js` | Mobile nav, scroll reveal, form validation and submission |
| `favicon.svg` | Favicon placeholder |
| `robots.txt` / `sitemap.xml` | Basic SEO files |

## Page sections

1. **Top call bar + sticky header** — click-to-call phone number always visible
2. **Hero** — business name, tagline, trust points and the quote form above the fold
3. **Trust strip** — years in business, jobs completed, rating, quote turnaround
4. **Services** — recurring house cleaning, deep cleaning, move-in/move-out, office &
   commercial, post-construction, Airbnb turnovers
5. **Why us + how it works** — differentiators and the 4-step process
6. **Reviews** — customer testimonials with star ratings
7. **Service area** — cities, neighborhoods and common ZIP codes
8. **FAQ** — accessible `<details>` accordions
9. **CTA band** — call now / send a message
10. **Contact** — phone, email, office address, hours, and contact form
11. **Footer** + sticky mobile call/quote bar

## Forms

Both forms (**Quote request** in the hero and **Contact** in the contact section) post to
LeadrVision:

```
POST https://vision.leadrai.com/api/forms/494aa799bd78ef34c5334ae6c3aa64d8
```

- Each form keeps the `action` attribute so it works with JavaScript disabled.
- `script.js` intercepts submit and POSTs the same data as JSON to the same URL; a
  `{"ok": true}` response shows the inline "Thanks, your message was sent" confirmation.
- Hidden `_form` field names the form (`Quote request` / `Contact`).
- Hidden `_page` field is set to `window.location.href` on page load and included in the
  JSON body.
- Hidden `_gotcha` honeypot field blocks bots.
- A plain (non-JS) submission returns to the page with `?submitted=1`, which also renders
  the confirmation message.

## Local preview

Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Contact details used on the site

- Phone: (602) 555-0182
- Email: hello@generalcleaningservicesphx.com
- Office: 2201 N Central Ave, Suite 210, Phoenix, AZ 85004
- Hours: Mon–Fri 7am–6pm · Sat 8am–4pm · Sun closed
