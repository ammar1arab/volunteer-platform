"use client";

import React from "react";
import { Modal, EmptyState } from "@/presentation/components";
import { ActivitySquare } from "lucide-react";
import styles from "./AnalyticsModals.module.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SystemOperationsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تحليل عمليات النظام" size="lg">
      <div className={styles.container} style={{ minHeight: "450px" }}>
        <div className={styles.header}>
          <h3>سجل العمليات الحيوية</h3>
          <p className={styles.secondaryText}>نظرة شاملة على تسجيلات الدخول، الأخطاء، والنشاط العام للنظام</p>
        </div>
        
        <EmptyState
          icon={ActivitySquare}
          title="تحليل شامل"
          message="هذه النافذة ستوفر رسوماً بيانية تفصيلية لعمليات النظام."
        />
      </div>
    </Modal>
  );
};

export default SystemOperationsModal;
