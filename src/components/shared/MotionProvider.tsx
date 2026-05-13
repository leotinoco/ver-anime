"use client";

import { MotionConfig, LazyMotion, domAnimation } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface MotionProviderProps {
  children: React.ReactNode;
}

export const MotionProvider = ({ children }: MotionProviderProps) => {
  const prefersReduced = useReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion={prefersReduced ? "always" : "never"}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
};
