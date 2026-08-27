"use client";
import { Modal, Button, Share } from "@/presentation/components";
import { Share2, MapPinned } from "lucide-react";
import styles from "./LocationModal.module.scss";

type LocationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  placeName: string;
  mapsUrl: string;
};

export default function LocationModal({ isOpen, onClose, placeName, mapsUrl }: LocationModalProps) {
  if (!mapsUrl) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={placeName} size="sm">
      <div className={styles.locActions}>
        <Share
          trigger={(openShare) => (
            <Button 
              variant="ghost" 
              icon={<Share2 size={16} />} 
              onClick={() => openShare({ title: placeName, text: `${placeName}\n${mapsUrl}` })}
            >
              مشاركة
            </Button>
          )}
        />
        <Button 
          variant="primary" 
          icon={<MapPinned size={16} />} 
          onClick={() => {
            window.open(mapsUrl, "_blank", "noopener,noreferrer");
            onClose();
          }}
        >
          خرائط جوجل
        </Button>
      </div>
    </Modal>
  );
}
