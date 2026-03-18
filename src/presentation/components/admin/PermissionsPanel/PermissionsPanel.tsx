"use client";

import styles from "./PermissionsPanel.module.scss";
import { usePermissionsPanel } from "./PermissionsPanel.logic";
import { ADMIN_PERMISSIONS } from "@/core/domain/enums";
import type { AdminPermission } from "@/core/domain/enums";
import { PERMISSION_LABELS } from "@/presentation/constants";

interface Props {
  userId: string;
  initialPermissions: string[];
  onSuccess?: (permissions: string[]) => void;
  onError?: (message: string) => void;
}

const PermissionsPanel = ({ userId, initialPermissions, onSuccess, onError }: Props) => {
  const { permissions, isPending, toggle, grantAll, revokeAll, allGranted, noneGranted } =
    usePermissionsPanel({ userId, initialPermissions, onSuccess, onError });

  const activeCount = permissions.length;

  return (
    <div className={`${styles.panel} ${isPending ? styles.pending : ""}`}>
      <div className={styles.panelTop}>
        <span className={styles.counter}>
          <span className={styles.counterNum}>{activeCount}</span>
          <span className={styles.counterTotal}>/ {ADMIN_PERMISSIONS.length}</span>
        </span>
        <div className={styles.bulkActions}>
          <button className={styles.bulkBtn} onClick={grantAll} disabled={isPending || allGranted}>
            منح الكل
          </button>
          <button
            className={`${styles.bulkBtn} ${styles.bulkDanger}`}
            onClick={revokeAll}
            disabled={isPending || noneGranted}
          >
            سحب الكل
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {ADMIN_PERMISSIONS.map((permission) => {
          const isOn = permissions.includes(permission);
          return (
            <button
              key={permission}
              className={`${styles.permBtn} ${isOn ? styles.permOn : styles.permOff}`}
              onClick={() => toggle(permission as AdminPermission)}
              disabled={isPending}
              type="button"
            >
              <span className={styles.dot} />
              <span className={styles.permName}>
                {PERMISSION_LABELS[permission as AdminPermission]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PermissionsPanel;