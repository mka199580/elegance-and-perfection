E&P MASTER BUILD - CLEAN ADMIN + PASSWORD RESET

FILES TO UPLOAD TO GITHUB:
1. index.html
2. admin.html
3. styles.css
4. app.js
5. admin.js
6. supabase-config.js

IMPORTANT:
Open supabase-config.js and replace:
PASTE_SUPABASE_PROJECT_URL_HERE
PASTE_SUPABASE_PUBLISHABLE_OR_ANON_KEY_HERE
with your real Supabase values.

SUPABASE URL CONFIGURATION:
Authentication > URL Configuration
Site URL:
https://elegance-and-perfection.vercel.app
Redirect URLs:
https://elegance-and-perfection.vercel.app/admin.html

SUPABASE SQL SETUP:
Run this in Supabase SQL Editor if your products table does not already match this build.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  name text not null,
  description text,
  price text,
  size text,
  condition text,
  images text[] default '{}',
  visible boolean default true,
  views integer default 0,
  created_at timestamptz default now()
);

alter table public.products enable row level security;

drop policy if exists "Public can read visible products" on public.products;
create policy "Public can read visible products"
on public.products for select
using (visible = true or auth.role() = 'authenticated');

drop policy if exists "Authenticated admins can insert products" on public.products;
create policy "Authenticated admins can insert products"
on public.products for insert
to authenticated
with check (true);

drop policy if exists "Authenticated admins can update products" on public.products;
create policy "Authenticated admins can update products"
on public.products for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated admins can delete products" on public.products;
create policy "Authenticated admins can delete products"
on public.products for delete
to authenticated
using (true);

create or replace function public.increment_product_views(product_id uuid)
returns void
language sql
security definer
as $$
  update public.products
  set views = coalesce(views, 0) + 1
  where id = product_id;
$$;

STORAGE BUCKET:
Create a public storage bucket named:
product-images

Then add these storage policies if needed:
- Public read access for product-images
- Authenticated users can upload/update/delete in product-images

WHAT IS INCLUDED:
- Login
- Forgot password
- Set new password from reset email
- Change password inside dashboard
- Add/edit/delete products
- Multiple product images
- Product views count in admin
- WhatsApp inquiry button
- English/Arabic toggle on website
- Quiet luxury styling
