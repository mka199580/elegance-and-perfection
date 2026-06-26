const BRANDS = ['Hermès','Dior','Chanel','Louis Vuitton','YSL','Prada','Fendi','Gucci','Balenciaga','Celine','Miu Miu','Bottega Veneta','Goyard','Burberry','Loewe'];
const $ = (id) => document.getElementById(id);
const client = supabase.createClient(window.EP_SUPABASE_URL, window.EP_SUPABASE_ANON_KEY);
let editingId = null;

function msg(id, text){ $(id).textContent = text || ''; }
function normalizeImages(value){ if(Array.isArray(value)) return value.filter(Boolean); if(typeof value === 'string') return value.split(',').map(x=>x.trim()).filter(Boolean); return []; }
function fillBrands(){ $('brand').innerHTML = BRANDS.map(b => `<option value="${b}">${b}</option>`).join(''); }
function showAuth(){ $('authPanel').classList.remove('hidden'); $('dashboard').classList.add('hidden'); }
function showDashboard(){ $('authPanel').classList.add('hidden'); $('dashboard').classList.remove('hidden'); loadAdminProducts(); }

async function checkSession(){
  const { data } = await client.auth.getSession();
  if(data.session) showDashboard(); else showAuth();
}

async function login(){
  msg('authMsg','Signing in...');
  const { error } = await client.auth.signInWithPassword({ email:$('email').value.trim(), password:$('password').value });
  if(error){ msg('authMsg', error.message); return; }
  msg('authMsg',''); showDashboard();
}
async function forgotPassword(){
  const email = $('email').value.trim();
  if(!email){ msg('authMsg','Enter your email first.'); return; }
  const redirectTo = `${location.origin}${location.pathname}`;
  const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
  msg('authMsg', error ? error.message : 'Reset email sent. Open the newest email only.');
}
async function updateRecoveryPassword(){
  const password = $('newPassword').value.trim();
  if(!password){ msg('authMsg','Enter a new password.'); return; }
  const { error } = await client.auth.updateUser({ password });
  if(error){ msg('authMsg', error.message); return; }
  msg('authMsg','Password updated successfully. Please login again.');
  await client.auth.signOut(); showAuth(); $('resetBox').classList.add('hidden');
}
async function dashboardPassword(){
  const password = $('dashboardNewPassword').value.trim();
  if(!password){ msg('passwordMsg','Enter a new password.'); return; }
  const { error } = await client.auth.updateUser({ password });
  msg('passwordMsg', error ? error.message : 'Password updated successfully.');
  if(!error) $('dashboardNewPassword').value = '';
}
async function logout(){ await client.auth.signOut(); showAuth(); }

async function uploadFiles(){
  const files = Array.from($('imageFiles').files || []);
  const urls = [];
  for(const file of files){
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await client.storage.from(window.EP_STORAGE_BUCKET).upload(path, file, { upsert:false });
    if(error) throw error;
    const { data } = client.storage.from(window.EP_STORAGE_BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}
function formProduct(images){
  return { brand:$('brand').value, name:$('name').value.trim(), price:$('price').value.trim(), size:$('size').value.trim(), condition:$('condition').value.trim(), description:$('description').value.trim(), images, visible:$('visible').checked };
}
async function saveProduct(){
  try{
    msg('productMsg','Saving...');
    const typedUrls = $('imageUrls').value.split(',').map(x=>x.trim()).filter(Boolean);
    const fileUrls = await uploadFiles();
    let images = [...typedUrls, ...fileUrls];
    if(editingId && !images.length){
      const { data } = await client.from('products').select('images').eq('id', editingId).single();
      images = normalizeImages(data?.images);
    }
    const payload = formProduct(images);
    const result = editingId ? await client.from('products').update(payload).eq('id', editingId) : await client.from('products').insert(payload);
    if(result.error) throw result.error;
    msg('productMsg', editingId ? 'Product updated.' : 'Product published.');
    clearForm(); await loadAdminProducts();
  } catch(error){ msg('productMsg', error.message); }
}
function clearForm(){ editingId = null; $('formTitle').textContent = 'Add Product'; $('saveProductBtn').textContent = 'Publish Product'; $('cancelEditBtn').classList.add('hidden'); ['name','price','size','condition','description','imageUrls','imageFiles'].forEach(id => $(id).value=''); $('visible').checked = true; }
async function loadAdminProducts(){
  const { data, error } = await client.from('products').select('*').order('created_at', { ascending:false });
  if(error){ $('adminProducts').innerHTML = `<p class="status">${error.message}</p>`; return; }
  $('adminProducts').innerHTML = (data || []).map(adminCard).join('') || '<p class="status">No products yet.</p>';
  document.querySelectorAll('[data-edit]').forEach(btn => btn.onclick = () => editProduct(btn.dataset.edit));
  document.querySelectorAll('[data-delete]').forEach(btn => btn.onclick = () => deleteProduct(btn.dataset.delete));
}
function adminCard(p){
  const img = normalizeImages(p.images)[0] || '';
  return `<article class="admin-product">
    <img src="${img}" alt="">
    <div><h3>${p.name || 'Untitled'}</h3><p class="small">${p.brand || ''} · ${p.price || ''} · Views: ${p.views || 0}</p><p class="small">${p.visible ? 'Visible' : 'Hidden'}</p></div>
    <div class="actions"><button class="ghost-btn" data-edit="${p.id}" type="button">Edit</button><button class="dark-btn" data-delete="${p.id}" type="button">Delete</button></div>
  </article>`;
}
async function editProduct(id){
  const { data, error } = await client.from('products').select('*').eq('id', id).single();
  if(error){ msg('productMsg', error.message); return; }
  editingId = id; $('formTitle').textContent = 'Edit Product'; $('saveProductBtn').textContent = 'Save Changes'; $('cancelEditBtn').classList.remove('hidden');
  $('brand').value = data.brand || BRANDS[0]; $('name').value = data.name || ''; $('price').value = data.price || ''; $('size').value = data.size || ''; $('condition').value = data.condition || ''; $('description').value = data.description || ''; $('imageUrls').value = normalizeImages(data.images).join(', '); $('visible').checked = data.visible !== false; window.scrollTo({top:0,behavior:'smooth'});
}
async function deleteProduct(id){
  if(!confirm('Delete this product?')) return;
  const { error } = await client.from('products').delete().eq('id', id);
  if(error){ msg('productMsg', error.message); return; }
  await loadAdminProducts();
}

client.auth.onAuthStateChange((event) => { if(event === 'PASSWORD_RECOVERY'){ $('resetBox').classList.remove('hidden'); showAuth(); } });
if(location.hash.includes('type=recovery') || location.search.includes('type=recovery')){ $('resetBox').classList.remove('hidden'); }
$('loginBtn').onclick = login; $('forgotBtn').onclick = forgotPassword; $('updatePasswordBtn').onclick = updateRecoveryPassword; $('logoutBtn').onclick = logout; $('saveProductBtn').onclick = saveProduct; $('refreshProducts').onclick = loadAdminProducts; $('cancelEditBtn').onclick = clearForm; $('changePasswordOpen').onclick = () => $('changePasswordBox').classList.toggle('hidden'); $('dashboardUpdatePassword').onclick = dashboardPassword;
fillBrands(); checkSession();
