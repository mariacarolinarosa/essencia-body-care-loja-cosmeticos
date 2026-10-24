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
            <button class="btn mini-btn" type="button" data-add="${p.id}">Adicionar</button>
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

function initCheckout() {
  const orderList = document.querySelector('[data-order-list]');
  const totalEl = document.querySelector('[data-checkout-total]');
  if (!orderList || !totalEl) return;
  const cart = getCart();
  if (!cart.length) {
    orderList.innerHTML = '<div class="empty"><strong>Carrinho vazio</strong>Adicione algum item antes de finalizar.</div>';
    totalEl.textContent = money(0);
    return;
  }
  orderList.innerHTML = cart.map(item => {
    const p = PRODUCTS.find(x => x.id === item.id);
    return p ? `<div class="order-row"><span>${p.name} × ${item.qty}</span><strong>${money(p.price * item.qty)}</strong></div>` : '';
  }).join('');
  totalEl.textContent = money(cartTotals().total);

  document.querySelector('[data-checkout-form]')?.addEventListener('submit', e => {
    e.preventDefault();
    if (!cart.length) return;
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
    showToast('Pedido demonstrativo criado com sucesso.');
    setTimeout(() => location.href = '../index.html', 900);
  });
}

function wireGlobalEvents() {
  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    if (add) { e.preventDefault(); addToCart(add.dataset.add); return; }
    const qty = e.target.closest('[data-qty]');
    if (qty) { changeQty(qty.dataset.qty, Number(qty.dataset.delta)); return; }
    if (e.target.closest('[data-open-cart]')) { e.preventDefault(); openCart(); return; }
    if (e.target.closest('[data-close-cart]') || e.target.matches('[data-overlay]')) { closeCart(); return; }
  });

  updateCartBadge();
  renderCartDrawer();
  initCatalog();
  initProductDetail();
  initCheckout();
}

document.addEventListener('DOMContentLoaded', wireGlobalEvents);
