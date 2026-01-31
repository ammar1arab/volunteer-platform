import { Edit2, Check, X } from "lucide-react";
import styles from "./EditableField.module.scss";

type Props = {
  value: string;
  isEditing: boolean;
  isSaving?: boolean;
  onChange: (value: string) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  type?: "text" | "textarea" | "select" | "date";
  options?: { value: string; label: string }[];
};

const EditableField = ({
  value,
  isEditing,
  isSaving = false,
  onChange,
  onEdit,
  onSave,
  onCancel,
  type = "text",
  options = [],
}: Props) => {
  if (!isEditing) {
    return (
      <div className={styles.view}>
        <span className={styles.value}>{value || "غير محدد"}</span>
        <button className={styles.btnEdit} onClick={onEdit}>
          <Edit2 size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.edit}>
      {type === "textarea" ? (
        <textarea className={styles.textarea} value={value} onChange={(e) => onChange(e.target.value)} disabled={isSaving} rows={4} />
      ) : type === "select" ? (
        <select className={styles.select} value={value} onChange={(e) => onChange(e.target.value)} disabled={isSaving}>
          <option value="">اختر</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isSaving}
        />
      )}
      <div className={styles.actions}>
        <button className={styles.btnSave} onClick={onSave} disabled={isSaving}>
          <Check size={14} />
        </button>
        <button className={styles.btnCancel} onClick={onCancel} disabled={isSaving}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default EditableField;