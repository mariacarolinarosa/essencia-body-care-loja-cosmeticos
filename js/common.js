/* =========================================================
   ESSÊNCIA BODY CARE — JAVASCRIPT GLOBAL
   Carrinho, busca, filtros, página de produto e utilidades.
   Tudo funciona no navegador e não precisa de servidor.
   ========================================================= */

const PRODUCTS = [
  { id:'hidratante-vanilla', name:'Creme Vanilla', category:'Hidratantes', price:80, image:'Imagens/hidratante1.jpg', description:'Hidratação cremosa com uma atmosfera delicada de baunilha e toque aconchegante.', tag:'Mais vendido' },
  { id:'hidratante-lavanda', name:'Creme Lavanda', category:'Hidratantes', price:85, image:'Imagens/hidratante2.jpg', description:'Fórmula cremosa inspirada na lavanda, pensada para uma rotina de autocuidado suave.', tag:'Ritual noturno' },
  { id:'sabonete-rosas', name:'Sabonete Maison Rose', category:'Sabonetes', price:40, image:'Imagens/sabonete1.jpg', description:'Sabonete delicado com estética floral e sensorial romântico para o banho.', tag:'Floral' },
  { id:'sabonete-liquido', name:'Sabonete Líquido', category:'Sabonetes', price:45, image:'Imagens/sabonete2.jpg', description:'Limpeza suave para transformar o banho em um pequeno ritual de cuidado.', tag:'Essencial' },
  { id:'kit-spa', name:'Kit Oasis', category:'Kits', price:150, image:'Imagens/kit.jpg', description:'Uma seleção para criar um momento de spa em casa, com apresentação delicada e mística.', tag:'Presente' },
  { id:'oleo-amendoas', name:'Óleo de Amêndoas', category:'Óleos', price:95, image:'Imagens/oleo.jpg', description:'Óleo corporal para uma etapa de cuidado e nutrição, ideal para complementar seu ritual.', tag:'Clássico' }
];

const CART_KEY = 'essencia-body-care-cart';

function money(value) {
  return value.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
}

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
}

function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) item.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart(cart);
  openCart();
  showToast(`${product.name} foi adicionando ao carrinho.`);
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  const next = cart.filter(i => i.qty > 0);
  saveCart(next);
}

function cartTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => {
    const p = PRODUCTS.find(product => product.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
  return { subtotal, total: subtotal };
}

function updateCartBadge() {
  const count = getCart().reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = count);
}

function renderCartDrawer() {
  const list = document.querySelector('[data-cart-list]');
  const totalEl = document.querySelector('[data-cart-total]');
  if (!list || !totalEl) return;
  const cart = getCart();
  if (!cart.length) {
    list.innerHTML = '<div class="empty"><strong>Seu ritual começa aqui</strong>Nenhum produto foi adicionado ainda.</div>';
    totalEl.textContent = money(0);
    return;
  }
  list.innerHTML = cart.map(item => {
    const p = PRODUCTS.find(product => product.id === item.id);
    if (!p) return '';
    return `
      <div class="cart-item">
        <img src="${p.image}" alt="${p.name}" onerror="this.style.display='none'">
        <div>
          <strong>${p.name}</strong>
          <span>${money(p.price)} · ${p.category}</span>
          <div class="qty">
            <button type="button" data-qty="${p.id}" data-delta="-1" aria-label="Diminuir quantidade">−</button>
            <b>${item.qty}</b>
            <button type="button" data-qty="${p.id}" data-delta="1" aria-label="Aumentar quantidade">+</button>
          </div>
        </div>
        <strong>${money(p.price * item.qty)}</strong>
      </div>`;
  }).join('');
  totalEl.textContent = money(cartTotals().total);
}

function openCart() {
  renderCartDrawer();
  document.querySelector('[data-cart-drawer]')?.classList.add('open');
  document.querySelector('[data-overlay]')?.classList.add('open');
}
function closeCart() {
  document.querySelector('[data-cart-drawer]')?.classList.remove('open');
  document.querySelector('[data-overlay]')?.classList.remove('open');
}

function showToast(text) {
  const toast = document.querySelector('[data-toast]');
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function productCard(p) {
  const inHtml = location.pathname.includes('/html/');
  const prefix = inHtml ? '../' : '';
  const productPage = inHtml ? 'Produto.html' : 'html/Produto.html';
  const imagePath = prefix + p.image;
  return `
    <article class="card" data-product-card data-category="${p.category}" data-name="${p.name.toLowerCase()}">
      <a class="card-media" href="${productPage}?id=${p.id}" aria-label="Ver ${p.name}">
        <span class="card-badge">${p.tag}</span>
        <img src="${imagePath}" alt="${p.name}" onerror="this.alt='Imagem indisponível'; this.style.opacity='.35'">
      </a>
      <div class="card-body">
        <span class="card-category">${p.category}</span>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="card-bottom">
          <span class="price">${money(p.price)}</span>
          <div class="card-actions">
            <a class="btn secondary mini-btn" href="${productPage}?id=${p.id}">Ver</a>
            <button class="btn mini-btn" type="button" data-add="${p.id}">Adicionar</button><button class="btn secondary mini-btn" type="button" data-favorite="${p.id}" aria-label="Favoritar ${p.name}">♡ Favoritar</button>
          </div>
        </div>
      </div>
    </article>`;
}

function initCatalog() {
  const grid = document.querySelector('[data-product-grid]');
  if (!grid) return;
  const initialCategory = document.body.dataset.category || 'Todos';
  const searchInput = document.querySelector('[data-search]');
  const sortSelect = document.querySelector('[data-sort]');
  const pills = [...document.querySelectorAll('[data-filter]')];

  function applyFilters() {
    const term = (searchInput?.value || '').trim().toLowerCase();
    const active = pills.find(p => p.classList.contains('active'))?.dataset.filter || initialCategory;
    let list = PRODUCTS.filter(p => (active === 'Todos' || p.category === active) && (p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)));
    const sort = sortSelect?.value;
    if (sort === 'menor') list.sort((a,b) => a.price - b.price);
    if (sort === 'maior') list.sort((a,b) => b.price - a.price);
    if (sort === 'nome') list.sort((a,b) => a.name.localeCompare(b.name));
    grid.innerHTML = list.length ? list.map(productCard).join('') : '<div class="empty" style="grid-column:1/-1"><strong>Nenhum produto encontrado</strong>Tente outro termo ou categoria.</div>';
  }

  searchInput?.addEventListener('input', applyFilters);
  sortSelect?.addEventListener('change', applyFilters);
  pills.forEach(p => p.addEventListener('click', () => {
    pills.forEach(x => x.classList.remove('active'));
    p.classList.add('active');
    applyFilters();
  }));
  applyFilters();
}

function initProductDetail() {
  const root = document.querySelector('[data-product-detail]');
  if (!root) return;

  const id = new URLSearchParams(location.search).get('id') || PRODUCTS[0].id;
  const p = PRODUCTS.find(product => product.id === id) || PRODUCTS[0];

  root.innerHTML = `
    <div class="product-gallery">
      <img src="../${p.image}" alt="${p.name}" onerror="this.style.opacity='.35'">
    </div>

    <div class="product-info">
      <span class="category">${p.category}</span>
      <h1>${p.name}</h1>
      <p class="description">${p.description}</p>
      <div class="detail-price">${money(p.price)}</div>

      <div class="detail-card">
        <div>
          <span>Categoria</span>
          <strong>${p.category}</strong>
        </div>
        <div>
          <span>Disponibilidade</span>
          <strong>Em estoque</strong>
        </div>
        <div>
          <span>Envio</span>
          <strong>Calculado no checkout</strong>
        </div>
      </div>

      <button class="btn" data-add="${p.id}" type="button">
        Adicionar ao carrinho
      </button>

      <button class="btn secondary" type="button" data-favorite="${p.id}">♡ Favoritar</button>

      <a href="../index.html"
         class="btn secondary"
         id="btn-voltar"
         style="margin-left:7px">
         ← Voltar
      </a>
    </div>
  `;

  document.title = `${p.name} — Essência Body Care`;

  // Voltar para a página anterior
  const btnVoltar = document.getElementById('btn-voltar');

  btnVoltar.addEventListener('click', function(event) {
    event.preventDefault();

    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '../index.html';
    }
  });
}

const ACCOUNT_KEY = 'essencia-account-demo';
const ORDERS_KEY = 'essencia-orders-demo';
const FAVORITES_KEY = 'essencia-favorites-demo';
function readDemo(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } }
function safeText(v) { return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function getFavorites() { return readDemo(FAVORITES_KEY, []); }
function toggleFavorite(id) {
  const favorites = getFavorites();
  const next = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  syncFavoriteButtons(); renderFavorites();
  showToast(next.includes(id) ? 'Adicionado aos favoritos.' : 'Removido dos favoritos.');
}
function syncFavoriteButtons() {
  document.querySelectorAll('[data-favorite]').forEach(btn => {
    const active = getFavorites().includes(btn.dataset.favorite);
    btn.textContent = active ? '♥ Favorito' : '♡ Favoritar';
    btn.setAttribute('aria-pressed', String(active));
  });
}
function renderFavorites() {
  const root = document.querySelector('[data-favorites-list]'); if (!root) return;
  const products = getFavorites().map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
  root.innerHTML = products.length ? products.map(p => `<article class="account-item"><div><strong>${safeText(p.name)}</strong><p>${money(p.price)} · ${safeText(p.category)}</p></div><div class="account-actions"><a class="btn secondary" href="Produto.html?id=${encodeURIComponent(p.id)}">Ver produto</a><button type="button" class="btn secondary" data-favorite="${p.id}">Remover</button></div></article>`).join('') : '<p class="muted">Você ainda não adicionou produtos aos favoritos.</p>';
  syncFavoriteButtons();
}
function initAccount() {
  const form = document.querySelector('[data-account-form]');
  if (form) {
    const saved = readDemo(ACCOUNT_KEY, {});
    ['nome','email','telefone','endereco','cidade','cep'].forEach(key => { if (form.elements[key]) form.elements[key].value = saved[key] || ''; });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(data));
      showToast('Dados salvos neste navegador.');
    });
  }
  const greeting = document.querySelector('[data-account-greeting]');
  if (greeting) greeting.textContent = readDemo(ACCOUNT_KEY, {}).nome || 'Bem-vinda à sua área';
  const ordersRoot = document.querySelector('[data-orders-list]');
  if (ordersRoot) {
    const orders = readDemo(ORDERS_KEY, []);
    ordersRoot.innerHTML = orders.length ? orders.map(o => `<article class="account-item"><div><strong>Pedido ${safeText(o.id)}</strong><p>${safeText(o.date)} · ${safeText(o.method)} · ${safeText(o.status)}</p><p>${o.items.map(i => `${safeText(i.name)} × ${i.qty}`).join(' · ')}</p></div><strong>${money(o.total)}</strong></article>`).join('') : '<p class="muted">Você ainda não tem compras demonstrativas.</p>';
  }
  renderFavorites();
}
function initCheckout() {
  const orderList = document.querySelector('[data-order-list]');
  const totalEl = document.querySelector('[data-checkout-total]');
  const form = document.querySelector('[data-checkout-form]');
  if (!orderList || !totalEl || !form) return;
  const cart = getCart();
  orderList.innerHTML = cart.length ? cart.map(item => {
    const product = PRODUCTS.find(p => p.id === item.id);
    return product ? `<div class="order-row"><span>${safeText(product.name)} × ${item.qty}</span><strong>${money(product.price * item.qty)}</strong></div>` : '';
  }).join('') : '<p class="muted">Seu carrinho está vazio.</p>';
  totalEl.textContent = money(cartTotals().total);
  const submit = form.querySelector('[type="submit"]'); if (submit) submit.disabled = !cart.length;
  const methods = form.querySelectorAll('[name="payment-method"]');
  function switchMethod() {
    const method = form.querySelector('[name="payment-method"]:checked')?.value || 'pix';
    form.querySelectorAll('[data-payment-panel]').forEach(panel => {
      const active = panel.dataset.paymentPanel === method;
      panel.hidden = !active;
      panel.querySelectorAll('input,select').forEach(input => input.disabled = !active);
    });
  }
  methods.forEach(input => input.addEventListener('change', switchMethod)); switchMethod();
  form.addEventListener('submit', e => {
    e.preventDefault(); if (!getCart().length || !form.reportValidity()) return;
    const method = form.querySelector('[name="payment-method"]:checked')?.value || 'pix';
    const labels = {pix:'Pix', boleto:'Boleto bancário', credito:'Cartão de crédito', debito:'Cartão de débito'};
    const items = getCart().map(i => { const product = PRODUCTS.find(p => p.id === i.id); return product ? {id:i.id,name:product.name,qty:i.qty,price:product.price} : null; }).filter(Boolean);
    const order = { id: String(Date.now()).slice(-8), date: new Date().toLocaleDateString('pt-BR'), method:labels[method], status:'Simulação — não pago', total:cartTotals().total, items };
    const orders = readDemo(ORDERS_KEY, []); orders.unshift(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    localStorage.removeItem(CART_KEY); updateCartBadge(); renderCartDrawer();
    location.href = 'MinhasCompras.html';
  });
}

function wireGlobalEvents() {
  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    if (add) { e.preventDefault(); addToCart(add.dataset.add); return; }
    const qty = e.target.closest('[data-qty]');
    if (qty) { changeQty(qty.dataset.qty, Number(qty.dataset.delta)); return; }
    const favorite = e.target.closest('[data-favorite]');
    if (favorite) { e.preventDefault(); toggleFavorite(favorite.dataset.favorite); return; }
    if (e.target.closest('[data-open-cart]')) { e.preventDefault(); openCart(); return; }
    if (e.target.closest('[data-close-cart]') || e.target.matches('[data-overlay]')) { closeCart(); return; }
  });

  updateCartBadge();
  renderCartDrawer();
  initCatalog();
  initProductDetail();
  initCheckout();
  initAccount();
  syncFavoriteButtons();
}

document.addEventListener('DOMContentLoaded', wireGlobalEvents);
