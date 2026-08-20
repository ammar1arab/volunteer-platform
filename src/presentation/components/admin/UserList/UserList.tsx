import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, Award, Clock, MapPin, User2 } from "lucide-react";
import { ROUTES } from "@/presentation/constants";
import styles from "./UserList.module.scss";

export interface UserListDto {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  gender?: string;
  hours?: number;
  certifications?: number;
  avatarUrl?: string;
  role?: string;
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
      className={`${styles.card} ${profileUrl ? styles.clickable : ""} ${isSelected ? styles.selected : ""} ${user.role === "ADMIN" ? styles.admin : ""}`}
      onClick={() => {
        if (profileUrl) {
          window.location.href = profileUrl;
        } else if (onNavigate) {
          onNavigate();
        }
      }}
    >
      <div className={styles.cardMain}>
        {selectable && (
          <div 
            className={`${styles.checkbox} ${isSelected ? styles.checkboxOn : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              if (onToggle) onToggle();
            }}
          >
            {isSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
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
            {user.city && (
              <div className={styles.contactItem} title={user.city}>
                <MapPin size={12} />
                <span>{user.city}</span>
              </div>
            )}
            {user.gender && (
              <div className={styles.contactItem} title={user.gender}>
                <User2 size={12} />
                <span>{user.gender}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.cardRight}>
        {(user.hours !== undefined || user.certifications !== undefined) && (
          <div className={styles.stats}>
            {user.certifications !== undefined && (
              <div className={styles.statItem} title="الشهادات">
                <Award size={12} />
                <span>{user.certifications}</span>
              </div>
            )}
            {user.hours !== undefined && (
              <div className={styles.statItem} title="الساعات التطوعية">
                <Clock size={12} />
                <span>{user.hours} ساعة</span>
              </div>
            )}
          </div>
        )}

        {user.action && (
          <div className={styles.actionWrapper} onClick={(e) => e.stopPropagation()}>
            {user.action}
          </div>
        )}
      </div>

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
