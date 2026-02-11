import { useRef, useCallback, useEffect, useState } from "react";

interface RulerSliderProps {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}

export function RulerSlider({
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
}: RulerSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [displayValue, setDisplayValue] = useState(value);

  const tickCount = Math.round((max - min) / step) + 1;
  const tickSpacing = 12; // px between ticks
  const totalWidth = (tickCount - 1) * tickSpacing;

  const valueToOffset = useCallback(
    (v: number) => ((v - min) / (max - min)) * totalWidth,
    [min, max, totalWidth],
  );

  const offsetToValue = useCallback(
    (offset: number) => {
      const raw = min + (offset / totalWidth) * (max - min);
      const snapped = Math.round(raw / step) * step;
      return Math.max(min, Math.min(max, Number(snapped.toFixed(1))));
    },
    [min, max, step, totalWidth],
  );

  const scrollToValue = useCallback(
    (v: number, smooth = false) => {
      const track = trackRef.current;
      if (!track) return;
      const container = track.parentElement;
      if (!container) return;
      const containerWidth = container.clientWidth;
      const offset = valueToOffset(v);
      const scrollPos = offset - containerWidth / 2;
      container.scrollTo({
        left: scrollPos,
        behavior: smooth ? "smooth" : "instant",
      });
    },
    [valueToOffset],
  );

  // Scroll to initial value on mount
  useEffect(() => {
    scrollToValue(value);
  }, [scrollToValue, value]);

  const handleScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const container = track.parentElement;
    if (!container) return;
    const centerOffset = container.scrollLeft + container.clientWidth / 2;
    const v = offsetToValue(centerOffset);
    setDisplayValue(v);
  }, [offsetToValue]);

  const commitValue = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const container = track.parentElement;
    if (!container) return;
    const centerOffset = container.scrollLeft + container.clientWidth / 2;
    const v = offsetToValue(centerOffset);
    onChange(v);
    scrollToValue(v, true);
  }, [offsetToValue, onChange, scrollToValue]);

  // Touch / mouse drag support
  const handlePointerDown = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      commitValue();
    }
  }, [commitValue]);

  // Listen to scroll end for snap
  useEffect(() => {
    const container = trackRef.current?.parentElement;
    if (!container) return;

    let scrollTimer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      handleScroll();
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        if (!isDragging.current) {
          commitValue();
        }
      }, 120);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      clearTimeout(scrollTimer);
    };
  }, [handleScroll, commitValue]);

  // Build ticks
  const ticks: { value: number; isMajor: boolean }[] = [];
  const majorInterval = step < 1 ? 5 : 10;
  for (let i = 0; i < tickCount; i++) {
    const tickVal = Number((min + i * step).toFixed(1));
    const stepsFromMin = Math.round((tickVal - min) / step);
    ticks.push({
      value: tickVal,
      isMajor: stepsFromMin % majorInterval === 0,
    });
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Label */}
      <span className="text-sm font-medium text-[var(--text-secondary)]">
        {label}
      </span>

      {/* Value display */}
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold text-[var(--text-primary)]">
          {step < 1 ? displayValue.toFixed(1) : displayValue}
        </span>
        <span className="text-lg text-[var(--text-muted)]">{unit}</span>
      </div>

      {/* Ruler container */}
      <div className="relative w-full">
        {/* Center indicator */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-0.5 -translate-x-1/2 bg-[var(--accent)]" />

        {/* Scrollable track */}
        <div
          className="no-scrollbar overflow-x-auto"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: "pan-x" }}
        >
          <div
            ref={trackRef}
            className="flex items-end"
            style={{
              width: totalWidth,
              paddingLeft: "50%",
              paddingRight: "50%",
              height: 64,
            }}
          >
            {ticks.map((tick, i) => (
              <div
                key={i}
                className="flex shrink-0 flex-col items-center"
                style={{ width: tickSpacing }}
              >
                <div
                  className="w-px"
                  style={{
                    height: tick.isMajor ? 32 : 16,
                    backgroundColor: tick.isMajor
                      ? "var(--text-secondary)"
                      : "var(--text-muted)",
                  }}
                />
                {tick.isMajor && (
                  <span className="mt-1 text-[10px] text-[var(--text-muted)]">
                    {tick.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
