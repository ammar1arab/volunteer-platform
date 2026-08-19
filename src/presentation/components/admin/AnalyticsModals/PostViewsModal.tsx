"use client";

import React from "react";
import { Modal, EmptyState } from "@/presentation/components";
import { FileText } from "lucide-react";
import styles from "./AnalyticsModals.module.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PostViewsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تفاعل المقالات المتميزة" size="lg">
      <div className={styles.container} style={{ minHeight: "350px" }}>
        <div className={styles.header}>
          <h3>المقالات الأكثر قراءة</h3>
          <p className={styles.secondaryText}>متابعة مستمرة لمدى وصول المقالات للجمهور</p>
        </div>
        
        <EmptyState
          icon={FileText}
          title="بيانات قيد المعالجة"
          message="يتم الآن حساب تفاعل المستخدمين مع المقالات لعرضها بشكل منظم."
        />
      </div>
    </Modal>
  );
};

export default PostViewsModal;
