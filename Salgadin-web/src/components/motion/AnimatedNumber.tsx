import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  format: (value: number) => string;
  /** Duracao em segundos. */
  duration?: number;
  className?: string;
}

/**
 * Numero que desliza do valor anterior para o novo (ex.: ao trocar de mes ou
 * registrar um gasto). Escreve direto no DOM para nao re-renderizar a cada quadro.
 * Leitores de tela recebem apenas o valor final.
 */
export function AnimatedNumber({ value, format, duration = 0.5, className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef(value);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const from = previous.current;
    previous.current = value;

    if (reduceMotion || from === value) {
      node.textContent = format(value);
      return;
    }

    const controls = animate(from, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        node.textContent = format(latest);
      },
    });
    return () => controls.stop();
  }, [value, format, duration, reduceMotion]);

  return (
    <span ref={ref} className={className} aria-label={format(value)}>
      {format(value)}
    </span>
  );
}
