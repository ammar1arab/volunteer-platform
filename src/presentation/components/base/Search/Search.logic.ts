import { useRef, useCallback } from "react";

type Props = {
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
};

export const useSearch = ({ onChange, onSearch }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (newValue: string) => {
      onChange(newValue);
      if (newValue === "") onSearch("");
    },
    [onChange, onSearch]
  );

  const handleClear = useCallback(() => {
    onChange("");
    onSearch("");
    inputRef.current?.focus();
  }, [onChange, onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, value: string) => {
      if (e.key === "Enter") onSearch(value);
    },
    [onSearch]
  );

  return { inputRef, handleClear, handleKeyDown, handleChange };
};
