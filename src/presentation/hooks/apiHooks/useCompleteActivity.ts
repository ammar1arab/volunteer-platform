"use client";

import { useCallback, useRef, useState } from "react";

export type CompletionStepStatus = "waiting" | "running" | "done";

export interface CompletionStep {
  id: string;
  label: string;
  status: CompletionStepStatus;
}

export type CompletionState =
  | { phase: "idle" }
  | { phase: "running"; steps: CompletionStep[] }
  | { phase: "done"; steps: CompletionStep[]; issuedCount: number }
  | { phase: "error"; message: string };

const STEP_DURATIONS: Record<string, number> = {
  generate: 60_000,
  upload: 15_000,
  save: 5_000,
  email: 8_000
};

const INITIAL_STEPS: CompletionStep[] = [
  { id: "complete", label: "تم تحديث حالة النشاط", status: "waiting" },
  { id: "generate", label: "جاري إنشاء الشهادات", status: "waiting" },
  { id: "upload", label: "جاري رفع الملفات إلى التخزين", status: "waiting" },
  { id: "save", label: "جاري حفظ السجلات وإنشاء الإشعارات", status: "waiting" },
  { id: "email", label: "جاري إرسال الإيميلات للمتطوعين", status: "waiting" }
];

export const useCompleteActivity = () => {
  const [state, setState] = useState<CompletionState>({ phase: "idle" });
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const setStepStatus = (steps: CompletionStep[], id: string, status: CompletionStepStatus): CompletionStep[] =>
    steps.map((s) => (s.id === id ? { ...s, status } : s));

  const startAnimation = useCallback((issuedCount: number) => {
    clearTimeouts();

    const steps: CompletionStep[] = INITIAL_STEPS.map((s) => ({ ...s }));

    steps[0] = { ...steps[0], status: "done" };
    steps[1] = { ...steps[1], status: "running" };
    setState({ phase: "running", steps: [...steps] });

    let elapsed = 0;
    const backgroundSteps = ["generate", "upload", "save", "email"];

    backgroundSteps.forEach((stepId, i) => {
      const duration = STEP_DURATIONS[stepId];
      const nextStepId = backgroundSteps[i + 1];

      const t = setTimeout(() => {
        setState((prev) => {
          if (prev.phase !== "running") return prev;
          let updated = setStepStatus(prev.steps, stepId, "done");
          if (nextStepId) updated = setStepStatus(updated, nextStepId, "running");
          return { phase: "running", steps: updated };
        });
      }, elapsed + duration);

      timeoutsRef.current.push(t);
      elapsed += duration;
    });

    const totalDuration = Object.values(STEP_DURATIONS).reduce((a, b) => a + b, 0);
    const finalTimeout = setTimeout(() => {
      setState({
        phase: "done",
        steps: INITIAL_STEPS.map((s) => ({ ...s, status: "done" })),
        issuedCount
      });
    }, totalDuration);

    timeoutsRef.current.push(finalTimeout);
  }, []);

  const reset = useCallback(() => {
    clearTimeouts();
    setState({ phase: "idle" });
  }, []);

  return { state, startAnimation, reset };
};
