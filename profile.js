(async function () {
  const usernameEl = document.getElementById('username');
  const emailEl = document.getElementById('email');
  const passwordEl = document.getElementById('password');
  const avatarImg = document.getElementById('avatarImg');
  const avatarInput = document.getElementById('avatarInput');
  const ordersList = document.getElementById('ordersList');

  // "Авторизація"
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Ви не авторизовані. Переходимо на головну.');
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('logoutBtn').onclick = () => {
    localStorage.removeItem('token');
    alert('Вихід виконано');
    window.location.href = 'index.html';
  };

  // Демонстраційні дані
  const profile = {
    username: "Admin",
    email: "admin@example.com",
    avatar: avatarImg.src
  };
  const orders = [
    { id: 1, created_at: new Date().toLocaleString(), total: 1200, items: [{title:"Cyberpunk 2077", qty:1, total:1200}] }
  ];

  function loadProfile() {
    usernameEl.value = profile.username;
    emailEl.value = profile.email;
  }

  function renderOrders() {
    ordersList.innerHTML = '';
    orders.forEach(o => {
      const div = document.createElement('div'); div.className = 'order';
      div.innerHTML = `
        <div class="meta">Замовлення #${o.id} • ${o.created_at} • ${o.total} грн</div>
        ${o.items.map(it=>`<div class="item-row"><div>${it.title} × ${it.qty}</div><div>${it.total} грн</div></div>`).join('')}
      `;
      ordersList.appendChild(div);
    });
  }

  avatarInput.addEventListener('change', e=>{
    const f = e.target.files[0];
    if(!f) return;
    const fr = new FileReader();
    fr.onload = ()=> avatarImg.src = fr.result;
    fr.readAsDataURL(f);
  });

  document.getElementById('profileForm').addEventListener('submit', e=>{
    e.preventDefault();
    profile.username = usernameEl.value;
    profile.email = emailEl.value;
    alert('Профіль збережено!');
  });

  document.getElementById('cancelBtn').onclick = loadProfile;

  loadProfile();
  renderOrders();
})();
