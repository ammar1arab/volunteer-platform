"use client";

import { Code2 } from "lucide-react";
import styles from "./DevChip.module.scss";

type Props = {
  label?: string;
  href?: string;
  fixed?: boolean;
  className?: string;
};

const DevChip = ({
  label = "Built by Ammar",
  href = "https://ammararab.com",
  fixed = false,
  className
}: Props) => (
  <a
    className={`${styles.chip} ${fixed ? styles.fixed : ""} ${className || ""}`}
    href={href}
    target="_blank"
    rel="noopener noreferrer"
  >
    <Code2 size={11} strokeWidth={2.5} />
    <span>{label}</span>
  </a>
);

export default DevChip;
