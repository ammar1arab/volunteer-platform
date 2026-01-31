import styles from "./ParticipationRequestItem.module.scss";
import { User, Mail, Phone, Calendar, CheckCircle, XCircle } from "lucide-react";
import type { ActivityParticipationDto } from "@/lib";

type Props = {
  request: ActivityParticipationDto;
  onApprove: (id: string, name: string) => void;
  onReject: (id: string, name: string) => void;
};

const ParticipationRequestItem = ({ request, onApprove, onReject }: Props) => {
  return (
    <div className={styles.item}>
      <div className={styles.cell}>
        <User size={16} className={styles.icon} />
        <span className={styles.text}>{request.volunteer?.fullName}</span>
      </div>

      <div className={`${styles.cell} ${styles.hideOnMobile}`}>
        <Mail size={16} className={styles.icon} />
        <span className={styles.text}>{request.volunteer?.email}</span>
      </div>

      <div className={styles.cell}>
        <Phone size={16} className={styles.icon} />
        <span className={styles.text}>{request.volunteer?.phone}</span>
      </div>

      <div className={`${styles.cell} ${styles.hideOnMobile}`}>
        <Calendar size={16} className={styles.icon} />
        <span className={styles.text}>
          {new Date(request.activity?.date || "").toLocaleDateString("ar")}
        </span>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.btnReject}
          onClick={() => onReject(request.id, request.volunteer?.fullName || "")}
          title="رفض"
        >
          <XCircle size={16} />
        </button>
        <button
          className={styles.btnApprove}
          onClick={() => onApprove(request.id, request.volunteer?.fullName || "")}
          title="موافقة"
        >
          <CheckCircle size={16} />
        </button>
      </div>
    </div>
  );
};

export default ParticipationRequestItem;