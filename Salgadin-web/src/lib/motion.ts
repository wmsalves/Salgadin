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

/**
 * Principios: animar so o que ajuda a entender uma mudanca (entrada de tela,
 * item novo, item removido, troca de aba). Duracoes curtas (150-300ms),
 * ease-out, deslocamentos pequenos e nunca escala a partir de zero.
 */

/** Entrada de pagina: aparece rapido, sem animacao de saida para nao atrasar a navegacao. */
export const pageMotion = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: MOTION_EASE },
} as const;

/** Itens de lista: entram de cima, saem recolhendo a altura. */
export const listItemMotion = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, height: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 },
  transition: { duration: 0.22, ease: MOTION_EASE },
} as const;

/** Mensagens curtas de status (sucesso, erro, desfeito). */
export const statusMotion = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
  transition: { duration: 0.18, ease: MOTION_EASE },
} as const;

/** Indicador que desliza entre abas/itens de menu (usar com layoutId). */
export const indicatorTransition = {
  type: "spring",
  stiffness: 520,
  damping: 42,
  mass: 0.9,
} as const;

/** Entrada em sequencia para grades de cards. */
export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
} as const;

export const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: MOTION_EASE } },
} as const;
