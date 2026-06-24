const BRANDS = ['Hermès','Chanel','Dior','Louis Vuitton','YSL','Prada','Fendi','Gucci','Balenciaga','Celine','Miu Miu','Bottega Veneta','Goyard','Burberry','Loewe'];
const cfg = window.EP_CONFIG || {};
const isConfigured = cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes('PASTE_') && cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes('PASTE_');
const supabaseClient = isConfigured ? supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
const $ = (id)=>document.getElementById(id);

function setMessage(text){ $('adminMessage').textContent = text; }
function fillBrands(){
  $('brand').innerHTML = BRANDS.map(b=>`<option value="${b}">${b}</option>`).join('');
}
function resetForm(){
  $('productForm').reset(); $('productId').value=''; setMessage('');
}
async function uploadImages(files){
  const urls = [];
  for (const file of files) {
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabaseClient.storage.from(cfg.STORAGE_BUCKET || 'products').upload(path, file, { upsert:false });
    if(error) throw error;
    const { data } = supabaseClient.storage.from(cfg.STORAGE_BUCKET || 'products').getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}
async function saveProduct(e){
  e.preventDefault();
  if(!supabaseClient){ setMessage('Add your Supabase URL and publishable key in js/config.js first.'); return; }
  setMessage('Publishing...');
  try{
    const files = Array.from($('images').files || []);
    const newImages = files.length ? await uploadImages(files) : null;
    const payload = {
      brand: $('brand').value,
      name: $('name').value.trim(),
      price: $('price').value.trim(),
      description: $('description').value.trim(),
    };
    if(newImages) payload.images = newImages;
    const id = $('productId').value;
    let error;
    if(id){
      ({ error } = await supabaseClient.from('products').update(payload).eq('id', id));
    } else {
      if(!payload.images) payload.images = [];
      ({ error } = await supabaseClient.from('products').insert(payload));
    }
    if(error) throw error;
    resetForm();
    setMessage('Product published successfully.');
    await loadTable();
  }catch(err){ console.error(err); setMessage(`Error: ${err.message}`); }
}
async function loadTable(){
  const body = $('productsTable');
  if(!supabaseClient){ body.innerHTML = '<tr><td colspan="5">Connect Supabase in js/config.js to manage products.</td></tr>'; return; }
  const {data, error} = await supabaseClient.from('products').select('*').order('created_at', {ascending:false});
  if(error){ body.innerHTML = `<tr><td colspan="5">${error.message}</td></tr>`; return; }
  body.innerHTML = '';
  (data||[]).forEach(p=>{
    const img = Array.isArray(p.images) && p.images[0] ? p.images[0] : '';
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${img ? `<img src="${img}" alt="">` : '—'}</td><td>${p.name}</td><td>${p.brand}</td><td>${p.price}</td><td><button class="actionBtn" data-edit="${p.id}">Edit</button><button class="actionBtn" data-delete="${p.id}">Delete</button></td>`;
    tr.querySelector('[data-edit]').onclick = ()=>editProduct(p);
    tr.querySelector('[data-delete]').onclick = ()=>deleteProduct(p.id);
    body.appendChild(tr);
  });
}
function editProduct(p){
  $('productId').value = p.id;
  $('brand').value = p.brand;
  $('name').value = p.name;
  $('price').value = p.price;
  $('description').value = p.description || '';
  setMessage('Editing product. Upload new photos only if you want to replace photos.');
  window.scrollTo({top:0, behavior:'smooth'});
}
async function deleteProduct(id){
  if(!confirm('Delete this product?')) return;
  const {error} = await supabaseClient.from('products').delete().eq('id', id);
  if(error){ setMessage(error.message); return; }
  await loadTable();
}
function init(){
  fillBrands();
  $('productForm').onsubmit = saveProduct;
  $('resetForm').onclick = resetForm;
  $('newProductBtn').onclick = resetForm;
  loadTable();
}
init();
