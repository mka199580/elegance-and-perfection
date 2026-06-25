# E&P Clean Master — Vercel + Supabase

Upload these extracted files to the empty GitHub repository. Do not upload the ZIP itself.

Required Supabase setup:
1. Authentication: create admin user email/password.
2. Table: products
   - id uuid primary key default gen_random_uuid()
   - created_at timestamptz default now()
   - brand text
   - name text
   - price text
   - size text
   - description text
   - description_ar text
   - images jsonb default '[]'::jsonb
   - views int default 0
3. Storage bucket: products, public.
4. RLS policies should allow authenticated admin insert/update/delete and public read.
