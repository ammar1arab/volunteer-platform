"use client";

import { useState, useTransition } from "react";
import { ADMIN_PERMISSIONS } from "@/core/domain/enums";
import type { AdminPermission } from "@/core/domain/enums";
import { userApi } from "@/presentation/services";

interface Props {
  userId: string;
  initialPermissions: string[];
  onSuccess?: (permissions: string[]) => void;
  onError?: (message: string) => void;
}

export function usePermissionsPanel({ userId, initialPermissions, onSuccess, onError }: Props) {
  const [permissions, setPermissions] = useState<string[]>(initialPermissions);
  const [isPending, startTransition] = useTransition();

  const save = (next: string[], rollback: string[]) => {
    startTransition(async () => {
      try {
        const res = await userApi.updatePermissions(userId, next);
        if (res.success) {
          onSuccess?.(next);
        } else {
          setPermissions(rollback);
          onError?.(res.error?.message ?? "حدث خطأ");
        }
      } catch {
        setPermissions(rollback);
        onError?.("حدث خطأ أثناء تحديث الصلاحيات");
      }
    });
  };

  const toggle = (permission: AdminPermission) => {
    const prev = permissions;
    const next = permissions.includes(permission)
      ? permissions.filter((p) => p !== permission)
      : [...permissions, permission];
    setPermissions(next);
    save(next, prev);
  };

  const grantAll = () => {
    const prev = permissions;
    const next = [...ADMIN_PERMISSIONS];
    setPermissions(next);
    save(next, prev);
  };

  const revokeAll = () => {
    const prev = permissions;
    setPermissions([]);
    save([], prev);
  };

  return {
    permissions,
    isPending,
    toggle,
    grantAll,
    revokeAll,
    allGranted: ADMIN_PERMISSIONS.every((p) => permissions.includes(p)),
    noneGranted: permissions.length === 0,
  };
}