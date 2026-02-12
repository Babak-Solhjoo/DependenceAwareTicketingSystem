import { useEffect, useRef, useState } from "react";

type Option = {
  value: string;
  label: string;
};

type Props = {
  value: string | string[];
  options: Option[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
};

const CustomSelect = ({ value, options, onChange, placeholder, multiple }: Props) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!wrapperRef.current || !(event.target instanceof Node)) {
        return;
      }
      if (!wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isSelected = (optionValue: string) => {
    if (Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };

  const toggleValue = (optionValue: string) => {
    if (Array.isArray(value)) {
      const next = value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue];
      onChange(next);
      return;
    }
    onChange(optionValue);
    setOpen(false);
  };

  const selectedLabels = () => {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return placeholder ?? "Select";
      }
      return options
        .filter((option) => value.includes(option.value))
        .map((option) => option.label)
        .join(", ");
    }
    if (!value) {
      return placeholder ?? "Select";
    }
    return options.find((option) => option.value === value)?.label ?? placeholder ?? "Select";
  };

  const isEmpty = Array.isArray(value) ? value.length === 0 : !value;

  return (
    <div className="select-shell" ref={wrapperRef}>
      <button
        type="button"
        className={`select-trigger${open ? " open" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`select-label${isEmpty ? " muted" : ""}`}>{selectedLabels()}</span>
        <span className="select-arrow" aria-hidden="true" />
      </button>
      {open && (
        <div className="select-menu" role="listbox">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`select-option${isSelected(option.value) ? " selected" : ""}`}
              onClick={() => toggleValue(option.value)}
              role="option"
              aria-selected={isSelected(option.value)}
            >
              {multiple && (
                <span className={`select-check${isSelected(option.value) ? " checked" : ""}`} />
              )}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
