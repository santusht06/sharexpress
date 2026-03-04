import { useEffect } from "react";

// Fix 1: Use the current package — @studio-freight/lenis is abandoned.
// Install the maintained fork:  npm i lenis
import Lenis from "lenis";

const SmoothScroll = () => {
  useEffect(() => {
    // Fix 2: Respect reduced-motion BEFORE creating the instance
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const lenis = new Lenis({
      // Fix 3: lerp 0.12 causes the "lag" feel — 0.08 is the sweet spot.
      //        Low lerp = more smoothing = more latency. Keep it 0.06–0.10.
      lerp: 0.08,

      // Fix 4: smoothWheel is not a valid Lenis option (caused silent errors).
      //        wheelMultiplier controls wheel sensitivity — 1 is correct.
      wheelMultiplier: 1,

      // Fix 5: duration is ignored when lerp is set. Pick one or the other.
      //        Using lerp here, so duration is omitted.

      smoothTouch: false, // keep native mobile scroll (correct)
      touchMultiplier: 1.5,
      orientation: "vertical", // replaces deprecated `direction`
      gestureOrientation: "vertical", // replaces deprecated `gestureDirection`
      infinite: false,
      autoRaf: false, // we manage our own RAF below for full control
    });

    // Fix 6: Store the id on the lenis instance to avoid stale closure issues
    const raf = (time) => {
      lenis.raf(time);
      lenis._rafId = requestAnimationFrame(raf);
    };

    lenis._rafId = requestAnimationFrame(raf);

    // Fix 7: Also listen for reduced-motion changes at runtime
    const handleMotionChange = (e) => {
      if (e.matches) {
        cancelAnimationFrame(lenis._rafId);
        lenis.destroy();
      }
    };
    mq.addEventListener("change", handleMotionChange);

    return () => {
      cancelAnimationFrame(lenis._rafId);
      mq.removeEventListener("change", handleMotionChange);
      lenis.destroy();
    };
  }, []);

  return null;
};

export default SmoothScroll;
