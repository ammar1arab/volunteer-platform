"use client";

import { useState } from "react";
import { Edit2, Check, X, Plus } from "lucide-react";
import styles from "./ProfileTagsSection.module.scss";

export interface ProfileTagsEditHandlers {
  editingField: { field: string; value: unknown } | null;
  isSaving: boolean;
  onStartEdit: (field: string, value: unknown) => void;
  onCancel: () => void;
  onUpdate: (value: unknown) => void;
  onSave: () => void;
}

export interface ProfileTagsItem {
  field: string;
  title: string;
  icon: React.ReactNode;
  tags: string[];
  suggestions?: string[];
}

interface ProfileTagsSectionProps extends ProfileTagsEditHandlers {
  title?: string;
  items: ProfileTagsItem[];
}

export default function ProfileTagsSection({
  title = "الملف التطوعي",
  items,
  editingField,
  isSaving,
  onStartEdit,
  onCancel,
  onUpdate,
  onSave
}: ProfileTagsSectionProps) {
  return (
    <section className={styles.section}>
      {title ? <h2 className={styles.sectionTitle}>{title}</h2> : null}
      <div className={styles.grid}>
        {items.map((item) => (
          <ProfileTagsCard
            key={item.field}
            {...item}
            editingField={editingField}
            isSaving={isSaving}
            onStartEdit={onStartEdit}
            onCancel={onCancel}
            onUpdate={onUpdate}
            onSave={onSave}
          />
        ))}
      </div>
    </section>
  );
}

function ProfileTagsCard({
  field,
  title,
  icon,
  tags,
  suggestions = [],
  editingField,
  isSaving,
  onStartEdit,
  onCancel,
  onUpdate,
  onSave
}: ProfileTagsItem & ProfileTagsEditHandlers) {
  const [input, setInput] = useState("");
  const isEditing = editingField?.field === field;
  const current: string[] =
    isEditing && Array.isArray(editingField.value) ? (editingField.value as string[]) : (tags ?? []);

  const add = (value?: string) => {
    const t = (value ?? input).trim();
    if (!t || current.includes(t)) return;
    onUpdate([...current, t]);
    setInput("");
  };

  const remove = (tag: string) => onUpdate(current.filter((t) => t !== tag));

  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <span className={styles.cardIcon}>{icon}</span>
          {title}
        </h3>
        {!isEditing && (
          <button
            type="button"
            className={styles.btnEdit}
            onClick={() => onStartEdit(field, tags ?? [])}
            aria-label={`تعديل ${title}`}
          >
            <Edit2 size={13} />
          </button>
        )}
      </header>

      {isEditing ? (
        <div className={styles.editBody}>
          <div className={styles.inputRow}>
            <input
              type="text"
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
              placeholder="أضف..."
              disabled={isSaving}
            />
            <button
              type="button"
              className={styles.btnAdd}
              onClick={() => add()}
              disabled={isSaving || !input.trim()}
            >
              <Plus size={14} />
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className={styles.suggestions}>
              {suggestions
                .filter((s) => !current.includes(s))
                .slice(0, 6)
                .map((s) => (
                  <button key={s} type="button" className={styles.suggestion} onClick={() => add(s)} disabled={isSaving}>
                    {s}
                  </button>
                ))}
            </div>
          )}

          {current.length > 0 && (
            <div className={styles.tags}>
              {current.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                  <button type="button" className={styles.btnRemove} onClick={() => remove(tag)} disabled={isSaving}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.btnCancel} onClick={onCancel} disabled={isSaving}>
              <X size={13} /> إلغاء
            </button>
            <button type="button" className={styles.btnSave} onClick={onSave} disabled={isSaving}>
              <Check size={13} /> حفظ
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.tags}>
          {(tags ?? []).length > 0 ? (
            tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))
          ) : (
            <span className={styles.empty}>لم يتم الإضافة</span>
          )}
        </div>
      )}
    </article>
  );
}
