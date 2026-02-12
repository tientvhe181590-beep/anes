import { useRef, useCallback, type RefObject } from 'react';

interface SwipeOptions {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  ref: RefObject<HTMLDivElement | null>;
}

export function useSwipe({
  threshold = 50,
  onSwipeLeft,
  onSwipeRight,
}: SwipeOptions): SwipeHandlers {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const startX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const handleStart = useCallback((clientX: number) => {
    startX.current = clientX;
    isDragging.current = true;
  }, []);

  const handleEnd = useCallback(() => {
    if (!isDragging.current || startX.current === null) {
      isDragging.current = false;
      startX.current = null;
      return;
    }

    isDragging.current = false;
    startX.current = null;
  }, []);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging.current || startX.current === null) return;

      const deltaX = clientX - startX.current;

      if (Math.abs(deltaX) >= threshold) {
        isDragging.current = false;
        if (deltaX < 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
        startX.current = null;
      }
    },
    [threshold, onSwipeLeft, onSwipeRight],
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => handleStart(e.touches[0].clientX),
    [handleStart],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => handleMove(e.touches[0].clientX),
    [handleMove],
  );

  const onTouchEnd = useCallback(() => handleEnd(), [handleEnd]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX);
    },
    [handleStart],
  );

  const onMouseMove = useCallback((e: React.MouseEvent) => handleMove(e.clientX), [handleMove]);

  const onMouseUp = useCallback(() => handleEnd(), [handleEnd]);
  const onMouseLeave = useCallback(() => handleEnd(), [handleEnd]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    ref: containerRef,
  };
}
