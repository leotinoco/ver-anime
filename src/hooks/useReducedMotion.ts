"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

const getInitialValue = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia(QUERY).matches;
};

export const useReducedMotion = (): boolean => {
  const [prefersReduced, setPrefersReduced] = useState(getInitialValue);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return prefersReduced;
};
