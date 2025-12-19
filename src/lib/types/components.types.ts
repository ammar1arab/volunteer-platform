import { ButtonHTMLAttributes } from "react";

export type InputDirMode = "auto" | "rtl" | "ltr";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  dirMode?: InputDirMode;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  loading?: boolean;
}

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}
