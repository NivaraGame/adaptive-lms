/**
 * useAnimation Hook
 *
 * Custom hook for applying CSS animation classes to elements.
 * Provides utility functions for success, error, and other micro-interactions.
 *
 * @module hooks/useAnimation
 */

import { useCallback, useState, useEffect, useRef } from 'react';

interface AnimationOptions {
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Callback to run after animation completes */
  onComplete?: () => void;
}

/**
 * Hook for managing animations
 *
 * @returns Animation utility functions
 *
 * @example
 * ```tsx
 * const { triggerSuccess, triggerError, animationClass } = useAnimation();
 *
 * const handleCorrectAnswer = () => {
 *   triggerSuccess();
 * };
 *
 * return <div className={animationClass}>Content</div>;
 * ```
 */
export function useAnimation() {
  const [animationClass, setAnimationClass] = useState<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Trigger an animation
   * @param className - CSS class name for the animation
   * @param options - Animation options
   */
  const triggerAnimation = useCallback((
    className: string,
    options: AnimationOptions = {}
  ) => {
    const { duration = 500, onComplete } = options;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set animation class
    setAnimationClass(className);

    // Remove class after animation completes
    timeoutRef.current = setTimeout(() => {
      setAnimationClass('');
      onComplete?.();
    }, duration);
  }, []);

  /**
   * Trigger success animation (checkmark)
   */
  const triggerSuccess = useCallback((options?: AnimationOptions) => {
    triggerAnimation('success-animation', options);
  }, [triggerAnimation]);

  /**
   * Trigger error animation (shake)
   */
  const triggerError = useCallback((options?: AnimationOptions) => {
    triggerAnimation('error-animation', options);
  }, [triggerAnimation]);

  /**
   * Trigger hint reveal animation
   */
  const triggerHintReveal = useCallback((options?: AnimationOptions) => {
    triggerAnimation('hint-reveal', options);
  }, [triggerAnimation]);

  /**
   * Trigger fade in animation
   */
  const triggerFadeIn = useCallback((options?: AnimationOptions) => {
    triggerAnimation('fadeIn', options);
  }, [triggerAnimation]);

  /**
   * Trigger slide in animation
   */
  const triggerSlideIn = useCallback((options?: AnimationOptions) => {
    triggerAnimation('slideIn', options);
  }, [triggerAnimation]);

  /**
   * Clear current animation
   */
  const clearAnimation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setAnimationClass('');
  }, []);

  return {
    animationClass,
    triggerSuccess,
    triggerError,
    triggerHintReveal,
    triggerFadeIn,
    triggerSlideIn,
    clearAnimation,
  };
}

/**
 * Hook for managing element ref animations
 * Applies animations directly to a DOM element via ref
 *
 * @returns Animation utility functions with ref
 *
 * @example
 * ```tsx
 * const { ref, triggerSuccess } = useRefAnimation<HTMLDivElement>();
 *
 * return <div ref={ref}>Content</div>;
 * ```
 */
export function useRefAnimation<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Apply animation class to ref element
   */
  const applyAnimation = useCallback((
    className: string,
    options: AnimationOptions = {}
  ) => {
    const { duration = 500, onComplete } = options;

    if (!ref.current) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Add animation class
    ref.current.classList.add(className);

    // Remove class after animation completes
    timeoutRef.current = setTimeout(() => {
      ref.current?.classList.remove(className);
      onComplete?.();
    }, duration);
  }, []);

  const triggerSuccess = useCallback((options?: AnimationOptions) => {
    applyAnimation('success-animation', options);
  }, [applyAnimation]);

  const triggerError = useCallback((options?: AnimationOptions) => {
    applyAnimation('error-animation', options);
  }, [applyAnimation]);

  const triggerHintReveal = useCallback((options?: AnimationOptions) => {
    applyAnimation('hint-reveal', options);
  }, [applyAnimation]);

  return {
    ref,
    triggerSuccess,
    triggerError,
    triggerHintReveal,
  };
}
