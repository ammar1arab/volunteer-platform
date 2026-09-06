"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Phone, Award, Clock, MapPin, User2, LucideIcon } from "lucide-react";
import { ROUTES } from "@/presentation/constants";
import { useImagePreview } from "@/presentation/providers/ImagePreviewProvider";
import { getFallbackProfileImage } from "@/lib/utils/image";
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
  city?: string;
  gender?: string;
  hours?: number;
  certifications?: number;
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
  onNavigate,
  onOpenProfile
}: {
  user: UserListDto;
  layout: "grid" | "list";
  selectable: boolean;
  isSelected: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
  onOpenProfile: (url: string) => void;
}) => {
  const isVolunteer = user.role === "VOLUNTEER" || user.role === undefined;
  const profileUrl = isVolunteer ? ROUTES.ADMIN.USER_DETAILS(user.id) : undefined;
  const { previewImage } = useImagePreview();
  const displayImage = getFallbackProfileImage(user.avatarUrl, user.gender);

  return (
    <div
      className={`${styles.card} ${profileUrl ? styles.clickable : ""} ${isSelected ? styles.selected : ""} ${user.role === "ADMIN" ? styles.admin : ""}`}
      onClick={() => {
        if (profileUrl) {
          onOpenProfile(profileUrl);
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
          <Image 
            src={displayImage} 
            alt={user.name} 
            width={42} 
            height={42} 
            className={styles.avatarImg}
            onClick={(e) => {
              e.stopPropagation();
              previewImage(displayImage);
            }}
            style={{ cursor: 'pointer', objectFit: 'cover' }}
          />
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
            {user.meta && user.meta.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={`meta-${idx}`} className={styles.contactItem} title={m.label}>
                  {Icon && <Icon size={12} />}
                  <span>{m.value}</span>
                </div>
              );
            })}
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
  const router = useRouter();
  const openProfile = useCallback((url: string) => {
    router.push(url);
  }, [router]);

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
          onOpenProfile={openProfile}
        />
      ))}
    </div>
  );
};
