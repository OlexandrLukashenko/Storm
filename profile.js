(async function () {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Ви не авторизовані. Перенаправлення на головну.');
    window.location.href = '/';
    return;
  }
  const headersAuth = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };
  const avatarImg = document.getElementById('avatarImg');
  const avatarInput = document.getElementById('avatarInput');
  const usernameEl = document.getElementById('username');
  const emailEl = document.getElementById('email');
  const passwordEl = document.getElementById('password');
  const profileForm = document.getElementById('profileForm');
  const ordersList = document.getElementById('ordersList');
  const logoutBtn = document.getElementById('logoutBtn');

  logoutBtn.addEventListener('click', ()=>{
    localStorage.removeItem('token');
    window.location.href = '/';
  });

  async function loadProfile() {
    try {
      const res = await fetch('/api/me', { headers: { 'Authorization': 'Bearer ' + token } });
      if (!res.ok) throw new Error('Unauthorized');
      const data = await res.json();
      usernameEl.value = data.username || '';
      emailEl.value = data.email || '';
      avatarImg.src = data.avatar || '/default-avatar.png';
    } catch (e) {
      alert('Не вдалося завантажити профіль. Увійдіть ще раз.');
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  }

  async function loadOrders() {
    try {
      const res = await fetch('/api/my-orders', { headers: { 'Authorization': 'Bearer ' + token } });
      if (!res.ok) throw new Error('Error orders');
      const orders = await res.json();
      renderOrders(orders);
    } catch (e) {
      ordersList.innerHTML = '<div class="empty">Не вдалося завантажити замовлення.</div>';
    }
  }

  function renderOrders(orders) {
    if (!orders || orders.length === 0) {
      ordersList.innerHTML = '<div class="empty">Історія покупок пуста.</div>';
      return;
    }
    ordersList.innerHTML = '';
    orders.forEach(o => {
      const div = document.createElement('div'); div.className = 'order';
      const date = new Date(o.created_at).toLocaleString();
      const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = `Замовлення #${o.id} • ${date} • Усього: ${o.total} грн`;
      const items = document.createElement('div'); items.className = 'items';
      (o.items || []).forEach(it => {
        const r = document.createElement('div'); r.className = 'item-row';
        r.innerHTML = `<div>${it.title} × ${it.qty}</div><div>${it.total} грн</div>`;
        items.appendChild(r);
      });
      div.appendChild(meta); div.appendChild(items);
      ordersList.appendChild(div);
    });
  }

  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = e => reject(e);
      fr.readAsDataURL(file);
    });
  }

  avatarInput.addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const dataUrl = await fileToDataURL(f);
    avatarImg.src = dataUrl;
    avatarImg.dataset.pending = dataUrl;
  });

  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = { username: usernameEl.value.trim(), email: emailEl.value.trim() };
    if (passwordEl.value) payload.password = passwordEl.value;
    if (avatarImg.dataset.pending) payload.avatar = avatarImg.dataset.pending;
    try {
      const res = await fetch('/api/me', {
        method: 'PUT',
        headers: headersAuth,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      alert('Профіль збережено');
      passwordEl.value = '';
      delete avatarImg.dataset.pending;
      await loadProfile();
      await loadOrders();
    } catch (err) {
      alert('Помилка при збереженні: ' + (err.message || err));
    }
  });

  document.getElementById('cancelBtn').addEventListener('click', async () => { await loadProfile(); });

  await loadProfile();
  await loadOrders();
})();