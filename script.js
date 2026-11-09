
'use strict';

// Reserve the fixed footer's actual height, including wrapped links on small screens.
(() => {
  const footer=document.querySelector('.site-footer');
  if(!footer)return;
  const updateFooterHeight=()=>document.documentElement.style.setProperty('--footer-height',`${Math.ceil(footer.getBoundingClientRect().height)}px`);
  updateFooterHeight();
  if('ResizeObserver' in window)new ResizeObserver(updateFooterHeight).observe(footer);
  else window.addEventListener('resize',updateFooterHeight,{passive:true});
})();

const products=[
  {id:'vaso',name:'Vaso reutilizable',description:'Un vaso para acompañarte en nuevas experiencias.',price:12000},
  {id:'tote',name:'Bolsa de malla',description:'Una bolsa reutilizable para acompañarte todos los días.',price:9500},
  {id:'llavero',name:'Llavero circular',description:'Una pequeña pieza inspirada en los ciclos.',price:4500},
  {id:'remera',name:'Remera oficial',description:'Dos diseños para llevar el espíritu de Bioferia con vos.',price:18000},
  {id:'abanico',name:'Abanico plegable',description:'Un objeto práctico de edición especial.',price:7000}
];
const formatARS=n=>new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n);
const merchViews={vaso:['Turquesa','Verde lima'],tote:['Colección de colores','En uso'],llavero:['Turquesa','Verde lima'],remera:['Azul y lima','Blanca y turquesa'],abanico:['Azul y turquesa','Verde lima']};
const merchSelection=Object.fromEntries(products.map(p=>[p.id,0]));
const merchImage=product=>{
  const index=merchSelection[product.id];
  return `<div class="merch-photo-holder merch-viewer" data-product-view="${product.id}" role="group" aria-label="Fotos de ${product.name}">
    <button type="button" class="merch-zoom" aria-label="Ampliar imagen de ${product.name}"><img src="assets/merch/${product.id}-${index+1}.png" alt="${product.name}: ${merchViews[product.id][index]}" loading="lazy" decoding="async"></button>
    <button type="button" class="merch-photo-arrow merch-photo-prev" data-merch-step="-1" aria-label="Ver foto anterior de ${product.name}">←</button>
    <button type="button" class="merch-photo-arrow merch-photo-next" data-merch-step="1" aria-label="Ver foto siguiente de ${product.name}">→</button>
    <span class="merch-view-label" aria-live="polite">${merchViews[product.id][index]} · ${index+1}/2</span>
  </div>`;
};
// Keep the same view in the card and the product detail.
document.addEventListener('click',event=>{
  const arrow=event.target.closest('[data-merch-step]');if(!arrow)return;
  const viewer=arrow.closest('[data-product-view]');const id=viewer.dataset.productView;
  const index=(merchSelection[id]+Number(arrow.dataset.merchStep)+2)%2;
  merchSelection[id]=index;
  document.querySelectorAll(`[data-product-view="${id}"]`).forEach(view=>{
    const img=view.querySelector('img');img.src=`assets/merch/${id}-${index+1}.png`;
    img.alt=`${products.find(p=>p.id===id).name}: ${merchViews[id][index]}`;
    view.querySelector('.merch-view-label').textContent=`${merchViews[id][index]} · ${index+1}/2`;
  });
});
const grid=document.getElementById('merchGrid');
if(grid){
  grid.innerHTML=products.map(p=>`<div class="col reveal"><article class="merch-card"><div class="merch-image">${merchImage(p)}</div><div class="merch-info"><h3>${p.name}</h3><p>${p.description}</p><button type="button" data-merch-id="${p.id}">Explorar <span>↗</span></button></div></article></div>`).join('');
}

const purchaseModal=document.getElementById('purchaseModal');
const modal=purchaseModal?new bootstrap.Modal(purchaseModal):null;
const title=document.getElementById('purchaseTitle');
const body=document.getElementById('purchaseBody');
const kicker=document.getElementById('purchaseKicker');
const confirmBtn=document.getElementById('confirmSelection');
let mode='tickets', selectedProduct=null;

function openTickets(){
  mode='tickets';
  title.textContent='Elegí tu entrada';
  kicker.textContent='ENTRADAS / BIOFERIA 2027';
  confirmBtn.style.display='';
  confirmBtn.textContent='Continuar ↗';
  body.innerHTML=`<p>Elegí el tipo de pase y cuántas personas van a asistir.</p>
  <div class="row g-2">
    <div class="col-sm-6"><label class="choice-card"><input type="radio" name="ticketType" value="day" checked> <strong>Pase por un día</strong><small>Elegí un día del festival.<br>${formatARS(12000)} por persona</small></label></div>
    <div class="col-sm-6"><label class="choice-card"><input type="radio" name="ticketType" value="full"> <strong>Pase completo · 3 días</strong><small>Volvé para descubrir distintos invitados y agendas.<br>${formatARS(28000)} por persona</small></label></div>
  </div>
  <div class="row g-3 mt-1">
    <div class="col-sm-6" id="dayColumn"><label class="field-label" for="ticketDay">Día de visita</label><select class="form-select" id="ticketDay"><option value="Viernes 9 de abril de 2027">Viernes 9 de abril de 2027</option><option value="Sábado 10 de abril de 2027">Sábado 10 de abril de 2027</option><option value="Domingo 11 de abril de 2027">Domingo 11 de abril de 2027</option></select></div>
    <div class="col-sm-6"><label class="field-label" for="ticketQty">Cantidad de personas</label><select class="form-select" id="ticketQty">${Array.from({length:8},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('')}</select></div>
  </div><div class="demo-summary" id="orderSummary"></div>`;
  body.onchange=updateSummary; updateSummary(); modal.show();
}

function openMerch(id){
  selectedProduct=products.find(p=>p.id===id); if(!selectedProduct) return;
  mode='merch';
  title.textContent=selectedProduct.name;
  kicker.textContent='MERCH EXCLUSIVO';
  confirmBtn.style.display='';
  confirmBtn.textContent='Continuar ↗';
  body.innerHTML=`<div class="row g-3 align-items-center"><div class="col-sm-5"><div class="merch-image merch-detail-image">${merchImage(selectedProduct)}</div></div><div class="col-sm-7"><p>${selectedProduct.description}</p><p><strong>Precio: ${formatARS(selectedProduct.price)}</strong></p><label for="merchQty" class="field-label">Cantidad</label><select id="merchQty" class="form-select">${Array.from({length:6},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('')}</select></div></div><div class="demo-summary" id="orderSummary"></div>`;
  body.onchange=updateSummary; updateSummary(); modal.show();
}

function updateSummary(){
  const summary=document.getElementById('orderSummary'); if(!summary) return;
  if(mode==='tickets'){
    const type=body.querySelector('input[name="ticketType"]:checked')?.value||'day';
    const qty=Number(document.getElementById('ticketQty')?.value||1);
    const dayColumn=document.getElementById('dayColumn');
    if(dayColumn) dayColumn.style.display=type==='day'?'':'none';
    const total=(type==='day'?12000:28000)*qty;
    const label=type==='day'?'Pase por un día':'Pase completo · 3 días';
    const note=type==='day'?document.getElementById('ticketDay').value:'Acceso a los tres días';
    summary.innerHTML=`<div class="d-flex justify-content-between gap-3"><span>${label} × ${qty}</span><strong>${formatARS(total)}</strong></div><small>${note}</small>`;
  } else {
    const qty=Number(document.getElementById('merchQty')?.value||1);
    summary.innerHTML=`<div class="d-flex justify-content-between gap-3"><span>${selectedProduct.name} × ${qty}</span><strong>${formatARS(selectedProduct.price*qty)}</strong></div><small>Edición exclusiva Bioferia.</small>`;
  }
}

document.querySelectorAll('[data-ticket-open]').forEach(btn=>btn.addEventListener('click',openTickets));
grid?.addEventListener('click',ev=>{const btn=ev.target.closest('[data-merch-id]'); if(btn) openMerch(btn.dataset.merchId);});
confirmBtn?.addEventListener('click',()=>{
  const desc=mode==='tickets'?(body.querySelector('input[name="ticketType"]:checked')?.value==='day'?'Pase por un día':'Pase completo de tres días'):selectedProduct.name;
  body.innerHTML=`<div class="demo-result"><h3>¡TU SELECCIÓN!</h3><p>Seleccionaste: <strong>${desc}</strong>.</p><p>Gracias por explorar las propuestas de Bioferia.</p><button class="btn btn-primary-custom" type="button" data-bs-dismiss="modal">Seguir explorando ↗</button></div>`;
  confirmBtn.style.display='none';
});

// Scroll reveals are managed by animations.js; content stays visible if it cannot load.

// nav shrink
const nav=document.getElementById('mainNav');
window.addEventListener('scroll',()=>nav?.classList.toggle('scrolled', window.scrollY>60), {passive:true});

// Highlight the chosen section, then follow the reader's position while scrolling.
(() => {
  const links=[...document.querySelectorAll('#navbarLinks .nav-link[href^="#"]')];
  const sections=links.map(link=>document.getElementById(link.hash.slice(1)));
  let frame=0,selected=null,selectionTimer=0;
  function activate(id){
    links.forEach(link=>{
      if(link.hash===`#${id}`)link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
  }
  function update(){
    frame=0;
    if(selected)return;
    const offset=(nav?.getBoundingClientRect().height||74)+48;
    let current=null;
    sections.forEach(section=>{if(section && section.getBoundingClientRect().top<=offset)current=section.id;});
    activate(current);
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update);}
  function release(){clearTimeout(selectionTimer);selected=null;schedule();}
  document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',()=>{
    const id=link.hash.slice(1);
    if(!sections.some(section=>section?.id===id))return;
    selected=id;activate(id);
    clearTimeout(selectionTimer);
    selectionTimer=setTimeout(release,1800);
  }));
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('wheel',release,{passive:true});
  window.addEventListener('touchstart',release,{passive:true});
  window.addEventListener('pageshow',schedule);
  update();
})();

document.querySelectorAll('#navbarLinks a').forEach(a=>a.addEventListener('click',()=>{
  const panel=document.getElementById('navbarLinks');
  if(panel?.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(panel).hide();
}));

// Halo de luz con seguimiento suave, solo con mouse y movimiento habilitado.
const reducedMotion=window.matchMedia('(prefers-reduced-motion:reduce)');
if(window.matchMedia('(hover:hover) and (pointer:fine)').matches && !reducedMotion.matches){
  const cursor=document.getElementById('cursorHalo');
  let x=0,y=0,targetX=0,targetY=0,frame=0;
  cursor.style.left='0';cursor.style.top='0';
  function follow(){
    x+=(targetX-x)*.12;y+=(targetY-y)*.12;
    cursor.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
    if(Math.abs(targetX-x)+Math.abs(targetY-y)>.2) frame=requestAnimationFrame(follow);else frame=0;
  }
  document.addEventListener('pointermove',ev=>{
    targetX=ev.clientX;targetY=ev.clientY;
    if(!cursor.style.opacity || cursor.style.opacity==='0'){x=targetX;y=targetY;}
    cursor.style.opacity='1';if(!frame) frame=requestAnimationFrame(follow);
  },{passive:true});
  document.documentElement.addEventListener('pointerleave',()=>{cursor.style.opacity='0';});
  window.addEventListener('blur',()=>{cursor.style.opacity='0';});
}
// Keep the final two words together, including text spanning inline emphasis.
// CSS balances the remaining lines; nonbreaking spaces prevent single-word endings.
function preventWidows(root){
  root.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,figcaption,.accordion-body,.accordion-button').forEach(element=>{
    if(element.closest('[aria-hidden="true"]'))return;
    const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT,{
      acceptNode:node=>node.parentElement.closest('[aria-hidden="true"]')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT
    });
    const nodes=[];let node;
    while((node=walker.nextNode()))nodes.push(node);
    const text=nodes.map(part=>part.data).join('');
    const ending=text.match(/(\S+)([ \t]+)(\S+)\s*$/);
    if(!ending)return;
    let offset=ending.index+ending[1].length;
    for(const part of nodes){
      if(offset<part.length){
        if(offset+ending[2].length<=part.length)part.replaceData(offset,ending[2].length,'\u00a0');
        break;
      }
      offset-=part.length;
    }
  });
}
preventWidows(document);
if(purchaseModal)new MutationObserver(()=>preventWidows(purchaseModal)).observe(purchaseModal,{childList:true,subtree:true});

// Mask overlay for headings
function attachMask(node){
  if(!node || node.querySelector('.mask-reveal-layer')) return;
  const layer=document.createElement('span');
  layer.className='mask-reveal-layer';
  layer.setAttribute('aria-hidden','true');
  layer.innerHTML=node.innerHTML;
  node.appendChild(layer);
  node.addEventListener('pointermove',ev=>{
    const r=node.getBoundingClientRect();
    node.style.setProperty('--mask-x', `${ev.clientX-r.left}px`);
    node.style.setProperty('--mask-y', `${ev.clientY-r.top}px`);
  }, {passive:true});
}
document.querySelectorAll('.mask-reveal').forEach(attachMask);
const slogan=document.querySelector('.slogan-lockup');
slogan?.addEventListener('pointermove',ev=>{
  const r=slogan.getBoundingClientRect();
  slogan.style.setProperty('--mask-x', `${ev.clientX-r.left}px`);
  slogan.style.setProperty('--mask-y', `${ev.clientY-r.top}px`);
},{passive:true});


const contactForm=document.getElementById('contactForm');
contactForm?.addEventListener('submit',event=>{
  event.preventDefault();
  if(!contactForm.reportValidity())return;
  const values=new FormData(contactForm);
  const message=[...values.entries()].map(([key,value])=>`${key}: ${value}`).join('\n');
  const subject=encodeURIComponent(`Consulta ${values.get('Tipo de consulta')} · Bioferia`);
  const body=encodeURIComponent(message);
  window.location.href=`mailto:comercial@bioferia.info?subject=${subject}&body=${body}`;
  document.getElementById('contactStatus').textContent='Se abrió tu aplicación de correo para que revises y envíes la consulta.';
});

// hero particles
(function(){
  const hero=document.getElementById('heroParticles');
  if(hero){
    const frag=document.createDocumentFragment();
    for(let i=0;i<42;i++){
      const dot=document.createElement('span');
      dot.style.cssText=`--size:${2+(i%4)*2}px;--x:${(i*29.7)%100}%;--y:${(i*17.1)%100}%;--opacity:${.08+(i%5)*.07};--duration:${3.6+(i%4)*1.1}s;--delay:${-i*.2}s;--dx:${(i%2?1:-1)*(8+i%3*12)}px;--dy:${(i%3-1)*(18+i%2*10)}px`;
      frag.append(dot);
    }
    hero.append(frag);
  }

  const field=document.getElementById('circleField');
  if(field){
    const palette=['rgba(255,255,255,.10)','rgba(150,0,255,.28)','rgba(172,236,0,.28)','rgba(255,255,255,.06)','rgba(150,0,255,.16)'];
    const positions=[[8,76],[18,34],[32,62],[48,20],[56,78],[68,40],[82,22],[88,68],[96,36],[24,6],[74,88],[46,48]];
    function build(){
      const frag=document.createDocumentFragment();
      positions.forEach((pos,i)=>{
        const c=document.createElement('span');
        const size=Math.max(window.innerWidth,window.innerHeight)*(0.15+(i%4)*0.03);
        c.style.setProperty('--x', pos[0]+'%');
        c.style.setProperty('--y', pos[1]+'%');
        c.style.setProperty('--size', size+'px');
        c.style.setProperty('--scale', (4.8+(i%5)*1.0).toFixed(2));
        c.style.setProperty('--duration', (7+(i%4)*1.2)+'s');
        c.style.setProperty('--delay', (-i*.55)+'s');
        c.style.setProperty('--color', palette[i%palette.length]);
        frag.append(c);
      });
      field.replaceChildren(frag);
    }
    build();
    window.addEventListener('resize',(()=>{let t; return ()=>{clearTimeout(t); t=setTimeout(build,150);};})(), {passive:true});
  }

  // The circle pattern is driven by the shared GSAP ticker in animations.js.
})();

// Automatic event gallery: a new image every 3.5 seconds.
(()=>{
  const gallery=document.querySelector('.event-gallery');if(!gallery)return;
  const slides=[...gallery.querySelectorAll('.gallery-slide')];
  const dots=[...gallery.querySelectorAll('[data-gallery-index]')];
  let current=0,timer=null,visible=false;
  function show(index){
    current=(index+slides.length)%slides.length;
    slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===current);slide.setAttribute('aria-hidden',String(i!==current));});
    dots.forEach((dot,i)=>{if(i===current)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current');});
  }
  function schedule(){
    clearInterval(timer);timer=null;
    if(visible && !document.hidden && !reducedMotion.matches)timer=setInterval(()=>show(current+1),3500);
  }
  gallery.querySelector('[data-gallery-prev]').addEventListener('click',()=>{show(current-1);schedule();});
  gallery.querySelector('[data-gallery-next]').addEventListener('click',()=>{show(current+1);schedule();});
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>{show(i);schedule();}));
  document.addEventListener('visibilitychange',schedule);
  reducedMotion.addEventListener('change',schedule);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.15}).observe(gallery);
  slides.forEach(slide=>slide.addEventListener('error',()=>{slide.src='assets/evento-bioferia.jpg';},{once:true}));
})();

// Native modal dialog keeps keyboard focus inside the full-screen viewer.
(()=>{
  const dialog=document.getElementById('merchLightbox');
  const image=document.getElementById('lightboxImage');
  const caption=document.getElementById('lightboxCaption');
  let product=null,previousOverflow='';
  const sizeButton=dialog.querySelector('.lightbox-size');
  function resetSize(){dialog.classList.remove('original-size');sizeButton.textContent='Ver al 100 %';sizeButton.setAttribute('aria-pressed','false');}
  sizeButton.addEventListener('click',()=>{const original=dialog.classList.toggle('original-size');sizeButton.textContent=original?'Ajustar a pantalla':'Ver al 100 %';sizeButton.setAttribute('aria-pressed',String(original));});
  function render(){
    resetSize();
    const index=merchSelection[product.id];
    image.src=`assets/merch/${product.id}-${index+1}.png`;
    image.alt=`${product.name}: ${merchViews[product.id][index]}`;
    caption.textContent=`${product.name} · ${merchViews[product.id][index]} · ${index+1}/2`;
  }
  function step(){
    // Reuse card controls to keep all views synchronized.
    const control=document.querySelector(`[data-product-view="${product.id}"] [data-merch-step="1"]`);
    control.click();render();
  }
  document.addEventListener('click',event=>{
    const zoom=event.target.closest('.merch-zoom');if(!zoom)return;
    product=products.find(p=>p.id===zoom.closest('[data-product-view]').dataset.productView);
    render();previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';dialog.showModal();
  });
  dialog.querySelector('.lightbox-close').addEventListener('click',()=>dialog.close());
  dialog.querySelector('.lightbox-prev').addEventListener('click',step);
  dialog.querySelector('.lightbox-next').addEventListener('click',step);
  dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();step();}});
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  dialog.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;image.removeAttribute('src');});
})();
