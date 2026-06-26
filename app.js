const BRANDS = ['Hermès','Dior','Chanel','Louis Vuitton','YSL','Prada','Fendi','Gucci','Balenciaga','Celine','Miu Miu','Bottega Veneta','Goyard','Burberry','Loewe'];
const $ = (id) => document.getElementById(id);
const client = supabase.createClient(window.EP_SUPABASE_URL, window.EP_SUPABASE_ANON_KEY);
let currentLang = 'en';
let activeBrand = '';

function normalizeImages(value){
  if(Array.isArray(value)) return value.filter(Boolean);
  if(typeof value === 'string') return value.split(',').map(x=>x.trim()).filter(Boolean);
  return [];
}
function applyLang(){
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-en]').forEach(el => el.textContent = el.dataset[currentLang]);
  $('langToggle').textContent = currentLang === 'en' ? 'العربية' : 'English';
}
function renderBrands(){
  $('brandGrid').innerHTML = BRANDS.map(b => `<button class="brand-card" type="button" data-brand="${b}">${b}</button>`).join('');
  document.querySelectorAll('.brand-card').forEach(btn => btn.onclick = () => openBrand(btn.dataset.brand));
}
async function openBrand(brand){
  activeBrand = brand;
  $('activeBrandTitle').textContent = brand;
  $('brands').classList.add('hidden');
  $('productsSection').classList.remove('hidden');
  await loadProducts(brand);
  window.scrollTo({top:0,behavior:'smooth'});
}
async function loadProducts(brand){
  $('productsGrid').innerHTML = '';
  $('emptyState').classList.add('hidden');
  const { data, error } = await client.from('products').select('*').eq('brand', brand).eq('visible', true).order('created_at', { ascending:false });
  if(error){ $('emptyState').textContent = error.message; $('emptyState').classList.remove('hidden'); return; }
  if(!data || !data.length){ $('emptyState').classList.remove('hidden'); return; }
  $('productsGrid').innerHTML = data.map(productCard).join('');
  document.querySelectorAll('[data-view-id]').forEach(card => recordView(card.dataset.viewId));
}
function productCard(p){
  const imgs = normalizeImages(p.images || p.image_url || p.image).map(src => `<img src="${src}" alt="${p.name || 'Product'}" loading="lazy">`).join('') || '<div></div>';
  const message = encodeURIComponent(`Hello, I would like to inquire about ${p.name || 'this product'}.`);
  const wa = `https://wa.me/${window.EP_WHATSAPP_NUMBER}?text=${message}`;
  return `<article class="product-card" data-view-id="${p.id}">
    <div class="product-media">${imgs}</div>
    <div class="product-info">
      <h3>${p.name || ''}</h3>
      <p class="muted">${p.description || ''}</p>
      ${p.size ? `<p class="small">Size: ${p.size}</p>` : ''}
      ${p.condition ? `<p class="small">Condition: ${p.condition}</p>` : ''}
      <p class="price">${p.price || ''}</p>
      <a class="whatsapp" href="${wa}" target="_blank" rel="noopener">${currentLang === 'ar' ? 'استفسار عبر واتساب' : 'Inquire via WhatsApp'}</a>
    </div>
  </article>`;
}
async function recordView(id){
  try { await client.rpc('increment_product_views', { product_id: id }); } catch(e) {}
}
$('langToggle').onclick = () => { currentLang = currentLang === 'en' ? 'ar' : 'en'; applyLang(); if(activeBrand) loadProducts(activeBrand); };
$('backHome').onclick = () => { activeBrand=''; $('productsSection').classList.add('hidden'); $('brands').classList.remove('hidden'); window.scrollTo({top:0,behavior:'smooth'}); };
renderBrands(); applyLang();
