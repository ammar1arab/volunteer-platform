'use client';

import styles from './CompleteActivityProgress.module.scss';
import { CheckCircle2, Loader2, Clock, Cpu, Upload, Database, Mail, PartyPopper } from 'lucide-react';

export type StepStatus = 'waiting' | 'running' | 'done';

export interface ProgressStep {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  status: StepStatus;
}

interface Props {
  steps: ProgressStep[];
  isDone: boolean;
  issuedCount: number;
  activityTitle: string;
  onClose: () => void;
}

const CompleteActivityProgress = ({ steps, isDone, issuedCount, activityTitle, onClose }: Props) => {
  const showCelebration = isDone;

  const doneCount = steps.filter(s => s.status === 'done').length;
  const progress = (doneCount / steps.length) * 100;

  return (
    <div className={styles.wrapper}>


      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      {!showCelebration ? (
        <>
          <p className={styles.subtitle}>
            {isDone ? 'اكتمل كل شيء!' : 'يعمل النظام في الخلفية لا تغلق الصفحة'}
          </p>


          <div className={styles.steps}>
            {steps.map((step, i) => (
              <div
                key={step.id}
                className={`${styles.step} ${styles[step.status]}`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >

                {i < steps.length - 1 && (
                  <div className={`${styles.connector} ${step.status === 'done' ? styles.connectorDone : ''}`} />
                )}


                <div className={styles.iconCircle}>
                  {step.status === 'done' && <CheckCircle2 size={16} />}
                  {step.status === 'running' && <Loader2 size={16} className={styles.spin} />}
                  {step.status === 'waiting' && <Clock size={15} />}
                </div>


                <div className={styles.stepText}>
                  <span className={styles.stepLabel}>{step.label}</span>
                  <span className={styles.stepSub}>{step.sublabel}</span>
                </div>


                <div className={styles.stepIcon}>{step.icon}</div>
              </div>
            ))}
          </div>
        </>
      ) : (

        <div className={styles.celebration}>
          <div className={styles.celebrationIcon}>
            <PartyPopper size={40} />
          </div>
          <h3 className={styles.celebrationTitle}>تم بنجاح!</h3>
          <p className={styles.celebrationText}>
            تم إصدار <strong>{issuedCount}</strong> شهادة لمتطوعي نشاط
          </p>
          <p className={styles.celebrationActivity}>&ldquo;{activityTitle}&rdquo;</p>
          <p className={styles.celebrationNote}>
            تم إرسال الشهادات والإشعارات إلى جميع المتطوعين الحاضرين
          </p>
          <button className={styles.btnClose} onClick={onClose}>
            رائع، تم!
          </button>
        </div>
      )}
    </div>
  );
};


export function buildProgressSteps(
  phase: 'idle' | 'running' | 'done',
  runningStepId?: string,
  doneStepIds: string[] = []
): ProgressStep[] {
  const STEP_DEFS = [
    { id: 'complete', label: 'إغلاق النشاط',        sublabel: 'تحديث حالة النشاط في قاعدة البيانات', icon: <Database size={14} /> },
    { id: 'generate', label: 'إنشاء الشهادات',       sublabel: 'توليد ملفات PNG و PDF لكل متطوع',      icon: <Cpu size={14} /> },
    { id: 'upload',   label: 'رفع الملفات',           sublabel: 'رفع الشهادات إلى التخزين السحابي',     icon: <Upload size={14} /> },
    { id: 'save',     label: 'حفظ السجلات',           sublabel: 'تسجيل الشهادات وإنشاء الإشعارات',     icon: <Database size={14} /> },
    { id: 'email',    label: 'إرسال الإيميلات',       sublabel: 'إرسال الشهادات لجميع المتطوعين',      icon: <Mail size={14} /> },
  ];

  return STEP_DEFS.map(def => {
    let status: StepStatus = 'waiting';
    if (doneStepIds.includes(def.id)) status = 'done';
    else if (def.id === runningStepId) status = 'running';
    return { ...def, status };
  });
}

export default CompleteActivityProgress;