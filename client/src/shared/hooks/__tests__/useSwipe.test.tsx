import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSwipe } from "../useSwipe";

function touchEvent(x: number): React.TouchEvent {
  return { touches: [{ clientX: x }] } as unknown as React.TouchEvent;
}

function mouseEvent(x: number): React.MouseEvent {
  return { clientX: x, preventDefault: vi.fn() } as unknown as React.MouseEvent;
}

describe("useSwipe", () => {
  it("triggers onSwipeLeft when threshold is exceeded", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const { result } = renderHook(() =>
      useSwipe({ threshold: 50, onSwipeLeft, onSwipeRight }),
    );

    act(() => {
      result.current.onTouchStart(touchEvent(200));
      result.current.onTouchMove(touchEvent(170));
    });

    expect(onSwipeLeft).toHaveBeenCalledTimes(0);

    act(() => {
      result.current.onTouchMove(touchEvent(140));
    });

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    expect(onSwipeRight).toHaveBeenCalledTimes(0);
  });

  it("triggers onSwipeRight for mouse drag", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const { result } = renderHook(() =>
      useSwipe({ threshold: 40, onSwipeLeft, onSwipeRight }),
    );

    act(() => {
      result.current.onMouseDown(mouseEvent(100));
      result.current.onMouseMove(mouseEvent(130));
    });

    expect(onSwipeRight).toHaveBeenCalledTimes(0);

    act(() => {
      result.current.onMouseMove(mouseEvent(150));
    });

    expect(onSwipeRight).toHaveBeenCalledTimes(1);
    expect(onSwipeLeft).toHaveBeenCalledTimes(0);
  });
});
