export function runPageTransition() {
  if (typeof window === 'undefined' || !window.gsap) return;
  
  const overlay = document.getElementById("stairs-overlay");
  const page = document.getElementById("root");
  
  if (!overlay || !page) return;

  const { gsap } = window;
  
  gsap.set(overlay, { display: "none" });
  gsap.set(".stair", { clearProps: "all" });
  gsap.set(page, { clearProps: "all" });

  const tl = gsap.timeline();

  tl.to(overlay, { display: "block", duration: 0 });

  tl.from(".stair", {
    height: 0,
    duration: 0.5,
    stagger: { amount: -0.2 },
    ease: "power2.out"
  });

  tl.to(".stair", {
    y: "100%",
    duration: 0.6,
    stagger: { amount: -0.25 },
    ease: "power3.inOut"
  });

  tl.set(overlay, { display: "none" });
  tl.set(".stair", { y: "0%" });

  tl.from(
    page,
    {
      opacity: 0,
      scale: 1.2,
      duration: 0.6,
      ease: "power2.out"
    },
    1.3
  );
}
