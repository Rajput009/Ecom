import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Hook to measure component render performance
 * Useful for debugging and optimization
 */
export function useRenderPerf(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    // Only log in development
    if (process.env.NODE_ENV === 'development' && duration > 16) {
      console.log(
        `[Performance] ${componentName} rendered ${renderCount.current} times. ` +
        `Last render: ${duration.toFixed(2)}ms`
      );
    }
    
    startTime.current = endTime;
  });

  return renderCount.current;
}

/**
 * Hook to implement intersection observer for lazy loading
 */
export function useIntersectionObserver(
  callback: (isIntersecting: boolean) => void,
  options?: IntersectionObserverInit
) {
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => callback(entry.isIntersecting),
      { threshold: 0.1, ...options }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [callback, options]);

  return targetRef;
}

/**
 * Hook to throttle function calls
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
) {
  const lastCall = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const remaining = delay - (now - lastCall.current);

      if (remaining <= 0) {
        lastCall.current = now;
        fn(...args);
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          lastCall.current = Date.now();
          timeoutRef.current = null;
          fn(...args);
        }, remaining);
      }
    },
    [fn, delay]
  );
}

/**
 * Hook to debounce function calls
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
}

/**
 * Hook to detect if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}
