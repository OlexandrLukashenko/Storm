const API = '';
let games = [];
let state = { query: '', sort: 'popular', cart: {}, token: localStorage.getItem('token') || null };

const storeEl = document.getElementById('store');
const cartList = document.getElementById('cartList');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');

async function fetchGames() {
  const res = await fetch('/api/games');
  games = await res.json();
  render();
}

function render() {
  renderStore();
  renderCart();
}

function renderStore() {
  storeEl.innerHTML = '';
  let list = [...games];
  const q = document.getElementById('search').value.trim().toLowerCase();
  if (q) list = list.filter(g => (g.title + ' ' + (g.desc||'')).toLowerCase().includes(q));
  if (state.sort === 'price-asc') list.sort((a,b)=>a.price-b.price);
  if (state.sort === 'price-desc') list.sort((a,b)=>b.price-a.price);
  if (state.sort === 'name') list.sort((a,b)=>a.title.localeCompare(b.title));
  list.forEach(g => {
    const card = document.createElement('div'); card.className='card';
    const thumb = document.createElement('div'); thumb.className='thumb'; thumb.style.backgroundImage = `url(${g.thumb})`;
    const body = document.createElement('div'); body.className='item-body';
    body.innerHTML = `<div class="title">${g.title}</div><div class="meta">${(g.desc||'')}</div>`;
    const pr = document.createElement('div'); pr.className='price-row';
    pr.innerHTML = `<div class="price">${g.price} грн</div><div><button class="btn" data-id="${g.id}">Деталі</button></div>`;
    body.appendChild(pr);
    card.appendChild(thumb); card.appendChild(body);
    storeEl.appendChild(card);
  });
}

function renderCart() {
  cartList.innerHTML = '';
  let total=0; let count=0;
  Object.entries(state.cart).forEach(([id,qty])=>{
    const g = games.find(x=>x.id==id);
    if(!g) return;
    total += g.price * qty;
    count += qty;
    const row = document.createElement('div'); row.className='cart-row';
    row.innerHTML = `<div>${g.title} × ${qty}</div><div>${g.price*qty} грн</div>`;
    cartList.appendChild(row);
  });
  cartTotal.textContent = total + ' грн';
  cartCount.textContent = count;
}

document.getElementById('search').addEventListener('input', ()=>renderStore());
document.getElementById('sort').addEventListener('change', e=>{ state.sort = e.target.value; renderStore(); });

storeEl.addEventListener('click', (e)=>{
  if (e.target.matches('button[data-id]')) {
    const id = e.target.dataset.id;
    openModal(id);
  }
});

function openModal(id) {
  const g = games.find(x=>x.id==id);
  if(!g) return;
  document.getElementById('modalImg').src = g.thumb;
  document.getElementById('modalTitle').textContent = g.title;
  document.getElementById('modalDesc').textContent = g.desc || '';
  document.getElementById('modalPrice').textContent = g.price + ' грн';
  document.getElementById('modalAdd').onclick = ()=>{
    state.cart[g.id] = (state.cart[g.id]||0) + 1;
    renderCart();
    closeModal();
  };
  document.getElementById('modalBackdrop').classList.remove('hidden');
}
function closeModal(){ document.getElementById('modalBackdrop').classList.add('hidden'); }
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalBackdrop').addEventListener('click', (e)=>{ if(e.target.id==='modalBackdrop') closeModal(); });

document.getElementById('checkout').addEventListener('click', async ()=>{
  if (!state.token) { alert('Потрібно увійти, щоб оформити замовлення'); return; }
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + state.token },
      body: JSON.stringify(state.cart)
    });
    const data = await res.json();
    if (res.ok) {
      alert('Замовлення оформлено, id: ' + data.orderId);
      state.cart = {}; renderCart();
    } else {
      alert(data.message || 'Помилка замовлення');
      if (res.status === 401) { localStorage.removeItem('token'); state.token = null; }
    }
  } catch (err) {
    alert('Помилка мережі');
  }
});

function openAuth(mode) {
  const username = prompt(mode === 'login' ? 'Введіть імʼя користувача' : 'Придумайте імʼя');
  if (!username) return;
  const password = prompt('Введіть пароль');
  if (!password) return;
  fetch(`/${mode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  }).then(r => r.json()).then(d => {
    if (d.token) {
      state.token = d.token; localStorage.setItem('token', d.token); alert('Успішно!');
    } else {
      alert(d.message || 'Помилка');
    }
  }).catch(()=>alert('Помилка мережі'));
}
document.getElementById('loginBtn').addEventListener('click', ()=>openAuth('login'));
document.getElementById('registerBtn').addEventListener('click', ()=>openAuth('register'));
document.getElementById('cartBtn').addEventListener('click', ()=>document.querySelector('.cart-panel').scrollIntoView({behavior:'smooth'}));

fetchGames();
