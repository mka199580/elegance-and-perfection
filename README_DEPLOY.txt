E&P FINAL SUPABASE BUILD

Upload these 6 files to GitHub root:
- index.html
- admin.html
- styles.css
- app.js
- admin.js
- supabase-config.js

Supabase must have:
1) Table: products
Columns:
- id uuid primary key default gen_random_uuid()
- created_at timestamptz default now()
- brand text
- name text
- description text
- price text
- size text
- condition text
- images text[]
- views int8 default 0

2) Storage bucket:
- product-images
Make bucket public.

3) Supabase Auth:
Create your admin email/password in Authentication > Users.

4) Optional views function:
create or replace function increment_product_views(product_id uuid)
returns void as $$
begin
  update products set views = coalesce(views,0) + 1 where id = product_id;
end;
$$ language plpgsql security definer;

5) Policies:
Allow public SELECT on products.
Allow authenticated INSERT/UPDATE/DELETE on products.
Allow authenticated uploads to product-images storage.
Allow public read from product-images storage.
