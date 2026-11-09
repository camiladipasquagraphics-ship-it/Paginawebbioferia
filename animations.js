'use strict';

// Progressive enhancement: no hidden content or scroll interception without GSAP.
(() => {
  const { gsap, ScrollTrigger, Lenis } = window;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const media = gsap.matchMedia();
  media.add({
    desktop: '(min-width: 992px) and (hover: hover) and (pointer: fine)',
    mobile: '(max-width: 991px), (hover: none), (pointer: coarse)',
    reduce: '(prefers-reduced-motion: reduce)'
  }, context => {
    const { desktop, reduce } = context.conditions;
    if (reduce) return;

    const distance = desktop ? 32 : 16;
    const duration = desktop ? 0.85 : 0.55;
    const cleanups = [];
    const motionLoops = new Map();
    const listen = (target, event, handler, options) => {
      target.addEventListener(event, handler, options);
      cleanups.push(() => target.removeEventListener(event, handler, options));
    };
    let lenis;
    if (desktop && Lenis) {
      lenis = new Lenis({
        autoRaf: false,
        duration: 1.05,
        smoothWheel: true,
        syncTouch: false,
        anchors: { offset: -86 },
        prevent: node => !!node.closest('.modal, .merch-lightbox, #navbarLinks.show')
      });
      lenis.on('scroll', ScrollTrigger.update);
      const tick = seconds => lenis.raf(seconds * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // Bootstrap and the native image dialog retain their own scrolling.
      const syncScrollLock = () => {
        if (document.hidden || document.body.classList.contains('modal-open') ||
            document.querySelector('dialog[open]')) lenis.stop();
        else lenis.start();
      };
      const dialogObserver = new MutationObserver(syncScrollLock);
      dialogObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
      document.querySelectorAll('dialog').forEach(dialog =>
        dialogObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] }));
      listen(document, 'shown.bs.modal', syncScrollLock);
      listen(document, 'hidden.bs.modal', syncScrollLock);
      listen(document, 'visibilitychange', syncScrollLock);
      syncScrollLock();
      cleanups.push(() => {
        dialogObserver.disconnect();
        gsap.ticker.remove(tick);
        lenis.destroy();
      });
    }

    // Preserve the existing branded opening; reveal the hero as its curtain lifts.
    // Deep links and restored scroll positions must not wait for an entrance.
    const atTop = window.scrollY < 80 && !location.hash;
    const hero = gsap.timeline({
      delay: atTop ? (desktop ? 1.35 : 0.6) : 0,
      defaults: { duration, ease: 'power3.out', clearProps: 'transform,opacity' }
    });
    hero.from('.hero-content > *', { opacity: 0, y: distance, stagger: 0.09 })
      .from('.hero-visual', { opacity: 0, scale: 0.92, clearProps: 'transform,opacity' }, 0.12)
      .from('.hero-bottom', { opacity: 0, y: 12 }, 0.35);

    // Related cards share a subtle stagger; completed entrances release inline styles.
    document.querySelectorAll('.reveal:not(.hero-content)').forEach(element => {
      const siblings = [...element.parentElement.children].filter(node => node.classList.contains('reveal'));
      const delay = desktop && siblings.length > 1 ? Math.min(siblings.indexOf(element), 3) * 0.07 : 0;
      gsap.from(element, {
        opacity: 0, y: distance, duration, delay, ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: element, start: 'top 94%', once: true }
      });
    });

    // Animate existing text blocks without splitting or duplicating accessible text.
    document.querySelectorAll('main .display-heading, .statement-text').forEach(heading => {
      gsap.fromTo(heading, { clipPath: 'inset(0 0 100% 0)' }, {
        clipPath: 'inset(0 0 0% 0)', duration: desktop ? 1 : 0.65,
        ease: 'power3.inOut', clearProps: 'clipPath',
        scrollTrigger: { trigger: heading, start: 'top 94%', once: true }
      });
    });

    document.querySelectorAll('.gallery-slides, .feature-photo, #merchGrid .merch-photo-holder').forEach(image => {
      gsap.from(image, {
        scale: desktop ? 1.08 : 1.035, opacity: 0,
        duration: desktop ? 1.1 : 0.65, ease: 'power2.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: image, start: 'top 94%', once: true }
      });
    });
    const gallery = document.querySelector('.gallery-slides');
    if (gallery && desktop) gsap.from(gallery, {
      clipPath: 'inset(0 0 100% 0)', duration: 1.15, ease: 'power3.inOut',
      clearProps: 'clipPath',
      scrollTrigger: { trigger: gallery, start: 'top 94%', once: true }
    });

    // Scrub only decorative layers on desktop; no pinned sections or layout shifts.
    if (desktop) {
      gsap.to('.hero-motion', {
        y: 70, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 }
      });
      document.querySelectorAll('.statement-circles, .program-circles').forEach(layer => {
        gsap.fromTo(layer.children, { y: -28 }, {
          y: 28, stagger: 0.08, ease: 'none',
          scrollTrigger: { trigger: layer.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
        });
      });
    }

    // Reference 1: a green seed opens into radial dots and rounded strokes.
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
      const burst = document.createElement('div');
      burst.className = 'reference-burst';
      burst.setAttribute('aria-hidden', 'true');
      const core = document.createElement('span');
      core.className = 'burst-core';
      burst.append(core);
      const count = desktop ? 12 : 8;
      const radius = desktop ? 190 : 115;
      const rays = Array.from({ length: count }, (_, index) => {
        const ray = document.createElement('span');
        ray.className = `burst-ray${index % 3 === 0 ? ' burst-stroke' : ''}`;
        burst.append(ray);
        return ray;
      });
      heroVisual.append(burst);
      const angle = index => index * Math.PI * 2 / count - Math.PI / 2;
      const radial = gsap.timeline({ id: 'bioferia-radial-burst', paused: true, repeat: -1, repeatDelay: 0.65 });
      radial.set(rays, { x: 0, y: 0, scale: 0, opacity: 0, rotation: index => angle(index) * 180 / Math.PI + 90 })
        .fromTo(core, { scale: 0.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, ease: 'power2.out' })
        .to(core, { scale: 0.2, opacity: 0, duration: 0.3 }, '+=0.25')
        .to(rays, {
          x: index => Math.cos(angle(index)) * radius * 0.4,
          y: index => Math.sin(angle(index)) * radius * 0.4,
          scale: 1, opacity: 0.95, duration: 0.6, stagger: 0.025, ease: 'power2.out'
        }, '<')
        .to(rays, {
          x: index => Math.cos(angle(index)) * radius,
          y: index => Math.sin(angle(index)) * radius,
          scale: index => index % 3 === 0 ? 0.65 : 0.85,
          duration: 0.95, ease: 'sine.inOut'
        })
        .to(rays, { x: 0, y: 0, scale: 0, opacity: 0, duration: 0.8, stagger: 0.018, ease: 'power2.inOut' }, '+=0.2');
      motionLoops.set(heroVisual, radial);
      cleanups.push(() => burst.remove());
    }

    // Reference 2: a seamless circle grid zooms between large and dense dots.
    // One repeated canvas tile avoids hundreds of animated DOM elements.
    const canvas = document.getElementById('particleCanvas');
    const canvasContext = canvas?.getContext('2d');
    if (canvasContext) {
      const tile = document.createElement('canvas');
      tile.width = tile.height = 64;
      const tileContext = tile.getContext('2d');
      tileContext.fillStyle = '#acec00';
      tileContext.beginPath();
      tileContext.arc(32, 32, 30, 0, Math.PI * 2);
      tileContext.fill();
      const pattern = canvasContext.createPattern(tile, 'repeat');
      const state = { step: 110 };
      let width = 0, height = 0, dpr = 1;
      function paintGrid() {
        canvasContext.setTransform(dpr, 0, 0, dpr, 0, 0);
        canvasContext.clearRect(0, 0, width, height);
        canvasContext.save();
        canvasContext.translate(width / 2, height / 2);
        pattern.setTransform(new DOMMatrix().scale(state.step / 64));
        canvasContext.fillStyle = pattern;
        canvasContext.globalAlpha = desktop ? 0.16 : 0.12;
        canvasContext.fillRect(-width / 2, -height / 2, width, height);
        canvasContext.restore();
      }
      function resizeGrid() {
        const rect = canvas.getBoundingClientRect();
        width = rect.width; height = rect.height;
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        paintGrid();
      }
      resizeGrid();
      const grid = gsap.timeline({ id: 'bioferia-circle-grid', paused: true, repeat: -1, onUpdate: paintGrid });
      grid.to(state, { step: desktop ? 300 : 180, duration: 2.4, ease: 'sine.inOut' })
        .to(state, { step: 64, duration: 2.4, ease: 'power2.inOut' })
        .to(state, { step: desktop ? 22 : 36, duration: 2.4, ease: 'sine.inOut' })
        .to(state, { step: 110, duration: 2.4, ease: 'power2.inOut' });
      motionLoops.set(canvas, grid);
      const resizeObserver = new ResizeObserver(resizeGrid);
      resizeObserver.observe(canvas);
      cleanups.push(() => {
        resizeObserver.disconnect();
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      });
    }

    // Pause both GSAP and CSS loops outside the viewport and in background tabs.
    const decorations = [...document.querySelectorAll('.hero-particles, .hero-motion, .visual-disc, .marquee-track, .circle-field')];
    const visible = new Set();
    const syncLoops = () => {
      decorations.forEach(node => node.classList.toggle('motion-paused', document.hidden || !visible.has(node)));
      motionLoops.forEach((timeline, node) => timeline.paused(document.hidden || !visible.has(node)));
    };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
      syncLoops();
    });
    decorations.forEach(node => observer.observe(node));
    motionLoops.forEach((_, node) => observer.observe(node));
    listen(document, 'visibilitychange', syncLoops);

    // Fonts, lazy images and accordion changes can move trigger positions.
    const refresh = gsap.delayedCall(0.15, () => {
      lenis?.resize();
      ScrollTrigger.refresh();
    }).pause();
    const scheduleRefresh = () => refresh.restart(true);
    document.querySelectorAll('main img').forEach(image => {
      if (!image.complete) {
        listen(image, 'load', scheduleRefresh, { once: true });
        listen(image, 'error', scheduleRefresh, { once: true });
      }
    });
    listen(document, 'shown.bs.collapse', scheduleRefresh);
    listen(document, 'hidden.bs.collapse', scheduleRefresh);
    listen(window, 'pageshow', scheduleRefresh);
    let disposed = false;
    document.fonts?.ready.then(() => { if (!disposed) scheduleRefresh(); });
    scheduleRefresh();

    return () => {
      disposed = true;
      refresh.kill();
      observer.disconnect();
      decorations.forEach(node => node.classList.remove('motion-paused'));
      cleanups.forEach(cleanup => cleanup());
    };
  });
})();
