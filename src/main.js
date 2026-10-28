import './style.scss';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ---------- Preloader ----------
const preloader = document.querySelector('#preloader');
if (preloader) {
  const logo = preloader.querySelector('.preloader-logo');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('preloading');

  if (reduceMotion) {
    preloader.classList.add('done');
    preloader.style.display = 'none';
    document.body.classList.remove('preloading');
  } else {
    const tl = gsap.timeline({
      defaults: { ease: 'cubic-bezier(0.76, 0, 0.24, 1)' },
      onComplete: () => {
        preloader.classList.add('done');
        preloader.style.display = 'none';
        document.body.classList.remove('preloading');
      },
    });
    tl.to(logo, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, filter: 'blur(0px)', duration: 0.9 })
      .to(logo, { duration: 0.5 }) // hold once revealed
      .to(preloader, { opacity: 0, scale: 1.02, transformOrigin: '50% 50%', duration: 0.6 });
  }
}

// Mobile navigation toggle
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
toggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => nav.classList.remove('open')),
);

// Entrance animation
gsap.from('.brand', { y: -24, opacity: 0, duration: 0.7, ease: 'power3.out' });
gsap.from('.site-nav a, .menu-icon', { y: -16, opacity: 0, stagger: 0.06, duration: 0.6, delay: 0.15 });
gsap.from('.hero-hello', { x: -20, opacity: 0, duration: 0.7, delay: 0.35 });
gsap.from('.hero-headline .line-1', { y: 70, opacity: 0, duration: 0.9, ease: 'power4.out', delay: 0.3 });
gsap.from('.hero-headline .line-2', { y: 70, opacity: 0, duration: 0.9, ease: 'power4.out', delay: 0.48 });
gsap.from('.pill-img', { scale: 0.6, opacity: 0, duration: 0.8, ease: 'back.out(1.6)', delay: 0.85 });
gsap.from('.hero-copy', { y: 24, opacity: 0, duration: 0.8, delay: 0.75 });

// ---------- Services carousel ----------
const track = document.querySelector('#services-track');
if (track) {
  // ----- Snap helpers -----
  const getStep = () => {
    const card = track.querySelector('.svc-card');
    if (!card) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  };
  const getMax = () => Math.max(0, track.scrollWidth - track.clientWidth);
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const currentIndex = () => {
    const step = getStep();
    return step > 0 ? Math.round(track.scrollLeft / step) : 0;
  };

  let snapping = false;
  const snapTo = (index, duration = 0.6) => {
    const step = getStep();
    const target = clamp(index * step, 0, getMax());
    snapping = true;
    gsap.killTweensOf(track);
    gsap.to(track, {
      scrollLeft: target,
      duration,
      ease: 'cubic-bezier(0.76, 0, 0.24, 1)',
      onComplete: () => { snapping = false; },
    });
  };
  const snapToNearest = () => snapTo(currentIndex());

  // Draggable (mouse + touch)
  let isDown = false;
  let startX = 0;
  let startScroll = 0;
  track.style.cursor = 'grab';
  track.style.touchAction = 'pan-y'; // allow vertical page scroll, capture horizontal drags
  track.addEventListener('pointerdown', (e) => {
    isDown = true;
    startX = e.pageX;
    startScroll = track.scrollLeft;
    track.style.cursor = 'grabbing';
    gsap.killTweensOf(track);
    snapping = false;
  });
  window.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    track.scrollLeft = startScroll - (e.pageX - startX);
  });
  const endDrag = () => {
    if (!isDown) return;
    isDown = false;
    track.style.cursor = 'grab';
    snapToNearest();
  };
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  // Mouse wheel -> exactly one full card per gesture
  const section = track.closest('.services') || track;
  section.addEventListener('wheel', (e) => {
    const max = getMax();
    const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    const atStart = track.scrollLeft <= 0 && delta < 0;
    const atEnd = track.scrollLeft >= max - 1 && delta > 0;
    // Release page scrolling at carousel boundaries
    if (atStart || atEnd) return;
    e.preventDefault();
    if (snapping) return; // ignore rapid wheel events during snapping
    const dir = delta > 0 ? 1 : -1;
    snapTo(currentIndex() + dir);
  }, { passive: false });

  // Auto-advance, paused on hover/drag
  let direction = 1;
  const autoAdvance = () => {
    if (isDown || snapping) return;
    const step = getStep();
    if (step <= 0) return;
    const max = getMax();
    let idx = currentIndex() + direction;
    if (idx * step >= max || idx <= 0) direction *= -1;
    idx = clamp(idx, 0, Math.ceil(max / step));
    snapTo(idx, 0.9);
  };
  let autoTimer = setInterval(autoAdvance, 3200);
  track.addEventListener('mouseenter', () => clearInterval(autoTimer));
  track.addEventListener('mouseleave', () => {
    clearInterval(autoTimer);
    autoTimer = setInterval(autoAdvance, 3200);
  });

  // Reveal on scroll
  gsap.from('.svc-card', {
    y: 50,
    opacity: 0,
    stagger: 0.1,
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.services', start: 'top 75%' },
  });
}

// ---------- About ----------
const aboutSection = document.querySelector('.about');
if (aboutSection) {
  gsap.from('.about-label', {
    y: 34, opacity: 0, duration: 0.7, ease: 'power3.out',
    scrollTrigger: { trigger: aboutSection, start: 'top 75%' },
  });
  gsap.from('.about-title', {
    y: 38, opacity: 0, duration: 0.8, delay: 0.08, ease: 'power3.out',
    scrollTrigger: { trigger: aboutSection, start: 'top 75%' },
  });
  gsap.from('.about-statement', {
    y: 26, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power3.out',
    scrollTrigger: { trigger: aboutSection, start: 'top 75%' },
  });
  gsap.from('.stat-circle', {
    scale: 0.85, opacity: 0, y: 40, stagger: 0.12, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '.about-stats', start: 'top 80%' },
  });

  // Counter — runs once
  let counted = false;
  ScrollTrigger.create({
    trigger: '.about-stats',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      if (counted) return;
      counted = true;
      document.querySelectorAll('.stat-value').forEach((el) => {
        const target = parseInt(el.dataset.target, 10) || 0;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.val); },
        });
      });
    },
  });

  // Hover reveal (desktop only): hover color expands from center outward
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.stat-circle').forEach((circle) => {
      const left = circle.querySelector('.stat-hover--left');
      const right = circle.querySelector('.stat-hover--right');
      if (!left || !right) return;
      const tl = gsap.timeline({ paused: true });
      tl.fromTo(left, { scaleX: 0, transformOrigin: 'right center' }, { scaleX: 1, duration: 0.6, ease: 'power3.inOut' }, 0)
        .fromTo(right, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.6, ease: 'power3.inOut' }, 0);
      circle.addEventListener('mouseenter', () => tl.timeScale(1).play());
      circle.addEventListener('mouseleave', () => tl.timeScale(1).reverse());
    });
  }
}

// ---------- What We Do ----------
const whatwedo = document.querySelector('.whatwedo');
if (whatwedo) {
  gsap.from('.whatwedo-label, .whatwedo-title', {
    y: 36, opacity: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: whatwedo, start: 'top 75%' },
  });
  gsap.from('.whatwedo-copy', {
    y: 24, opacity: 0, duration: 0.7, delay: 0.15, ease: 'power3.out',
    scrollTrigger: { trigger: whatwedo, start: 'top 75%' },
  });
  gsap.from('.wwd-item', {
    y: 36, opacity: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out',
    scrollTrigger: { trigger: '.whatwedo-list', start: 'top 80%' },
  });
}

// Work portfolio reveal
const workItems = document.querySelectorAll('.work-item');
if (workItems.length) {
  gsap.from(workItems, {
    y: 50,
    opacity: 0,
    stagger: 0.12,
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.work', start: 'top 75%' },
  });
}

// ---------- Footer ----------
const footer = document.querySelector('.site-footer');
if (footer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const footerTl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: { trigger: footer, start: 'top 82%' },
  });
  footerTl
    .from('.footer-title-inner', { yPercent: 140, duration: 1, ease: 'power4.out' }, 0.04)
    .from('.footer-mail', { y: 30, opacity: 0, duration: 0.7 }, 0.5)
    .from('.footer-bottom > *', { y: 24, opacity: 0, stagger: 0.08, duration: 0.6 }, 0.62);
}

// ---------- Footer bubble heading ----------
const bubbleRoots = Array.from(document.querySelectorAll('.bubble-heading'));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const splitBubbleHeading = (heading) => {
  if (!heading || heading.dataset.bubbleSplit === '1') return;
  const label = heading.textContent.replace(/\\s+/g, ' ').trim();
  heading.setAttribute('aria-label', label);

  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.nodeValue && node.nodeValue.trim()
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });

  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    for (const char of node.nodeValue) {
      if (char === ' ' || char === '\\t' || char === '\\n' || char === '\\r') {
        const space = document.createElement('span');
        space.className = 'bubble-char bubble-char--space';
        space.setAttribute('aria-hidden', 'true');
        space.textContent = '\u00A0';
        fragment.appendChild(space);
      } else {
        const span = document.createElement('span');
        span.className = 'bubble-char';
        span.setAttribute('aria-hidden', 'true');
        span.textContent = char;
        fragment.appendChild(span);
      }
    }
    node.parentNode.replaceChild(fragment, node);
  });

  heading.dataset.bubbleSplit = '1';
};

if (!prefersReducedMotion) {
  bubbleRoots.forEach(splitBubbleHeading);

  // Keep an eye on headings injected later (Elementor preview / dynamic content)
  const bubbleObserver = new MutationObserver(() => {
    document.querySelectorAll('.bubble-heading:not([data-bubble-split="1"])').forEach(splitBubbleHeading);
  });
  bubbleObserver.observe(document.body, { childList: true, subtree: true });

  const bubbleChars = Array.from(
    document.querySelectorAll('.bubble-heading .bubble-char:not(.bubble-char--space)'),
  );

  if (bubbleChars.length) {
    const triggerEl =
      document.querySelector('.site-footer, footer, .elementor-location-footer') ||
      bubbleChars[0].closest('footer, .site-footer, .elementor-location-footer') ||
      bubbleChars[0].closest('.bubble-heading');

    const bubbleTl = gsap.timeline({
      repeat: -1,
      repeatDelay: 0.85,
      paused: true,
      defaults: { transformOrigin: 'center bottom', force3D: true },
    });

    bubbleTl.to(bubbleChars, {
      keyframes: [
        { y: -26, scaleX: 0.9, scaleY: 1.16, duration: 0.22, ease: 'power2.out' },
        { y: 0, scaleX: 1.08, scaleY: 0.9, duration: 0.14, ease: 'power2.in' },
        { y: 0, scaleX: 1, scaleY: 1, duration: 0.28, ease: 'back.out(1.5)' },
      ],
      stagger: { each: 0.05, from: 'start' },
    });

    ScrollTrigger.create({
      trigger: triggerEl,
      start: 'top 90%',
      onEnter: () => bubbleTl.play(),
      onEnterBack: () => bubbleTl.play(),
      onLeave: () => bubbleTl.pause(),
      onLeaveBack: () => bubbleTl.pause(),
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) bubbleTl.pause();
    });
  }
}

// Sparkle slow spin
gsap.to('.sparkle', { rotate: 360, duration: 12, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
document.querySelectorAll('.head-sparkle path').forEach((path, i) => {
  gsap.to(path, {
    scale: 0.6,
    opacity: 0.45,
    duration: 1.6 + i * 0.35,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    delay: i * 0.45,
    transformOrigin: '50% 50%',
  });
});
