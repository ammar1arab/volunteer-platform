import React from "react";
import { Badge } from "@/presentation/components";
import { SystemLogStatus } from "@/core/domain/enums";

interface Props {
  status: string;
}

export const SystemLogBadge: React.FC<Props> = ({ status }) => {
  let variant: "success" | "danger" | "warning" = "warning";
  let label = "فشل";

  if (status === SystemLogStatus.SUCCESS || status === "SUCCESS") {
    variant = "success";
    label = "نجاح";
  } else if (status === SystemLogStatus.ERROR || status === "ERROR") {
    variant = "danger";
    label = "خطأ";
  }

  return <Badge variant={variant}>{label}</Badge>;
};
