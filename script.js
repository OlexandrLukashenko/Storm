let games = [
  { id: 1, title: "Cyberpunk 2077", price: 1200, thumb: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg", desc: "RPG від CD Projekt" },
  { id: 2, title: "GTA V", price: 800, thumb: "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg", desc: "Класичний екшен" },
  { id: 3, title: "The Witcher 3", price: 900, thumb: "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg", desc: "Фентезі RPG" }
];

let state = { query: '', sort: 'popular', cart: {}, token: localStorage.getItem('token') || null };

const storeEl = document.getElementById('store');
const cartList = document.getElementById('cartList');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');

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

document.getElementById('checkout').addEventListener('click', ()=>{
  if (!Object.keys(state.cart).length) return alert('Кошик порожній!');
  alert('Замовлення оформлено! Дякуємо ❤️');
  state.cart = {}; renderCart();
});

document.getElementById('loginBtn').addEventListener('click', ()=>{
  const username = prompt('Введіть імʼя користувача');
  if (!username) return;
  localStorage.setItem('token', 'mocktoken');
  alert('Вхід виконано!');
});
document.getElementById('registerBtn').addEventListener('click', ()=>{
  alert('Реєстрація успішна!');
});

render();
