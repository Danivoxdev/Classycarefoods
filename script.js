// Preloader
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('preloader').classList.add('hide'), 500);
});

// Year
document.getElementById('yr').textContent = new Date().getFullYear();

// Navbar scroll
const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// Mobile menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// Particles
const particles = document.getElementById('particles');
for (let i = 0; i < 18; i++) {
  const p = document.createElement('div');
  p.className = 'particle';
  p.style.left = Math.random() * 100 + '%';
  p.style.animationDuration = (10 + Math.random() * 14) + 's';
  p.style.animationDelay = (Math.random() * 10) + 's';
  p.style.width = p.style.height = (4 + Math.random() * 6) + 'px';
  p.style.opacity = 0.2 + Math.random() * 0.4;
  particles.appendChild(p);
}

// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Stats counter
const counterIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.target;
    const dur = 1800;
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.floor(target * eased);
      el.textContent = val.toLocaleString() + (target >= 1000 && t === 1 ? '+' : '');
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterIO.unobserve(el);
  });
}, { threshold: 0.4 });
document.querySelectorAll('.num').forEach(el => counterIO.observe(el));

// Slider
const slidesEl = document.getElementById('slides');
const slideCount = slidesEl.children.length;
const dotsEl = document.getElementById('dots');
let idx = 0;
for (let i = 0; i < slideCount; i++) {
  const b = document.createElement('button');
  b.className = 'dot' + (i === 0 ? ' active' : '');
  b.addEventListener('click', () => go(i));
  dotsEl.appendChild(b);
}
function go(i) {
  idx = (i + slideCount) % slideCount;
  slidesEl.style.transform = `translateX(-${idx * 100}%)`;
  dotsEl.querySelectorAll('.dot').forEach((d, k) => d.classList.toggle('active', k === idx));
}
document.getElementById('prev').addEventListener('click', () => go(idx - 1));
document.getElementById('next').addEventListener('click', () => go(idx + 1));
setInterval(() => go(idx + 1), 11000);

// Contact form — Formspree AJAX
async function handleContact(e) {
  e.preventDefault();
  const form = e.target;
  const note = document.getElementById('formNote');
  const btn = document.getElementById('contactSubmit');
  note.style.color = '';
  note.textContent = 'Sending your message…';
  btn.disabled = true;
  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      note.style.color = '#1f7a3a';
      note.textContent = '✓ Thank you! Your message has been sent. We will reach out within 24 hours.';
      form.reset();
    } else {
      const data = await res.json().catch(() => ({}));
      note.style.color = '#b00020';
      note.textContent = (data.errors && data.errors[0] && data.errors[0].message)
        ? '✗ ' + data.errors[0].message
        : '✗ Sorry, something went wrong. Please try again or reach us on WhatsApp.';
    }
  } catch {
    note.style.color = '#b00020';
    note.textContent = '✗ Network error. Please check your connection and try again.';
  } finally {
    btn.disabled = false;
    setTimeout(() => { note.textContent = ''; note.style.color=''; }, 9000);
  }
  return false;
}
window.handleContact = handleContact;

/* ===== Order Modal ===== */
const orderModal = document.getElementById('orderModal');
const sizeOpts = document.querySelectorAll('.size-opt');
const qtyInput = document.getElementById('qtyInput');
const sumItem = document.getElementById('sumItem');
const sumQty = document.getElementById('sumQty');
const sumTotal = document.getElementById('sumTotal');
let selected = null;

function fmt(n){return '₦' + n.toLocaleString()}
function updateSummary(){
  if(!selected){sumItem.textContent='—';sumTotal.textContent='₦0';return}
  const q = Math.max(1, parseInt(qtyInput.value)||1);
  sumItem.textContent = `${selected.product} (${selected.size})`;
  sumQty.textContent = q;
  sumTotal.textContent = fmt(selected.price * q);
}
function selectSize(btn){
  sizeOpts.forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  selected = { product: btn.dataset.product, size: btn.dataset.size, price: +btn.dataset.price };
  updateSummary();
}
sizeOpts.forEach(b=>b.addEventListener('click',()=>selectSize(b)));
document.getElementById('qtyMinus').addEventListener('click',()=>{qtyInput.value=Math.max(1,(+qtyInput.value||1)-1);updateSummary()});
document.getElementById('qtyPlus').addEventListener('click',()=>{qtyInput.value=(+qtyInput.value||1)+1;updateSummary()});
qtyInput.addEventListener('input',updateSummary);

function openOrder(presetBtn){
  orderModal.classList.add('open');
  document.body.style.overflow='hidden';
  if(presetBtn){
    const match = [...sizeOpts].find(o=>o.dataset.product===presetBtn.dataset.product);
    if(match) selectSize(match);
  }else if(!selected){selectSize(sizeOpts[0])}
  qtyInput.value=1;updateSummary();
}
function closeOrder(){orderModal.classList.remove('open');document.body.style.overflow=''}

document.querySelectorAll('.order-btn').forEach(btn=>{btn.addEventListener('click',()=>openOrder(btn))});
orderModal.querySelectorAll('[data-close]').forEach(el=>el.addEventListener('click',closeOrder));

document.getElementById('confirmOrder').addEventListener('click',()=>{
  if(!selected) return;
  const q = Math.max(1, parseInt(qtyInput.value)||1);
  const total = selected.price * q;
  const msg = `Hello Classy Care Foods 👋, I'd like to place an order for:\n\n• Product: Tombrown Cereal ${selected.product} (${selected.size})\n• Quantity: ${q}\n• Unit Price: ${fmt(selected.price)}\n• Total: ${fmt(total)}\n\nKindly share the payment and delivery details. Thank you!`;
  window.open(`https://wa.me/2347080033303?text=${encodeURIComponent(msg)}`,'_blank');
  closeOrder();
});

/* ===== Lightbox ===== */
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImage');
const lbStage = document.getElementById('lbStage');
const lbCounter = document.getElementById('lbCounter');
const galleryItems = [...document.querySelectorAll('#galleryGrid .g')];
const gallerySrcs = galleryItems.map(g=>g.dataset.full);
let lbIdx = 0;

function openLb(i){
  lbIdx = i;
  lbImg.src = gallerySrcs[i];
  lbCounter.textContent = `${i+1} / ${gallerySrcs.length}`;
  lbStage.classList.remove('zoomed');
  lb.classList.add('open');
  document.body.style.overflow='hidden';
}
function closeLb(){lb.classList.remove('open');document.body.style.overflow='';lbStage.classList.remove('zoomed')}
function lbGo(d){lbIdx=(lbIdx+d+gallerySrcs.length)%gallerySrcs.length;lbImg.src=gallerySrcs[lbIdx];lbCounter.textContent=`${lbIdx+1} / ${gallerySrcs.length}`;lbStage.classList.remove('zoomed')}

galleryItems.forEach((g,i)=>g.addEventListener('click',()=>openLb(i)));
document.querySelector('[data-lb-close]').addEventListener('click',closeLb);
document.getElementById('lbPrev').addEventListener('click',e=>{e.stopPropagation();lbGo(-1)});
document.getElementById('lbNext').addEventListener('click',e=>{e.stopPropagation();lbGo(1)});
document.getElementById('lbZoom').addEventListener('click',e=>{e.stopPropagation();lbStage.classList.toggle('zoomed')});
lbStage.addEventListener('click',()=>lbStage.classList.toggle('zoomed'));
lb.addEventListener('click',e=>{if(e.target===lb) closeLb()});

document.addEventListener('keydown',e=>{
  if(lb.classList.contains('open')){
    if(e.key==='Escape')closeLb();
    if(e.key==='ArrowLeft')lbGo(-1);
    if(e.key==='ArrowRight')lbGo(1);
  }
  if(orderModal.classList.contains('open') && e.key==='Escape')closeOrder();
});
