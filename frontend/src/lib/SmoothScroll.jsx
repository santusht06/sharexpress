// Copyright 2026 Sharexpress
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
//
import { useEffect, useRef } from "react";
import Lenis from "lenis";

const SmoothScroll = () => {
  const lenisRef = useRef(null);

  useEffect(() => {
    if (lenisRef.current) return; // prevent re-init

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 1.5,
      orientation: "vertical",
      gestureOrientation: "vertical",
      infinite: false,
    });

    lenisRef.current = lenis;

    const raf = (time) => {
      lenis.raf(time);
      lenis._rafId = requestAnimationFrame(raf);
    };

    lenis._rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(lenis._rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return null;
};

export default SmoothScroll;
