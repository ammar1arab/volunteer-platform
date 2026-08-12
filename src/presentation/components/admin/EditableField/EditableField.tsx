import { Edit2, Check, X } from "lucide-react";
import BirthDateInput from "@/presentation/components/base/BirthDateInput/BirthDateInput";
import Input from "@/presentation/components/base/Input/Input";
import SelectInput from "@/presentation/components/base/SelectInput/SelectInput";
import styles from "./EditableField.module.scss";

type Props<T> = {
  value: string;
  displayValue?: React.ReactNode;
  field: string;
  label: string;
  icon?: React.ReactNode;
  editingField: { field: string; value: T } | null;
  isSaving: boolean;
  onStartEdit: (field: string, value: T) => void;
  onUpdate: (value: T) => void;
  onSave: () => void;
  onCancel: () => void;
  type?: "text" | "email" | "tel" | "select" | "date";
  options?: { value: string; label: string }[];
};

const EditableField = <T,>({
  value,
  displayValue,
  field,
  label,
  icon,
  editingField,
  isSaving,
  onStartEdit,
  onUpdate,
  onSave,
  onCancel,
  type = "text",
  options = [],
}: Props<T>) => {
  const isEditing = editingField?.field === field;
  const editValue = String(editingField?.value ?? "");

  return (
    <div className={styles.row}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        {isEditing ? (
          <div className={styles.edit}>
            <div className={styles.control}>
              {type === "select" ? (
                <SelectInput
                  label=""
                  value={editValue}
                  options={options}
                  onChange={(nextValue) => onUpdate(nextValue as T)}
                  disabled={isSaving}
                />
              ) : type === "date" ? (
                <BirthDateInput
                  label=""
                  value={editValue}
                  onChange={(nextValue) => onUpdate(nextValue as T)}
                  minAge={10}
                  maxAge={100}
                />
              ) : (
                <Input
                  label=""
                  type={type}
                  value={editValue}
                  onChange={(e) => onUpdate(e.target.value as T)}
                  disabled={isSaving}
                  dirMode={type === "email" || type === "tel" ? "ltr" : "auto"}
                  autoFocus
                />
              )}
            </div>
            <div className={styles.actions}>
              <button type="button" className={styles.btnSave} onClick={onSave} disabled={isSaving} aria-label="حفظ">
                <Check size={13} />
              </button>
              <button type="button" className={styles.btnCancel} onClick={onCancel} disabled={isSaving} aria-label="إلغاء">
                <X size={13} />
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.view}>
            <span className={styles.value}>{displayValue || value || "غير محدد"}</span>
            <button
              type="button"
              className={styles.btnEdit}
              onClick={() => onStartEdit(field, value as T)}
              aria-label={`تعديل ${label}`}
            >
              <Edit2 size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditableField;