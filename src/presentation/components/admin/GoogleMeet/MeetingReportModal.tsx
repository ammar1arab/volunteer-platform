"use client";

import styles from "./MeetingReportModal.module.scss";
import { useMemo, useState } from "react";
import {
  Modal,
  LoadingState,
  EmptyState,
  Button,
  SelectInput,
  Badge
} from "@/presentation/components";
import { useMeetingReport, useMatchAttendee } from "@/presentation/hooks";
import { MeetingAttendeeMatchStatus } from "@/core/domain/enums";
import { Clock3, Mail, UserRound, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";

type MatchOption = { value: string; label: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
  activityTitle: string;
  matchOptions?: MatchOption[];
  onMatched?: () => void;
};

const formatMinutes = (seconds: number) => {
  const mins = Math.max(0, Math.round(seconds / 60));
  return `${mins} د`;
};

const MeetingReportModal = ({
  isOpen,
  onClose,
  activityId,
  activityTitle,
  matchOptions = [],
  onMatched
}: Props) => {
  const { report, loading, error } = useMeetingReport(activityId, { enabled: isOpen });
  const { match, submitting } = useMatchAttendee(activityId);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [draftMatches, setDraftMatches] = useState<Record<string, string>>({});
  const [draftsFor, setDraftsFor] = useState("");

  if (activityId !== draftsFor && report) {
    const next: Record<string, string> = {};
    for (const attendee of report.attendees) {
      if (attendee.matchedUserId) next[attendee.id] = attendee.matchedUserId;
    }
    setDraftMatches(next);
    setDraftsFor(activityId);
  }

  const unmatched = useMemo(
    () =>
      (report?.attendees ?? []).filter(
        (a) => a.matchStatus === MeetingAttendeeMatchStatus.UNMATCHED || !a.matchedUserId
      ),
    [report]
  );

  const handleSaveMatch = async (attendeeId: string) => {
    const userId = draftMatches[attendeeId] || null;
    if (!userId) return;
    setSavingId(attendeeId);
    try {
      await match(attendeeId, userId);
      onMatched?.();
    } finally {
      setSavingId(null);
    }
  };

  const handleClearMatch = async (attendeeId: string) => {
    setSavingId(attendeeId);
    try {
      await match(attendeeId, null);
      setDraftMatches((prev) => {
        const next = { ...prev };
        delete next[attendeeId];
        return next;
      });
      onMatched?.();
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`تقرير الحضور · ${activityTitle}`} size="md">
      <div className={styles.wrap}>
        {loading ? (
          <LoadingState compact />
        ) : error ? (
          <EmptyState icon={Users} message={error} />
        ) : !report ? (
          <EmptyState icon={Users} message="لا يوجد تقرير حضور مستورد بعد" />
        ) : (
          <>
            <div className={styles.summary}>
              <span>الحضور: {report.attendeeCount}</span>
              <span>مطابق: {report.matchedCount}</span>
              <span className={report.unmatchedCount > 0 ? styles.warn : undefined}>
                غير مطابق: {report.unmatchedCount}
              </span>
              {report.importedAt && (
                <span className={styles.label}>
                  استيراد: {formatDate(report.importedAt)}
                </span>
              )}
            </div>

            {unmatched.length > 0 && matchOptions.length > 0 && (
              <p className={styles.hint}>
                طابق الأسماء غير المعروفة يدوياً مع متطوعي النشاط المعتمدين.
              </p>
            )}

            <div className={styles.list}>
              {report.attendees.map((attendee) => {
                const isUnmatched =
                  attendee.matchStatus === MeetingAttendeeMatchStatus.UNMATCHED ||
                  !attendee.matchedUserId;
                return (
                  <article
                    key={attendee.id}
                    className={`${styles.row} ${isUnmatched ? styles.rowWarn : ""}`}
                  >
                    <div className={styles.rowMain}>
                      <div className={styles.nameRow}>
                        <UserRound size={14} />
                        <strong>{attendee.displayName}</strong>
                      </div>
                      <div className={styles.meta}>
                        <span>
                          <Clock3 size={12} />
                          {formatMinutes(attendee.attendedSeconds)}
                        </span>
                        {attendee.signedInEmail && (
                          <span dir="ltr">
                            <Mail size={12} />
                            {attendee.signedInEmail}
                          </span>
                        )}
                        <Badge variant={isUnmatched ? "warning" : "success"}>
                          {isUnmatched ? "غير مطابق" : "مطابق"}
                        </Badge>
                      </div>
                    </div>

                    {isUnmatched && matchOptions.length > 0 ? (
                      <div className={styles.matchActions}>
                        <SelectInput
                          label="مطابقة مع"
                          value={draftMatches[attendee.id] || ""}
                          options={[{ value: "", label: "اختر متطوعاً" }, ...matchOptions]}
                          onChange={(v) =>
                            setDraftMatches((prev) => ({ ...prev, [attendee.id]: v }))
                          }
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          loading={savingId === attendee.id || submitting}
                          disabled={!draftMatches[attendee.id]}
                          onClick={() => handleSaveMatch(attendee.id)}
                        >
                          مطابقة
                        </Button>
                      </div>
                    ) : attendee.matchedUserId ? (
                      <button
                        type="button"
                        className={styles.clearBtn}
                        disabled={savingId === attendee.id || submitting}
                        onClick={() => handleClearMatch(attendee.id)}
                      >
                        إلغاء المطابقة
                      </button>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default MeetingReportModal;
