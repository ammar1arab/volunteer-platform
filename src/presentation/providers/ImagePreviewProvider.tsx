"use client";

import { createContext, useContext, useState, useRef, ReactNode } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import styles from "@/presentation/styles/components/ImagePreview.module.scss";

interface ImagePreviewContextType {
  previewImage: (url: string, alt?: string) => void;
}

const ImagePreviewContext = createContext<ImagePreviewContextType | undefined>(undefined);

export const useImagePreview = () => {
  const context = useContext(ImagePreviewContext);
  if (!context) throw new Error("useImagePreview missing provider");
  return context;
};

export const ImagePreviewProvider = ({ children }: { children: ReactNode }) => {
  const [image, setImage] = useState<{ url: string; alt: string } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const previewImage = (url: string, alt: string = "Preview") => {
    setImage({ url, alt });
    dialogRef.current?.showModal();
  };

  const closePreview = () => dialogRef.current?.close();

  return (
    <ImagePreviewContext.Provider value={{ previewImage }}>
      {children}
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        onClose={() => setImage(null)}
        onClick={(e) => e.target === dialogRef.current && closePreview()}
      >
        {image && (
          <div className={styles.content}>
            <button className={styles.closeBtn} onClick={closePreview} aria-label="إغلاق">
              <X size={24} />
            </button>
            <Image src={image.url} alt={image.alt} fill className={styles.image} sizes="100vw" />
          </div>
        )}
      </dialog>
    </ImagePreviewContext.Provider>
  );
};
