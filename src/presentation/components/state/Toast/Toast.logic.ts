import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
} as const;
