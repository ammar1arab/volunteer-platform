"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Clock, Users, ChevronRight, ChevronLeft, Loader2, } from "lucide-react";
import { Container, SectionHeader } from "@/presentation/components";
import { useActivities, useActivityParticipations, useToast } from "@/presentation/hooks";
import { ROUTES, type ActivityDto } from "@/lib";
import styles from "./AvailableActivities.module.scss";

const AvailableActivities = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();

  const { list: activities, loading } = useActivities({ filter: "published" });
  const {
    submitting,
    createRequest,
    getRequestForActivity,
  } = useActivityParticipations({ autoFetch: !!session });

  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const itemsPerPage = isMobile ? 2 : 4;
  const totalPages = Math.ceil(activities.length / itemsPerPage);
  const pagedActivities = activities.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const next = () => setCurrentPage((p) => Math.min(p + 1, totalPages - 1));
  const prev = () => setCurrentPage((p) => Math.max(p - 1, 0));
  const goTo = (index: number) => setCurrentPage(index);

  const handleJoin = async (activity: ActivityDto) => {
    if (!session) {
      router.push(ROUTES.LOGIN);
      return;
    }

    const success = await createRequest(activity.id);
    if (success) {
      showToast("تم إرسال طلب الانضمام", "success");
    } else {
      showToast("فشل إرسال الطلب", "error");
    }
  };

  const getButtonConfig = (activity: ActivityDto) => {
    if (!session) {
      return { text: "تسجيل الدخول للانضمام", variant: "secondary", disabled: false };
    }

    const request = getRequestForActivity(activity.id);

    if (activity.isFull) {
      return { text: "اكتمل العدد", variant: "disabled", disabled: true };
    }

    if (request) {
      if (request.status === "PENDING") {
        return { text: "قيد المراجعة", variant: "pending", disabled: true };
      }
      if (request.status === "APPROVED") {
        return { text: "أنت مشارك", variant: "approved", disabled: true };
      }
      if (request.status === "REJECTED") {
        return { text: "طلب مرفوض", variant: "rejected", disabled: true };
      }
    }

    return { text: "انضم الآن", variant: "primary", disabled: false };
  };

  if (loading) {
    return (
      <section className={styles.section}>
        <Container>
          <SectionHeader
            title= "الفرص المتاحة"
            subtitle="فرص تطوعية يمكنك استكشافها والتقديم عليها"
          />
          <div className={styles.loadingContainer}>
            <Loader2 className={styles.spinner} size={40} />
          </div>
        </Container>
      </section>
    );
  }

  if (activities.length === 0) {
    return (
      <section className={styles.section}>
        <Container>
          <SectionHeader
            title= "الفرص المتاحة"
            subtitle="فرص تطوعية يمكنك استكشافها والتقديم عليها"
          />
          <div className={styles.emptyState}>
            <p>لا توجد أنشطة متاحة حالياً</p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <Container>
        <SectionHeader
          title= "الفرص المتاحة"
          subtitle="فرص تطوعية يمكنك استكشافها والتقديم عليها"
        />

        <div className={styles.grid}>
          {pagedActivities.map((activity) => {
            const buttonConfig = getButtonConfig(activity);
            const request = getRequestForActivity(activity.id);

            return (
              <article key={activity.id} className={styles.card}>
                <div className={styles.imageCol}>
                  <Image
                    width={360}
                    height={360}
                    src={activity.imageUrl}
                    alt={activity.title}
                    className={styles.image}
                    priority
                  />
                  {activity.isFull && (
                    <span className={`${styles.badge} ${styles.badgeFull}`}>
                      مكتمل
                    </span>
                  )}
                  {request?.status === "PENDING" && (
                    <span className={`${styles.badge} ${styles.badgePending}`}>
                      قيد المراجعة
                    </span>
                  )}
                  {request?.status === "APPROVED" && (
                    <span className={`${styles.badge} ${styles.badgeApproved}`}>
                      مشارك
                    </span>
                  )}
                </div>

                <div className={styles.content}>
                  <h3 className={styles.title}>{activity.title}</h3>
                  <p className={styles.desc}>{activity.description}</p>

                  <div className={styles.meta}>
                    <div className={styles.metaItem}>
                      <MapPin className={styles.icon} size={16} />
                      <span>{activity.placeName}</span>
                    </div>

                    <div className={styles.metaItem}>
                      <Calendar className={styles.icon} size={16} />
                      <span>{new Date(activity.date).toLocaleDateString("ar")}</span>
                    </div>

                    <div className={styles.metaItem}>
                      <Clock className={styles.icon} size={16} />
                      <span>{activity.startTime} - {activity.endTime}</span>
                    </div>

                    <div className={styles.metaItem}>
                      <Users className={styles.icon} size={16} />
                      <span>
                        {activity.currentVolunteers}/{activity.maxVolunteers} متطوع
                      </span>
                    </div>
                  </div>

                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={`${styles.applyBtn} ${styles[buttonConfig.variant]}`}
                      onClick={() => handleJoin(activity)}
                      disabled={buttonConfig.disabled || submitting}
                    >
                      {submitting ? <Loader2 className={styles.spinner} size={16} /> : buttonConfig.text}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className={styles.navigation}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={prev}
              disabled={currentPage === 0}
            >
              <ChevronRight size={20} />
            </button>

            <div className={styles.dots}>
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`${styles.dot} ${index === currentPage ? styles.activeDot : ""}`}
                  onClick={() => goTo(index)}
                />
              ))}
            </div>

            <button
              type="button"
              className={styles.navBtn}
              onClick={next}
              disabled={currentPage === totalPages - 1}
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        )}
      </Container>
    </section>
  );
};

export default AvailableActivities;