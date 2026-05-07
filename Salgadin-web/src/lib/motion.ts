export const MOTION_EASE = [0.16, 1, 0.3, 1] as const;

export const MOTION = {
  micro: {
    duration: 0.18,
    ease: MOTION_EASE,
  },
  smooth: {
    duration: 0.24,
    ease: MOTION_EASE,
  },
  enter: {
    duration: 0.28,
    ease: MOTION_EASE,
  },
  panel: {
    duration: 0.32,
    ease: MOTION_EASE,
  },
} as const;

export const modalMotion = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  panel: {
    initial: { opacity: 0, scale: 0.97, y: 16 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.985, y: 12 },
  },
} as const;

export const dropdownMotion = {
  initial: { opacity: 0, y: -8, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.99 },
} as const;

export const collapseMotion = {
  initial: { opacity: 0, height: 0, y: -6 },
  animate: { opacity: 1, height: "auto", y: 0 },
  exit: { opacity: 0, height: 0, y: -4 },
} as const;

export function getMotionProps<
  TRich extends Record<string, unknown>,
  TReduced extends Record<string, unknown>,
>(
  shouldReduceMotion: boolean,
  rich: TRich,
  reduced: TReduced,
): TRich | TReduced {
  return shouldReduceMotion ? reduced : rich;
}
