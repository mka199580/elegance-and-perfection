# E&P Quiet Luxury Supabase Website

## What is included
- `index.html` quiet luxury customer website
- `admin.html` product upload dashboard
- Supabase product loading
- Supabase Storage image uploads
- 15 clickable homepage brand names
- 2-product desktop layout / 1-product mobile layout
- Product detail gallery
- WhatsApp request button: +96555138907

## Supabase setup already expected
Table: `products`
Columns:
- id bigint identity primary key
- brand text
- name text
- price text
- description text
- images jsonb
- created_at timestamp with time zone default now()

Storage bucket:
- `products`
- Public ON

## Connect Supabase
Open:
`js/config.js`

Replace:
`PASTE_YOUR_SUPABASE_PROJECT_URL_HERE`

with your Project URL.

Replace:
`PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE`

with your Supabase publishable key.

Do not use your secret key.

## Social links
In `js/config.js`, replace:
- `INSTAGRAM_URL: '#'`
- `TIKTOK_URL: '#'`

with your real links.

## Admin
Open:
`/admin.html`

Add products from there after uploading to Netlify/GitHub.
