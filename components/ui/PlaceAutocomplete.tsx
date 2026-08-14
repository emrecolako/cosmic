"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { FieldLabel } from "@/components/ui/Field";
import { searchPlaces, PlaceSuggestion } from "@/lib/place-search";

const inputStyles =
  "w-full bg-transparent border border-line rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:border-ink-muted focus-visible:ring-1 focus-visible:ring-ink-muted transition-all";

const DEBOUNCE_MS = 250;

interface PlaceAutocompleteProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * City input with search-as-you-type suggestions. Free typing always works —
 * suggestions are an assist, not a constraint (the geocoder resolves whatever
 * string ends up submitted).
 */
export default function PlaceAutocomplete({
  label,
  placeholder,
  value,
  onChange,
}: PlaceAutocompleteProps) {
  const id = useId();
  const listId = `${id}-list`;
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Search only after the user actually types. Value changes that arrive from
  // outside — the sessionStorage restore on mount, or picking a suggestion —
  // must not pop the dropdown open over the rest of the form.
  const userTyped = useRef(false);

  useEffect(() => {
    if (!userTyped.current) return;
    userTyped.current = false;
    if (value.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const results = await searchPlaces(value, controller.signal);
      if (controller.signal.aborted) return;
      setSuggestions(results);
      setActiveIndex(-1);
      setOpen(results.length > 0);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value]);

  // Close on outside click.
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const select = (suggestion: PlaceSuggestion) => {
    onChange(suggestion.label);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      // Keep the wizard's global Enter-to-advance from firing while choosing.
      e.preventDefault();
      e.stopPropagation();
      select(suggestions[activeIndex] ?? suggestions[0]);
    } else if (e.key === "Escape") {
      e.stopPropagation();
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          userTyped.current = true;
          onChange(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        className={inputStyles}
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 left-0 right-0 mt-1 bg-base border border-line rounded-md overflow-hidden animate-fade-in"
        >
          {suggestions.map((s, i) => (
            <li
              key={`${s.label}-${i}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              // onMouseDown so selection wins the race against input blur
              onMouseDown={(e) => {
                e.preventDefault();
                select(s);
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={cn(
                "px-3 py-2 font-mono text-xs tracking-wider cursor-pointer transition-colors",
                i === activeIndex ? "bg-ink text-base" : "text-ink-secondary"
              )}
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
