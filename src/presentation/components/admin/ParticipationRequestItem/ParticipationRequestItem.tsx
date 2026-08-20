import styles from "./ParticipationRequestItem.module.scss";
import { ActivityParticipationDto } from "@/core/application/dtos";
import { User, Mail, Phone, MapPin, Calendar, CheckCircle, XCircle } from "lucide-react";
import { getCityLabel } from "@/presentation/constants";
import { formatDate } from "@/lib/utils/date";
import { JordanianCity } from "@/core/domain/enums";

type Props = {
  request: ActivityParticipationDto;
  onApprove: (id: string, name: string, volunteerCity?: string, activityCity?: string) => void;
  onReject: (id: string, name: string) => void;
  onVolunteerClick?: (volunteerId: string) => void;
};

const ParticipationRequestItem = ({ request, onApprove, onReject, onVolunteerClick }: Props) => {
  const formattedDate = formatDate(request.activity?.date || "");

  return (
    <div 
      className={`${styles.item} ${onVolunteerClick ? styles.clickableItem : ""}`}
      onClick={() => onVolunteerClick?.(request.volunteer?.id || "")}
    >
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

      {request.volunteer?.city && (
        <div className={`${styles.cell} ${styles.hideOnMobile}`}>
          <MapPin size={16} className={styles.icon} />
          <span className={styles.text}>
            {getCityLabel(request.volunteer.city as JordanianCity)}
          </span>
        </div>
      )}

      <div className={`${styles.cell} ${styles.hideOnMobile}`}>
        <Calendar size={16} className={styles.icon} />
        <span className={styles.text}>{formattedDate}</span>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.btnReject}
          onClick={(e) => {
            e.stopPropagation();
            onReject(request.id, request.volunteer?.fullName || "");
          }}
          title="رفض"
        >
          <XCircle size={16} />
        </button>
        <button
          className={styles.btnApprove}
          onClick={(e) => {
            e.stopPropagation();
            onApprove(
              request.id,
              request.volunteer?.fullName || "",
              request.volunteer?.city ?? undefined,
              request.activity?.city ?? undefined
            );
          }}
          title="موافقة"
        >
          <CheckCircle size={16} />
        </button>
      </div>
    </div>
  );
};

export default ParticipationRequestItem;