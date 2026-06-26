import { useEffect } from "react";

/**
 * Global, non-invasive scroll-reveal.
 *
 * Progressive enhancement: sections only start hidden once this component
 * marks the document as "ready" (`.js-reveal-ready` on <html>). If JS never
 * runs, all content stays fully visible — no blank sections, no layout shift.
 *
 * It animates each top-level <section> wrapper (cinematic fade + rise) without
 * touching component structure. Inner framer-motion animations keep working
 * and layer on top for staggered reveals.
 */
export function ScrollReveal() {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced || typeof IntersectionObserver === "undefined") return;

    const root = document.documentElement;
    let raf = 0;
    let observer: IntersectionObserver | null = null;

    const setup = () => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("section")
      );
      // Skip the hero (first section) — it has its own intro animation.
      const targets = sections
        .slice(1)
        .filter((el) => !el.classList.contains("reveal-section"));
      if (targets.length === 0) return;

      root.classList.add("js-reveal-ready");
      targets.forEach((el) => el.classList.add("reveal-section"));

      observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("reveal-in");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
      );

      targets.forEach((el) => observer!.observe(el));
    };

    // Defer to next frame so dynamically rendered sections are mounted.
    raf = requestAnimationFrame(setup);

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, []);

  return null;
}
