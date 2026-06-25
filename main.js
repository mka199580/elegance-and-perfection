const brands = ['Hermès','Chanel','Dior','Louis Vuitton','YSL','Prada','Gucci','Fendi','Celine','Balenciaga','Miu Miu','Bottega Veneta','Goyard','Burberry','Loewe'];
const sampleProducts = brands.map((brand, i) => ({
  id: `p${i+1}`,
  brand,
  name: `${brand} Signature Handbag`,
  size: 'Size available on request',
  condition: 'Curated piece',
  price: 'Inquire',
  description: 'Elegant luxury handbag selected for the E&P collection.',
  image: null,
  views: 0
}));

const translations = {
  en: { navBrands:'Brands', navCollection:'Collection', navAdmin:'Admin', eyebrow:'Elegance & Perfection', heroTitle:'Curated Luxury Handbags', heroText:'A quiet luxury showroom for iconic maisons, refined silhouettes, and timeless details.', explore:'Explore Collection', introKicker:'Private curation', introTitle:'Luxury pieces, selected with restraint.', introText:'Browse by maison, view details, and inquire directly through WhatsApp.', brandsKicker:'Explore by brand', brandsTitle:'Choose a maison', promise1Title:'Authenticity First', promise1Text:'Every item is presented with careful product details.', promise2Title:'Curated Taste', promise2Text:'A clean luxury edit across the most requested maisons.', promise3Title:'Direct Inquiry', promise3Text:'Ask about any piece instantly through WhatsApp.', inquire:'Inquire via WhatsApp', allPieces:'All Pieces', collection:'Collection' },
  ar: { navBrands:'العلامات', navCollection:'المجموعة', navAdmin:'الإدارة', eyebrow:'إليغانس أند بيرفكشن', heroTitle:'حقائب فاخرة مختارة', heroText:'وجهة هادئة وفاخرة لأشهر الدور العالمية والتصاميم الراقية.', explore:'استكشفي المجموعة', introKicker:'اختيار خاص', introTitle:'قطع فاخرة مختارة بذوق راقٍ.', introText:'تصفحي حسب العلامة واستفسري مباشرة عبر واتساب.', brandsKicker:'استكشاف حسب العلامة', brandsTitle:'اختاري دار الأزياء', promise1Title:'الأصالة أولاً', promise1Text:'كل قطعة تعرض بتفاصيل واضحة ومدروسة.', promise2Title:'اختيار راقٍ', promise2Text:'مجموعة فاخرة من أكثر العلامات طلباً.', promise3Title:'استفسار مباشر', promise3Text:'اسألي عن أي قطعة فوراً عبر واتساب.', inquire:'استفسار عبر واتساب', allPieces:'كل القطع', collection:'المجموعة' }
};
let lang = localStorage.getItem('ep_lang') || 'en';
let selectedBrand = null;
function getProducts(){ return JSON.parse(localStorage.getItem('ep_products') || 'null') || sampleProducts; }
function saveProducts(products){ localStorage.setItem('ep_products', JSON.stringify(products)); }
function t(key){ return translations[lang][key] || key; }
function applyLang(){ document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n)); document.getElementById('langToggle').textContent = lang === 'ar' ? 'English' : 'عربي'; renderProducts(); }
function renderBrands(){ const grid = document.getElementById('brandGrid'); grid.innerHTML = brands.map(b => `<button class="brand-card" data-brand="${b}">${b}</button>`).join(''); grid.querySelectorAll('button').forEach(btn => btn.onclick = () => { selectedBrand = btn.dataset.brand; document.getElementById('collection').scrollIntoView({behavior:'smooth'}); renderProducts(); }); }
function productImage(product){ if(product.image) return `<img src="${product.image}" alt="${product.name}">`; return `<div class="product-placeholder"><span>${product.brand}</span></div>`; }
function renderProducts(){ const products = getProducts().filter(p => !selectedBrand || p.brand === selectedBrand); document.getElementById('collectionKicker').textContent = selectedBrand || t('collection'); document.getElementById('collectionTitle').textContent = selectedBrand ? `${selectedBrand} Collection` : t('allPieces'); const grid = document.getElementById('productGrid'); grid.innerHTML = products.map(p => `<article class="product-card"><div class="product-image">${productImage(p)}</div><div class="product-info"><p>${p.brand}</p><h3>${p.name}</h3><span>${p.size || ''}</span><span>${p.condition || ''}</span><a class="inquire-btn" target="_blank" rel="noopener" href="${waLink(p)}">${t('inquire')}</a></div></article>`).join(''); }
function waLink(product){ const number = window.EP_CONFIG?.whatsappNumber || '96555138907'; const msg = encodeURIComponent(`Hello E&P, I would like to inquire about ${product.brand} - ${product.name}`); return `https://wa.me/${number}?text=${msg}`; }
function revealOnScroll(){ document.querySelectorAll('.reveal').forEach(el => { if(el.getBoundingClientRect().top < innerHeight - 80) el.classList.add('visible'); }); }
document.addEventListener('DOMContentLoaded', () => { renderBrands(); applyLang(); document.getElementById('langToggle').onclick = () => { lang = lang === 'en' ? 'ar' : 'en'; localStorage.setItem('ep_lang', lang); applyLang(); }; document.getElementById('instagramLink').href = EP_CONFIG.instagramUrl; document.getElementById('tiktokLink').href = EP_CONFIG.tiktokUrl; document.getElementById('whatsappFloat').href = `https://wa.me/${EP_CONFIG.whatsappNumber}`; addEventListener('scroll', revealOnScroll); revealOnScroll(); });
