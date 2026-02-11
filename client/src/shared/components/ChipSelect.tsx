import { useState, useCallback, type KeyboardEvent } from "react";

interface ChipSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  noneLabel?: string;
  allowOther?: boolean;
  otherLabel?: string;
}

export function ChipSelect({
  options,
  selected,
  onChange,
  noneLabel = "None",
  allowOther = false,
  otherLabel = "Other",
}: ChipSelectProps) {
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherText, setOtherText] = useState("");

  const isNone = selected.length === 1 && selected[0] === noneLabel;
  const predefined = new Set([...options, noneLabel]);

  const customTags = selected.filter((s) => !predefined.has(s));

  const toggleChip = useCallback(
    (chip: string) => {
      if (chip === noneLabel) {
        // "None" deselects everything
        onChange([noneLabel]);
        setShowOtherInput(false);
        return;
      }

      // Selecting anything else deselects "None"
      const withoutNone = selected.filter((s) => s !== noneLabel);

      if (withoutNone.includes(chip)) {
        const next = withoutNone.filter((s) => s !== chip);
        onChange(next);
      } else {
        onChange([...withoutNone, chip]);
      }
    },
    [selected, onChange, noneLabel],
  );

  const toggleOther = useCallback(() => {
    if (showOtherInput) {
      setShowOtherInput(false);
    } else {
      // Deselect "None" when opening Other
      const withoutNone = selected.filter((s) => s !== noneLabel);
      if (isNone) onChange(withoutNone);
      setShowOtherInput(true);
    }
  }, [showOtherInput, selected, isNone, onChange, noneLabel]);

  const addCustomTag = useCallback(() => {
    const tag = otherText.trim();
    if (!tag) return;
    if (!selected.includes(tag)) {
      const withoutNone = selected.filter((s) => s !== noneLabel);
      onChange([...withoutNone, tag]);
    }
    setOtherText("");
  }, [otherText, selected, onChange, noneLabel]);

  const removeCustomTag = useCallback(
    (tag: string) => {
      onChange(selected.filter((s) => s !== tag));
    },
    [selected, onChange],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addCustomTag();
      }
    },
    [addCustomTag],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Chips */}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleChip(option)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]"
              }`}
            >
              {option}
            </button>
          );
        })}

        {/* None chip */}
        <button
          type="button"
          onClick={() => toggleChip(noneLabel)}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            isNone
              ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]"
          }`}
        >
          {noneLabel}
        </button>

        {/* Other chip */}
        {allowOther && (
          <button
            type="button"
            onClick={toggleOther}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              showOtherInput
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]"
            }`}
          >
            {otherLabel}
          </button>
        )}
      </div>

      {/* Custom tags display */}
      {customTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customTags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1 text-sm text-[var(--accent)]"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeCustomTag(tag)}
                className="text-xs hover:text-[var(--text-primary)]"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Other text input */}
      {showOtherInput && (
        <input
          type="text"
          value={otherText}
          onChange={(e) => setOtherText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addCustomTag}
          placeholder="Type and press Enter…"
          className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
          autoFocus
        />
      )}
    </div>
  );
}
