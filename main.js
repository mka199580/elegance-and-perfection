const BRANDS = ['Hermès','Chanel','Dior','Louis Vuitton','YSL','Prada','Fendi','Gucci','Balenciaga','Celine','Miu Miu','Bottega Veneta','Goyard','Burberry','Loewe'];
const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=80'
];
const SAMPLE_PRODUCTS = {
  'Dior': [
    {name:'Lady Dior Medium', price:'450 KWD', description:'Color: Black\nMaterial: Cannage Lambskin\nSize: Medium\nCondition: Excellent', images:[SAMPLE_IMAGES[0], SAMPLE_IMAGES[1]]},
    {name:'Saddle Bag', price:'480 KWD', description:'Color: Black\nHardware: Gold-tone\nCondition: Excellent', images:[SAMPLE_IMAGES[1], SAMPLE_IMAGES[2]]},
    {name:'Book Tote', price:'390 KWD', description:'Oblique canvas\nStructured everyday carry\nCondition: Excellent', images:[SAMPLE_IMAGES[2], SAMPLE_IMAGES[3]]},
    {name:'Dior Toujours', price:'520 KWD', description:'Soft silhouette\nElegant daily handbag\nCondition: Excellent', images:[SAMPLE_IMAGES[3], SAMPLE_IMAGES[0]]}
  ],
  'Hermès': [
    {name:'Kelly 25 Sellier', price:'1,850 KWD', description:'Color: Gold\nSize: 25cm\nCondition: Excellent', images:[SAMPLE_IMAGES[1], SAMPLE_IMAGES[0]]},
    {name:'Birkin 30', price:'2,100 KWD', description:'Color: Etoupe\nSize: 30cm\nCondition: Excellent', images:[SAMPLE_IMAGES[2], SAMPLE_IMAGES[1]]}
  ],
  'Chanel': [
    {name:'Classic Flap Medium', price:'1,250 KWD', description:'Color: Black\nHardware: Gold-tone\nCondition: Excellent', images:[SAMPLE_IMAGES[0], SAMPLE_IMAGES[2]]},
    {name:'Boy Bag', price:'980 KWD', description:'Structured Chanel silhouette\nCondition: Excellent', images:[SAMPLE_IMAGES[3], SAMPLE_IMAGES[1]]}
  ]
};

const cfg = window.EP_CONFIG || {};
const isConfigured = cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes('PASTE_') && cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes('PASTE_');
const supabaseClient = isConfigured ? supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
let allProducts = [];
let currentBrand = null;
let currentProduct = null;
let currentImageIndex = 0;

const $ = (id)=>document.getElementById(id);

function setupLinks(){
  ['instagramLink','footerInstagram'].forEach(id=>$(id).href = cfg.INSTAGRAM_URL || '#');
  ['tiktokLink','footerTiktok'].forEach(id=>$(id).href = cfg.TIKTOK_URL || '#');
}

function renderBrands(){
  const grid = $('brandGrid');
  grid.innerHTML = '';
  BRANDS.forEach(brand=>{
    const btn = document.createElement('button');
    btn.className = 'brandLink';
    btn.textContent = brand;
    btn.onclick = ()=>showBrand(brand);
    grid.appendChild(btn);
  });
}

async function loadProducts(){
  if(!supabaseClient){
    allProducts = Object.entries(SAMPLE_PRODUCTS).flatMap(([brand, items])=>items.map((p, i)=>({...p, id:`sample-${brand}-${i}`, brand})));
    return;
  }
  const { data, error } = await supabaseClient.from('products').select('*').order('created_at', { ascending:false });
  if(error){ console.error(error); allProducts = []; return; }
  allProducts = data || [];
}

function showBrand(brand){
  currentBrand = brand;
  $('home').classList.add('hidden');
  $('brands').classList.add('hidden');
  $('brandView').classList.remove('hidden');
  $('brandTitle').textContent = brand;
  $('brandSubtitle').textContent = `Selected pieces from the House of ${brand}.`;
  renderProducts(brand);
  window.scrollTo({top:0, behavior:'smooth'});
}

function backHome(){
  $('brandView').classList.add('hidden');
  $('home').classList.remove('hidden');
  $('brands').classList.remove('hidden');
  window.location.hash = 'brands';
  setTimeout(()=>$('brands').scrollIntoView({behavior:'smooth'}), 80);
}

function renderProducts(brand){
  const grid = $('productsGrid');
  const items = allProducts.filter(p=>p.brand === brand);
  grid.innerHTML = '';
  $('emptyState').classList.toggle('hidden', items.length > 0);
  items.forEach(product=>{
    const images = Array.isArray(product.images) ? product.images : [];
    const card = document.createElement('article');
    card.className = 'productCard';
    card.innerHTML = `
      <img src="${images[0] || SAMPLE_IMAGES[0]}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p class="price">${product.price}</p>
    `;
    card.onclick = ()=>openProduct(product);
    grid.appendChild(card);
  });
}

function openProduct(product){
  currentProduct = product;
  currentImageIndex = 0;
  $('productModal').classList.remove('hidden');
  $('productModal').setAttribute('aria-hidden','false');
  renderModal();
}

function renderModal(){
  const images = Array.isArray(currentProduct.images) && currentProduct.images.length ? currentProduct.images : [SAMPLE_IMAGES[0]];
  $('modalImage').src = images[currentImageIndex];
  $('modalName').textContent = currentProduct.name;
  $('modalPrice').textContent = currentProduct.price;
  $('modalDescription').textContent = currentProduct.description || '';
  const message = encodeURIComponent(`Hello E&P,\n\nI'm interested in ${currentProduct.name}.`);
  $('whatsappBtn').href = `https://wa.me/${cfg.WHATSAPP_NUMBER || '96555138907'}?text=${message}`;
  const thumbs = $('thumbs');
  thumbs.innerHTML = '';
  images.forEach((src, index)=>{
    const img = document.createElement('img');
    img.src = src;
    img.className = index === currentImageIndex ? 'active' : '';
    img.onclick = ()=>{currentImageIndex = index; renderModal();};
    thumbs.appendChild(img);
  });
}

function closeModal(){
  $('productModal').classList.add('hidden');
  $('productModal').setAttribute('aria-hidden','true');
}

function moveImage(direction){
  const images = Array.isArray(currentProduct.images) && currentProduct.images.length ? currentProduct.images : [SAMPLE_IMAGES[0]];
  currentImageIndex = (currentImageIndex + direction + images.length) % images.length;
  renderModal();
}

async function init(){
  setupLinks();
  renderBrands();
  await loadProducts();
  $('backHome').onclick = backHome;
  $('closeModal').onclick = closeModal;
  $('modalBackdrop').onclick = closeModal;
  $('backToBrand').onclick = closeModal;
  $('prevImage').onclick = ()=>moveImage(-1);
  $('nextImage').onclick = ()=>moveImage(1);
}
init();
