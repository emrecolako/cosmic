"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useI18n } from "@/components/LocaleProvider";
import { cn } from "@/lib/utils";
import { FieldLabel } from "@/components/ui/Field";
import { searchPlaces, type PlaceSuggestion } from "@/lib/place-search";

const inputStyles =
  "w-full bg-transparent border border-line rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:border-ink-muted focus-visible:ring-1 focus-visible:ring-ink-muted transition-all";

const DEBOUNCE_MS = 250;

interface PlaceAutocompleteProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function PlaceAutocomplete({
  label,
  placeholder,
  value,
  onChange,
}: PlaceAutocompleteProps) {
  const { locale } = useI18n();
  const id = useId();
  const listId = `${id}-list`;
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
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
      const results = await searchPlaces(value, locale, controller.signal);
      if (controller.signal.aborted) return;
      setSuggestions(results);
      setActiveIndex(-1);
      setOpen(results.length > 0);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [locale, value]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  const select = (suggestion: PlaceSuggestion) => {
    onChange(suggestion.label);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!open) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        index <= 0 ? suggestions.length - 1 : index - 1
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      select(suggestions[activeIndex] ?? suggestions[0]);
    } else if (event.key === "Escape") {
      event.stopPropagation();
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
        aria-activedescendant={
          activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
        }
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          userTyped.current = true;
          onChange(event.target.value);
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
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.label}-${index}`}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(event) => {
                event.preventDefault();
                select(suggestion);
              }}
              onMouseEnter={() => setActiveIndex(index)}
              className={cn(
                "px-3 py-2 font-mono text-xs tracking-wider cursor-pointer transition-colors",
                index === activeIndex
                  ? "bg-ink text-base"
                  : "text-ink-secondary"
              )}
            >
              {suggestion.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
