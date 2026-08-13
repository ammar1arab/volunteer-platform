"use client";

import { Mic } from "lucide-react";
import Badge from "@/presentation/components/base/Badge/Badge";
import { ACTIVITY_PRESENTER_LABEL } from "@/presentation/constants";

type Props = {
  name?: string | null;
};

const ActivityPresenterBadge = ({ name }: Props) => {
  const trimmed = name?.trim();
  if (!trimmed) return null;

  return (
    <Badge variant="success">
      <Mic size={11} aria-hidden />
      <span title={`${ACTIVITY_PRESENTER_LABEL}: ${trimmed}`}>{trimmed}</span>
    </Badge>
  );
};

export default ActivityPresenterBadge;
