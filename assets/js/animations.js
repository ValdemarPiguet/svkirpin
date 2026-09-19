const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach((item) => observer.observe(item));
}

function initCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  if (!counters.length) return;

  const animate = (node) => {
    const target = Number(node.dataset.counter);
    const suffix = node.dataset.suffix || "";
    const duration = Number(node.dataset.duration || 1400);
    const start = performance.now();

    const frame = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  };

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    counters.forEach((node) => {
      node.textContent = `${node.dataset.counter}${node.dataset.suffix || ""}`;
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach((node) => observer.observe(node));
}

function initEnergyFlow() {
  const pulse = document.querySelector(".energy-flow__pulse");
  const path = document.querySelector("#energy-flow-path");
  const charge = document.querySelector(".energy-charge");
  if (!pulse || !path || !charge) return;
  if (prefersReducedMotion) {
    charge.setAttribute("height", "41");
    charge.setAttribute("y", "167");
    return;
  }

  const length = path.getTotalLength();
  let start = null;

  const step = (timestamp) => {
    if (!start) start = timestamp;
    const cycle = ((timestamp - start) % 5200) / 5200;
    const progress = cycle < 0.72 ? cycle / 0.72 : 1;
    const point = path.getPointAtLength(length * progress);
    pulse.setAttribute("cx", point.x);
    pulse.setAttribute("cy", point.y);
    charge.setAttribute("height", String(82 * progress));
    charge.setAttribute("y", String(208 - 82 * progress));
    requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

initReveal();
initCounters();
initEnergyFlow();
document.addEventListener("content:rendered", initReveal);
