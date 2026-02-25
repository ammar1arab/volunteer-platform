"use client";
import styles from "./Search.module.scss";
import { useSearch } from "./Search.logic";
import { Search as SearchIcon, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

const Search = ({ value, onChange, onSearch, placeholder = "بحث...", disabled }: Props) => {
  const { inputRef, handleClear, handleKeyDown, handleChange } = useSearch({ onChange, onSearch });

  return (
    <div className={`${styles.wrapper} ${value ? styles.active : ""}`}>
      <button
        className={styles.searchBtn}
        onClick={() => onSearch(value)}
        type="button"
        disabled={disabled}
      >
        <SearchIcon size={15} />
      </button>
      <input
        ref={inputRef}
        className={styles.input}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      {value && (
        <button className={styles.clear} onClick={handleClear} type="button">
          <X size={13} />
        </button>
      )}
    </div>
  );
};

export default Search;