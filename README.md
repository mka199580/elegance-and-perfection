# E&P Final Production Master — Vercel + Supabase

Upload these files to the root of your GitHub repository. Vercel will redeploy automatically.

## Files
- index.html — public website
- admin.html — private admin login screen
- style.css — full quiet luxury styling
- main.js — brand/product display + Arabic toggle + WhatsApp links
- admin.js — Supabase login + product create/edit/delete
- config.js — fill with Supabase URL, anon key, WhatsApp, Instagram, TikTok

## Supabase setup
Create a `products` table with these columns:
- id uuid primary key default gen_random_uuid()
- created_at timestamptz default now()
- updated_at timestamptz
- brand text
- name text
- name_ar text
- price text
- size text
- description text
- description_ar text
- images jsonb default '[]'::jsonb
- views int default 0

Enable Row Level Security. Recommended policies:
- SELECT: allow everyone
- INSERT/UPDATE/DELETE: allow authenticated users only, or restrict to your admin email.

Create your admin user in Supabase Authentication, then add your email to ADMIN_EMAIL in config.js.
