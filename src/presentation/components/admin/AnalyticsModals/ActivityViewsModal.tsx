"use client";

import React from "react";
import { Modal, LoadingState, EmptyState } from "@/presentation/components";
import { Eye } from "lucide-react";
import styles from "./AnalyticsModals.module.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ActivityViewsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تحليلات مشاهدات الأنشطة" size="lg">
      <div className={styles.container} style={{ minHeight: "400px" }}>
        <div className={styles.header}>
          <h3>الأنشطة الأكثر تفاعلاً</h3>
          <p className={styles.secondaryText}>إحصائيات دقيقة لمشاهدات الأنشطة التطوعية</p>
        </div>
        
        {/* Placeholder for rich chart/list */}
        <EmptyState
          icon={Eye}
          title="جاري تجميع البيانات"
          message="سيتم عرض تفاصيل مشاهدات كل نشاط هنا قريباً لتقديم تحليلات أعمق."
        />
      </div>
    </Modal>
  );
};

export default ActivityViewsModal;
