import { useMemo } from 'react';
import type { Transition, Variants } from 'motion/react';

export type BouncyAnimationType = 'card' | 'modal' | 'pop' | 'snappy' | 'wobbly' | 'fade-up' | 'subtle';

export interface BouncyAnimationOptions {
  /**
   * Animation preset style. Defaults to 'card'
   */
  type?: BouncyAnimationType;
  /**
   * Entrance delay in seconds (or calculated via index * stagger)
   */
  delay?: number;
  /**
   * Element index for automated staggered delay
   */
  index?: number;
  /**
   * Stagger multiplier in seconds when index is provided (default: 0.06)
   */
  stagger?: number;
  /**
   * Custom spring stiffness (higher = faster snap)
   */
  stiffness?: number;
  /**
   * Custom spring damping (lower = more bouncy oscillation)
   */
  damping?: number;
  /**
   * Custom spring mass
   */
  mass?: number;
  /**
   * Hover scale factor (e.g. 1.02 for subtle, 1.04 for card)
   */
  hoverScale?: number;
  /**
   * Tap / active scale factor (e.g. 0.96)
   */
  tapScale?: number;
  /**
   * Direction of entrance offset ('up' | 'down' | 'none' | 'scale-only')
   */
  direction?: 'up' | 'down' | 'none' | 'scale-only';
  /**
   * Custom initial offset in pixels (default: 20 for card, 12 for modal)
   */
  distance?: number;
  /**
   * Enable/disable hover bounce effects
   */
  enableHover?: boolean;
  /**
   * Enable/disable tap bounce effects
   */
  enableTap?: boolean;
}

/**
 * Spring configurations for various playful & responsive UI elements.
 */
export const BOUNCY_SPRINGS = {
  // Balanced bouncy entrance for cards and panels with a pleasant settling overshoot
  card: {
    type: 'spring' as const,
    stiffness: 260,
    damping: 18,
    mass: 0.8,
  },
  // Snappy modal dialog pop with crisp arrival and zero sluggishness
  modal: {
    type: 'spring' as const,
    stiffness: 340,
    damping: 24,
    mass: 0.7,
  },
  // Playful pop for icons, badges, buttons, and trust chips
  pop: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 15,
    mass: 0.6,
  },
  // Ultra-crisp for navigation menus, dropdowns, and command palettes
  snappy: {
    type: 'spring' as const,
    stiffness: 420,
    damping: 28,
    mass: 0.5,
  },
  // Fun, rubbery wobble for celebrations, score meters, and interactive triumphs
  wobbly: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 12,
    mass: 0.9,
  },
  // Smooth subtle float for high-density dashboard modules
  subtle: {
    type: 'spring' as const,
    stiffness: 220,
    damping: 22,
    mass: 0.9,
  },
  // Standard fade-up transition
  'fade-up': {
    type: 'spring' as const,
    stiffness: 240,
    damping: 20,
    mass: 0.8,
  },
};

/**
 * Reusable modal backdrop and dialog variants
 */
export const bouncyModalBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } },
};

export const bouncyModalDialogVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.92,
    y: 18,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: BOUNCY_SPRINGS.modal,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 1, 1],
    },
  },
};

/**
 * Reusable card entrance variants
 */
export const bouncyCardVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.94,
    y: 24,
  },
  animate: (customDelay: number = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      ...BOUNCY_SPRINGS.card,
      delay: customDelay,
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 12,
    transition: { duration: 0.15 },
  },
};

/**
 * A reusable hook using Framer Motion (`motion/react`) that generates
 * spring-based bouncy entrance and interactive physics props for cards, modals, and panels.
 *
 * @example
 * // 1. Direct spreading on motion components:
 * const bouncyCard = useBouncyAnimation({ type: 'card', index: 2 });
 * <motion.div {...bouncyCard} className="p-6 rounded-2xl bg-slate-900">
 *   ...
 * </motion.div>
 *
 * @example
 * // 2. Modal animations:
 * const { initial, animate, exit, transition } = useBouncyAnimation({ type: 'modal' });
 * <motion.div initial={initial} animate={animate} exit={exit} transition={transition}>
 *   ...
 * </motion.div>
 */
export function useBouncyAnimation(options: BouncyAnimationOptions = {}) {
  const {
    type = 'card',
    delay = 0,
    index,
    stagger = 0.05,
    stiffness,
    damping,
    mass,
    hoverScale,
    tapScale = 0.98,
    direction = 'up',
    distance,
    enableHover = true,
    enableTap = true,
  } = options;

  // Calculate actual delay taking index into account
  const totalDelay = useMemo(() => {
    if (typeof index === 'number' && index >= 0) {
      return delay + index * stagger;
    }
    return delay;
  }, [delay, index, stagger]);

  // Derive spring physics config
  const springTransition: Transition = useMemo(() => {
    const baseSpring = BOUNCY_SPRINGS[type] || BOUNCY_SPRINGS.card;
    return {
      type: 'spring',
      stiffness: stiffness ?? baseSpring.stiffness,
      damping: damping ?? baseSpring.damping,
      mass: mass ?? baseSpring.mass,
      delay: totalDelay,
    };
  }, [type, stiffness, damping, mass, totalDelay]);

  // Derive initial, animate, and exit values
  const { initial, animate, exit } = useMemo(() => {
    let defaultDistance = 20;
    let initialScale = 0.95;

    if (type === 'modal') {
      defaultDistance = 16;
      initialScale = 0.92;
    } else if (type === 'pop' || type === 'wobbly') {
      defaultDistance = 8;
      initialScale = 0.85;
    } else if (type === 'subtle') {
      defaultDistance = 14;
      initialScale = 0.98;
    }

    const effectiveDistance = distance ?? defaultDistance;

    let initialY = 0;
    let exitY = 0;

    if (direction === 'up') {
      initialY = effectiveDistance;
      exitY = Math.round(effectiveDistance * 0.4);
    } else if (direction === 'down') {
      initialY = -effectiveDistance;
      exitY = -Math.round(effectiveDistance * 0.4);
    } else if (direction === 'scale-only' || direction === 'none') {
      initialY = 0;
      exitY = 0;
    }

    return {
      initial: {
        opacity: 0,
        scale: initialScale,
        y: initialY,
      },
      animate: {
        opacity: 1,
        scale: 1,
        y: 0,
      },
      exit: {
        opacity: 0,
        scale: Math.max(0.92, initialScale),
        y: exitY,
      },
    };
  }, [type, direction, distance]);

  // Derive interactive hover/tap spring behavior
  const whileHover = useMemo(() => {
    if (!enableHover) return undefined;
    const scale = hoverScale ?? (type === 'card' ? 1.025 : type === 'pop' ? 1.05 : 1.015);
    return {
      scale,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 18,
      },
    };
  }, [enableHover, hoverScale, type]);

  const whileTap = useMemo(() => {
    if (!enableTap) return undefined;
    return {
      scale: tapScale,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 20,
      },
    };
  }, [enableTap, tapScale]);

  // Complete prop package ready to spread onto any <motion.*> component
  return useMemo(
    () => ({
      initial,
      animate,
      exit,
      transition: springTransition,
      whileHover,
      whileTap,
      // Variants interface for orchestrated list containers
      variants: {
        initial,
        animate: {
          ...animate,
          transition: springTransition,
        },
        exit: {
          ...exit,
          transition: { duration: 0.15, ease: 'easeIn' },
        },
      } as Variants,
    }),
    [initial, animate, exit, springTransition, whileHover, whileTap]
  );
}

/**
 * Convenience helper for modal backdrop overlay animation
 */
export function useBouncyBackdropAnimation() {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2, ease: 'easeOut' },
  };
}
