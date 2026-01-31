import Image from "next/image";
import { User } from "lucide-react";
import styles from "./Avatar.module.scss";

interface AvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  fallbackText?: string;
}

export default function Avatar({ src, alt, size = "md", fallbackText }: AvatarProps) {
  const sizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };

  const dimension = sizeMap[size];

  if (src) {
    return (
      <div className={`${styles.avatar} ${styles[size]}`}>
        <Image
          src={src}
          alt={alt}
          width={dimension}
          height={dimension}
          className={styles.image}
          priority
        />
      </div>
    );
  }

  if (fallbackText) {
    const initial = fallbackText.charAt(0).toUpperCase();
    return (
      <div className={`${styles.avatar} ${styles[size]} ${styles.fallback}`}>
        <span className={styles.initial}>{initial}</span>
      </div>
    );
  }

  return (
    <div className={`${styles.avatar} ${styles[size]} ${styles.icon}`}>
      <User size={dimension * 0.5} />
    </div>
  );
}