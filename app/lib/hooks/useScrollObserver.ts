"use client";

import { useCallback, useEffect, useRef } from "react";

const OBSERVER_THRESHOLD = 0.15;
const COUNTER_DURATION_MS = 1500;
const EASE_POWER = 3;

export function useScrollObserver() {
  const observerRefs = useRef<(Element | null)[]>([]);

  const addRef = useCallback((el: Element | null) => {
    if (el && !observerRefs.current.includes(el)) {
      observerRefs.current.push(el);
    }
  }, []);

  useEffect(() => {
    const animateCounter = (el: Element) => {
      const target = Number(el.getAttribute("data-target") ?? 0);
      const suffix = el.getAttribute("data-suffix") ?? "";
      let start = 0;

      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / COUNTER_DURATION_MS, 1);
        const ease = 1 - Math.pow(1 - progress, EASE_POWER);
        el.textContent = Math.round(ease * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            const counter = entry.target.querySelector("[data-target]");
            if (counter) animateCounter(counter);

            entry.target.querySelectorAll(".proj-bar-fill").forEach((bar) => {
              (bar as HTMLElement).style.width =
                (bar as HTMLElement).dataset.width ?? "0";
            });

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: OBSERVER_THRESHOLD }
    );

    observerRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return addRef;
}
