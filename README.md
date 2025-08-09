# Trimmr Brand Activation — v0.2.1 (Patched esbuild)

## Quickstart
```bash
npm install
echo VITE_SUPABASE_URL=YOUR_URL > .env.local
echo VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY >> .env.local
npm run dev
```

## Security
This bundle pins **esbuild** to `^0.25.0` via `package.json` overrides to satisfy `npm audit` without upgrading Vite.


## Branding (v0.3)
- Color palette set to Trimmr (Rice Cake / Holly / Fiery Orange / etc.).
- Heading font: Kiona (local if provided), fallback Montserrat via Google Fonts.
- Body font: Larkin (local if provided), fallback Inter via Google Fonts.
- Drop licensed font files in `public/fonts/` named `Kiona.woff2` / `Larkin.woff2` to switch from fallbacks automatically.
