"use client";
import { ChevronDown, X } from "lucide-react";
import { useMultiSelect, SelectOption } from "./MultiSelectInput.logic";
import styles from "./MultiSelectInput.module.scss";

interface MultiSelectInputProps {
    label?: string;
    values: string[];
    options: SelectOption[];
    onChange: (values: string[]) => void;
    error?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    maxSelections?: number;
}

const MultiSelectInput = ({ label, values, options, onChange, error, placeholder = "اختر...", required = false, disabled = false, maxSelections }: MultiSelectInputProps) => {
    const { isOpen, close, containerRef, selectedOptions, canAddMore, toggleDropdown, handleToggle, handleRemove, handleKeyDown } =
        useMultiSelect({ values, options, onChange, disabled, maxSelections });

    return (
        <div className={styles.wrapper}>
            {label && <label className={styles.label}>{label}{required && <span className={styles.required}>*</span>}</label>}

            <div ref={containerRef} className={`${styles.container} ${isOpen ? styles.open : ""} ${error ? styles.error : ""} ${disabled ? styles.disabled : ""}`}>
                {isOpen && (
                    <button
                        type="button"
                        aria-label="إغلاق القائمة"
                        onClick={close}
                        style={{ position: "fixed", inset: 0, zIndex: 999, background: "transparent", border: 0 }}
                    />
                )}
                <button type="button" className={styles.trigger} onClick={toggleDropdown} onKeyDown={handleKeyDown} disabled={disabled}>
                    <div className={styles.content}>
                        {selectedOptions.length === 0 ? <span className={styles.placeholder}>{placeholder}</span> :
                            <div className={styles.tags}>
                                {selectedOptions.map(o => (
                                    <span key={o.value} className={styles.tag}>
                                        {o.label}
                                        {!disabled && <span className={styles.tagRemove} onClick={e => handleRemove(o.value, e)} role="button" tabIndex={0}><X size={14} /></span>}
                                    </span>
                                ))}
                            </div>
                        }
                    </div>
                    <ChevronDown className={`${styles.icon} ${isOpen ? styles.iconOpen : ""}`} size={20} />
                </button>

                {isOpen && <ul className={styles.menu} role="listbox" aria-multiselectable="true">
                    {options.map(o => {
                        const selected = values.includes(o.value);
                        const disabledOption = !selected && !canAddMore;
                        return (
                            <li key={o.value} className={`${styles.option} ${selected ? styles.selected : ""} ${disabledOption ? styles.optionDisabled : ""}`}
                                onClick={() => !disabledOption && handleToggle(o.value)} role="option" aria-selected={selected} aria-disabled={disabledOption}>
                                <input type="checkbox" checked={selected} readOnly className={styles.checkbox} disabled={disabledOption} tabIndex={-1} />
                                <span>{o.label}</span>
                            </li>
                        );
                    })}
                </ul>}
            </div>

            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
};

export default MultiSelectInput;
export type { SelectOption };
