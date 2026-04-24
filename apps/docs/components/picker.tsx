"use client";

import type { ReactNode } from "react";

export type PickerOption = {
  value: string;
  label: string;
  preview?: ReactNode;
};

type PickerProps = {
  id: string;
  label: string;
  value: string;
  preview?: ReactNode;
  options: PickerOption[];
  onSelect: (value: string) => void;
  search?: boolean;
  searchPlaceholder?: string;
};

export function Picker({
  id,
  label,
  value,
  preview,
  options,
  onSelect,
  search,
  searchPlaceholder = "Search...",
}: PickerProps) {
  return (
    <div className="combobox w-full">
      <button
        className="relative w-full rounded-lg px-3 py-2 text-left ring-1 ring-foreground/10 hover:bg-muted transition-colors outline-none focus-visible:ring-foreground/50"
        type="button"
        id={id}
        data-sp-toggle="combobox"
        aria-expanded="false"
      >
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-sm font-medium">
            {options.find((o) => o.value === value)?.label ?? value}
          </span>
        </div>
        {preview && (
          <span className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center">
            {preview}
          </span>
        )}
      </button>
      <div className="combobox-menu w-full" role="listbox">
        {search && (
          <div className="combobox-search">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg>
            <input
              className="combobox-input"
              type="text"
              placeholder={searchPlaceholder}
            />
          </div>
        )}
        <div className="combobox-list">
          {options.map((option) => (
            <div
              key={option.value}
              className="combobox-item"
              role="option"
              tabIndex={0}
              aria-selected={value === option.value}
              onClick={() => onSelect(option.value)}
            >
              <input
                type="radio"
                className="sr-only"
                tabIndex={-1}
                name={id}
                value={option.value}
                checked={value === option.value}
                readOnly
              />
              {option.preview}
              {option.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
