"use client";

import React from "react";
import { Modal, EmptyState } from "@/presentation/components";
import { Download } from "lucide-react";
import styles from "./AnalyticsModals.module.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const MagazineDownloadsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إحصائيات تحميل المجلة" size="lg">
      <div className={styles.container} style={{ minHeight: "350px" }}>
        <div className={styles.header}>
          <h3>أداء المجلة الشهرية</h3>
          <p className={styles.secondaryText}>معدلات التحميل والاهتمام بالإصدارات المختلفة</p>
        </div>
        
        <EmptyState
          icon={Download}
          title="تحديث البيانات"
          message="نقوم بجمع أرقام التحميلات من الخوادم، ستظهر النتائج هنا."
        />
      </div>
    </Modal>
  );
};

export default MagazineDownloadsModal;
