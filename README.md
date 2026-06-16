# Syndicate

Betting tracker for Steven, Luke and Jamie — built with [AstroWind](https://github.com/arthelokyo/astrowind).

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:4321/syndicate/`.

## Build

```bash
npm run build
npm run preview
```

## Data

- `data/seasons/` — archived Premier League seasons
- `data/segments/world-cup-2026.json` — live World Cup segment seed data

### World Cup admin (no redeploy needed)

On Netlify, live World Cup rounds are stored in **Netlify Blobs** and updated through the admin UI — you do not need to push to git or trigger a new build for each round.

1. Open `/admin` on your deployed site
2. Sign in with **admin** / **trio** (override via `SYNDICATE_ADMIN_USER` and `SYNDICATE_ADMIN_PASSWORD` in Netlify env vars)
3. Add or update rounds; the homepage and `/world-cup` refresh automatically

Optional: set `SYNDICATE_SESSION_SECRET` in Netlify for production session signing.

In local dev, admin writes directly to `data/segments/world-cup-2026.json`.

At end of season, archive into `data/seasons/` and reset the live file.

## Deploy

### Netlify (recommended)

Connect the GitHub repo at [app.netlify.com](https://app.netlify.com):

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 22

Or deploy from the CLI:

```bash
npm install
npx netlify-cli login
npx netlify-cli init
npx netlify-cli deploy --prod
```

After the first deploy, update `site` in `src/config.yaml` to your Netlify URL if it differs from `https://syndicate.netlify.app`.

### GitHub Pages

The site previously used base path `/syndicate`. For GitHub Pages, set `base: '/syndicate'` in `src/config.yaml` before building.
