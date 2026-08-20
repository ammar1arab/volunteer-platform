import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Mail, Phone, ExternalLink, LucideIcon } from "lucide-react";
import { ROUTES } from "@/presentation/constants";
import styles from "./UserList.module.scss";

export interface UserListMeta {
  icon?: LucideIcon | React.ElementType;
  value: string | number;
  label?: string;
}

export interface UserListDto {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role?: string;
  meta?: UserListMeta[];
  action?: React.ReactNode;
}

interface UserListProps {
  users: UserListDto[];
  layout?: "grid" | "list";
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleUser?: (id: string) => void;
  onNavigate?: (id: string) => void;
  emptyMessage?: string;
}

const UserListItem = ({
  user,
  layout,
  selectable,
  isSelected,
  onToggle,
  onNavigate
}: {
  user: UserListDto;
  layout: "grid" | "list";
  selectable: boolean;
  isSelected: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}) => {
  const handleCardClick = () => {
    if (selectable && onToggle) {
      onToggle();
    } else if (onNavigate) {
      onNavigate();
    }
  };

  const isVolunteer = user.role === "VOLUNTEER" || user.role === undefined;
  const profileUrl = isVolunteer ? ROUTES.ADMIN.USER_DETAILS(user.id) : undefined;

  return (
    <div
      className={`${styles.card} ${selectable || onNavigate || profileUrl ? styles.clickable : ""} ${isSelected ? styles.selected : ""} ${user.role === "ADMIN" ? styles.admin : ""}`}
      onClick={handleCardClick}
    >
      <div className={styles.cardMain}>
        {selectable && (
          <div className={`${styles.checkbox} ${isSelected ? styles.checkboxOn : ""}`}>
            {isSelected && <Check size={14} />}
          </div>
        )}

        <div className={styles.avatar}>
          {user.avatarUrl ? (
            <Image src={user.avatarUrl} alt={user.name} width={42} height={42} className={styles.avatarImg} />
          ) : (
            <span className={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className={styles.info}>
          <div className={styles.nameRow}>
            <h3 className={styles.name} title={user.name}>
              {user.name}
              {!selectable && profileUrl && (
                <Link
                  href={profileUrl}
                  className={styles.profileLink}
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate();
                    } else {
                      e.stopPropagation();
                    }
                  }}
                  title="عرض الملف الشخصي"
                >
                  <ExternalLink size={14} />
                </Link>
              )}
            </h3>
          </div>
          <div className={styles.contact}>
            <div className={styles.contactItem} title={user.email}>
              <Mail size={12} />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className={styles.contactItem} title={user.phone}>
                <Phone size={12} />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.cardRight}>
        {user.meta && user.meta.length > 0 && (
          <div className={styles.stats}>
            {user.meta.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={idx} className={styles.statItem} title={m.label}>
                  {Icon && <Icon size={12} />}
                  <span>{m.value}</span>
                </div>
              );
            })}
          </div>
        )}

        {user.action && (
          <div className={styles.actionWrapper} onClick={(e) => e.stopPropagation()}>
            {user.action}
          </div>
        )}
      </div>

      {selectable && profileUrl && (
        <Link
          href={profileUrl}
          className={styles.absoluteProfileLink}
          onClick={(e) => {
            e.stopPropagation();
          }}
          title="الملف الشخصي"
        >
          <ExternalLink size={14} />
        </Link>
      )}
    </div>
  );
};

export const UserList = ({
  users,
  layout = "grid",
  selectable = false,
  selectedIds = new Set(),
  onToggleUser,
  onNavigate,
  emptyMessage = "لا يوجد مستخدمين لعرضهم."
}: UserListProps) => {
  if (users.length === 0) {
    return (
      <div className={styles.empty}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={layout === "grid" ? styles.gridWrapper : styles.listWrapper}>
      {users.map((user) => (
        <UserListItem
          key={user.id}
          user={user}
          layout={layout}
          selectable={selectable}
          isSelected={selectedIds.has(user.id)}
          onToggle={() => onToggleUser && onToggleUser(user.id)}
          onNavigate={onNavigate ? () => onNavigate(user.id) : undefined}
        />
      ))}
    </div>
  );
};
