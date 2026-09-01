# Emphatic Labs — website

Static site. No build step, no dependencies. Four pages sharing one stylesheet.

```
site/
  index.html     Home
  careers.html   Open roles
  contact.html   Contact + form
  legal.html     Privacy policy + terms
  styles.css     Shared styles (all design tokens live in :root)
  nav.js         Navbar droplet animation + scroll hairline
  assets/
    logo.png             Bottle mark, transparent, 512px
    hero-bg.png          Pour artwork for the home hero
    panel-texture.jpg    Liquid green texture for panels and buttons
    favicon-32.png       Browser tab icon
    apple-touch-icon.png Home-screen icon
vercel.json      Deploy config
```

Assets were generated from the source PNGs by knocking out the white background,
cropping the logo to its artwork, and palette-quantising the hero (726 KB → 21 KB).

Brand notes and design tokens: [BRAND.md](BRAND.md)

## Run locally

```bash
python -m http.server 4321 --directory site
```

Then open http://localhost:4321

## Deploy to Vercel

`vercel.json` is already set up — it points Vercel at the `site/` folder, turns on clean URLs
(`/careers` instead of `/careers.html`), and sets no build step. Free on the Hobby plan.

**Easiest path:** push this folder to a GitHub repo, then at
[vercel.com/new](https://vercel.com/new) import it. Leave every build setting alone — the
config file handles it. Every push to `main` redeploys automatically.

**Or from the terminal:**

```bash
npx vercel
```

Follow the prompts, then ship it live with:

```bash
npx vercel --prod
```

To use a custom domain, add it under the project's Settings → Domains and point your registrar's
nameservers at Vercel.

## Before it goes live

- [ ] Register the domain and confirm `emphaticlabs.com` is actually available
- [ ] Set up `hello@` and `careers@` mailboxes (Google Workspace, Fastmail, or a forwarder)
- [ ] Point the contact form's `action` at a form service — Formspree or Basin are free and
      take one line. Right now it posts to `#` and does nothing.
- [ ] Add an Open Graph image (favicons are done)
- [ ] Edit the roles in `careers.html` to match what you're actually hiring for
- [ ] **License `panel-texture.jpg`.** It came from a Pngtree preview file and is watermarked.
      The current dark overlay hides the marks, but the licence issue stands — buy the licence
      or swap in a different texture before launch.
- [ ] Have someone check `legal.html`. It's a reasonable generic starting point, not legal advice,
      and it needs to match what you actually do with data once analytics or a form service is added.

## Editing

Every color and size is a CSS variable at the top of `styles.css`. Changing `--accent` and
`--accent-bright` restyles the whole site.

Job listings are plain `<a class="job">` blocks in `careers.html` — copy one to add a role.
Each links to a `mailto:` with a pre-filled subject line.
