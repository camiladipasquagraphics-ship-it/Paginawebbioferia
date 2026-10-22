
'use strict';
const products=[
  {id:'vaso',name:'Vaso reutilizable',description:'Un vaso para acompañarte en nuevas experiencias.',price:12000},
  {id:'tote',name:'Tote bag',description:'Una bolsa liviana para llevar ideas a todas partes.',price:9500},
  {id:'llavero',name:'Llavero circular',description:'Una pequeña pieza inspirada en los ciclos.',price:4500},
  {id:'lapiz',name:'Lápiz plantable',description:'Cuando termina una historia, empieza otra.',price:3200},
  {id:'abanico',name:'Abanico plegable',description:'Un objeto práctico de edición especial.',price:7000}
];
const formatARS=n=>new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n);
const merchImage=product=>`<div class="merch-photo-holder"><img src="assets/merch/${product.id}.png" alt="${product.name}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="merch-placeholder" hidden>FOTO DEL<br>PRODUCTO<br><small>${product.name}</small></span></div>`;

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
    <div class="col-sm-6"><label class="choice-card"><input type="radio" name="ticketType" value="full"> <strong>Pase completo · 3 días</strong><small>Viví toda la experiencia.<br>${formatARS(28000)} por persona</small></label></div>
  </div>
  <div class="row g-3 mt-1">
    <div class="col-sm-6" id="dayColumn"><label class="field-label" for="ticketDay">Día de visita</label><select class="form-select" id="ticketDay"><option value="Viernes">Viernes (fecha a confirmar)</option><option value="Sábado">Sábado (fecha a confirmar)</option><option value="Domingo">Domingo (fecha a confirmar)</option></select></div>
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
  body.innerHTML=`<div class="row g-3 align-items-center"><div class="col-sm-5"><div class="merch-image" style="height:210px">${merchImage(selectedProduct)}</div></div><div class="col-sm-7"><p>${selectedProduct.description}</p><p><strong>Precio: ${formatARS(selectedProduct.price)}</strong></p><label for="merchQty" class="field-label">Cantidad</label><select id="merchQty" class="form-select">${Array.from({length:6},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('')}</select></div></div><div class="demo-summary" id="orderSummary"></div>`;
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

// reveal on scroll
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible'); observer.unobserve(entry.target);}}),{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

// nav shrink
const nav=document.getElementById('mainNav');
window.addEventListener('scroll',()=>nav?.classList.toggle('scrolled', window.scrollY>60), {passive:true});

document.querySelectorAll('#navbarLinks a').forEach(a=>a.addEventListener('click',()=>{
  const panel=document.getElementById('navbarLinks');
  if(panel?.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(panel).hide();
}));

// cursor halo
if(window.matchMedia('(hover:hover) and (pointer:fine)').matches){
  const cursor=document.getElementById('cursorHalo');
  document.addEventListener('pointermove',ev=>{cursor.style.left=ev.clientX+'px'; cursor.style.top=ev.clientY+'px'; cursor.style.opacity='1';}, {passive:true});
  document.querySelectorAll('.mask-reveal,.slogan-lockup').forEach(el=>{
    el.addEventListener('pointerenter',()=>cursor.classList.add('active'));
    el.addEventListener('pointerleave',()=>cursor.classList.remove('active'));
  });
}

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
    const palette=['rgba(255,255,255,.10)','rgba(0,54,254,.28)','rgba(172,236,0,.28)','rgba(255,255,255,.06)','rgba(0,54,254,.16)'];
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

  const canvas=document.getElementById('particleCanvas');
  if(canvas){
    const ctx=canvas.getContext('2d');
    let particles=[],w=0,h=0,tick=0,raf=0,active=false;
    function resize(){
      const rect=canvas.getBoundingClientRect();
      w=rect.width; h=rect.height;
      const dpr=Math.min(devicePixelRatio||1,2);
      canvas.width=Math.round(w*dpr); canvas.height=Math.round(h*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      const count=Math.min(180, Math.floor(w*h/3200));
      particles=Array.from({length:count}, (_,i)=>({angle:i*2.39996, radius:Math.sqrt((i+.5)/count)*Math.max(w,h)*.7, size:1.5+(i%4), speed:.3+i%7/14, color:i%4===0?'#acec00':(i%2===0?'#0036fe':'#ffffff')}));
    }
    function draw(){
      ctx.clearRect(0,0,w,h);
      const phase=(Math.sin(tick*.008)+1)/2;
      const expansion=.14+phase*.95;
      particles.forEach((p,i)=>{
        const jitter=Math.sin(tick*.014*p.speed+i)*7;
        const x=w/2+Math.cos(p.angle)*(p.radius*expansion+jitter);
        const y=h/2+Math.sin(p.angle)*(p.radius*expansion+jitter);
        ctx.globalAlpha=.18+(i%5)*.1;
        ctx.fillStyle=p.color;
        ctx.beginPath(); ctx.arc(x,y,p.size*(.85+phase*.45),0,Math.PI*2); ctx.fill();
      });
      ctx.globalAlpha=1;
      tick++;
      if(active) raf=requestAnimationFrame(draw);
    }
    resize();
    const io=new IntersectionObserver(entries=>{active=entries[0].isIntersecting; if(active){cancelAnimationFrame(raf); raf=requestAnimationFrame(draw);} else cancelAnimationFrame(raf);}, {threshold:.05});
    io.observe(canvas);
    window.addEventListener('resize',(()=>{let t; return ()=>{clearTimeout(t); t=setTimeout(()=>{resize(); if(active) draw();},150);};})(), {passive:true});
  }
})();
