/* ==========================================================================
   Camino hacia la libertad financiera — script.js
   Vanilla · <3 KB · sin lógica de pago en cliente
   ========================================================================== */
(() => {
  "use strict";

  const doc = document;
  const root = doc.documentElement;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Marca "JS disponible" para que el CSS active .reveal sin romper sin JS.
  root.classList.add("js");

  /* ---------- 1. Pasar UTM al enlace de pago ---------- */
  const UTM_KEYS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "utm_id",
  ];
  const incoming = new URLSearchParams(location.search);
  const utms = new URLSearchParams();
  UTM_KEYS.forEach((k) => {
    const v = incoming.get(k);
    if (v) utms.set(k, v);
  });

  const ctaLinks = doc.querySelectorAll("a[data-cta]");
  if ([...utms].length) {
    ctaLinks.forEach((a) => {
      try {
        const url = new URL(a.href, location.href);
        utms.forEach((v, k) => url.searchParams.set(k, v));
        a.href = url.toString();
      } catch (_) {
        /* href inválido: se deja tal cual */
      }
    });
  }

  /* ---------- 2. Evento click_cta en cada CTA ---------- */
  ctaLinks.forEach((a) => {
    a.addEventListener("click", () => {
      const place = a.dataset.cta || "unknown";
      if (window.plausible) window.plausible("click_cta", { props: { place } });
    });
  });

  /* ---------- 3. scroll_50 (una sola vez, con guarda) ---------- */
  let scrollFired = false;
  const onScroll = () => {
    if (scrollFired) return;
    const h = doc.documentElement;
    const total = h.scrollHeight - h.clientHeight;
    if (total <= 0) return;
    if (h.scrollTop / total >= 0.5) {
      scrollFired = true;
      if (window.plausible) window.plausible("scroll_50");
      window.removeEventListener("scroll", onScroll);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 4. Animaciones de entrada (.reveal) ---------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    const sections = doc.querySelectorAll("main .section");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
    );
    sections.forEach((s) => {
      s.classList.add("reveal");
      io.observe(s);
    });
  }

  /* ---------- 5. Acordeones exclusivos (fases y FAQ) ---------- */
  doc.querySelectorAll("[data-accordion]").forEach((group) => {
    const items = group.querySelectorAll("details");
    items.forEach((d) => {
      d.addEventListener("toggle", () => {
        if (!d.open) return;
        items.forEach((other) => {
          if (other !== d && other.open) other.open = false;
        });
      });
    });
  });

  /* ---------- 6. CTA fijo móvil ---------- */
  const sticky = doc.querySelector("[data-sticky-cta]");
  const hero = doc.getElementById("inicio");
  const price = doc.getElementById("precio");

  if (sticky && hero && price && "IntersectionObserver" in window) {
    let heroVisible = true;
    let priceVisible = false;

    const refresh = () => {
      const show = !heroVisible && !priceVisible;
      sticky.classList.toggle("is-visible", show);
      sticky.setAttribute("aria-hidden", show ? "false" : "true");
    };

    new IntersectionObserver(
      ([e]) => {
        heroVisible = e.isIntersecting;
        refresh();
      },
      { threshold: 0 },
    ).observe(hero);

    new IntersectionObserver(
      ([e]) => {
        priceVisible = e.isIntersecting;
        refresh();
      },
      { threshold: 0 },
    ).observe(price);

    refresh();
  }

  /* ---------- 7. Año del footer ---------- */
  const year = doc.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
