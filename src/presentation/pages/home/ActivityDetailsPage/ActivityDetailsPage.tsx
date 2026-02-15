"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ArrowRight, MapPin, Calendar, Clock, Users } from "lucide-react";
import { LoadingState, Button } from "@/presentation/components";
import { useActivityDetails, useActivityParticipations, useToast } from "@/presentation/hooks";
import { formatForDisplay, ROUTES } from "@/lib";
import styles from "./ActivityDetailsPage.module.scss";

const ActivityDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const { showToast } = useToast();

    const id = params?.id as string;
    const { activity, loading, error } = useActivityDetails(id);
    const { submitting, createRequest, getRequestForActivity } =
        useActivityParticipations({ autoFetch: !!session });

    const handleJoin = async () => {
        if (!session) {
            router.push(ROUTES.LOGIN);
            return;
        }

        if (!activity) return;

        const success = await createRequest(activity.id);
        showToast(
            success ? "تم إرسال طلب الانضمام" : "فشل إرسال الطلب",
            success ? "success" : "error"
        );
    };

    const getActionButton = () => {
        if (!activity) return null;

        if (!session) {
            return (
                <Button variant="primary" size="md" onClick={() => router.push(ROUTES.LOGIN)}>
                    تسجيل الدخول للانضمام
                </Button>
            );
        }

        const request = getRequestForActivity(activity.id);

        if (activity.isFull) {
            return (
                <Button variant="ghost" size="md" disabled>
                    اكتمل العدد
                </Button>
            );
        }

        if (request?.status === "PENDING") {
            return (
                <Button variant="ghost" size="md" disabled>
                    قيد المراجعة
                </Button>
            );
        }

        if (request?.status === "APPROVED") {
            return (
                <Button variant="ghost" size="md" disabled>
                    أنت مشارك
                </Button>
            );
        }

        return (
            <Button variant="primary" size="md" loading={submitting} onClick={handleJoin}>
                انضم الآن
            </Button>
        );
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <LoadingState />
            </div>
        );
    }

    if (error || !activity) {
        return (
            <div className={styles.empty}>
                <p>{error || "النشاط غير موجود"}</p>
                <Button onClick={() => router.push(ROUTES.ACTIVITIES)}>رجوع للفرص</Button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Button
                variant="ghost"
                size="sm"
                icon={<ArrowRight size={18} />}
                onClick={() => router.push(ROUTES.ACTIVITIES)}
                className={styles.backBtn}
            >
                رجوع للفرص
            </Button>

            <article className={styles.article}>
                <div className={styles.hero}>
                    <Image
                        src={activity.imageUrl}
                        alt={activity.title}
                        fill
                        className={styles.heroImage}
                        priority
                    />
                    {activity.isFull && <span className={styles.badge}>مكتمل</span>}
                </div>

                <div className={styles.content}>
                    <header className={styles.header}>
                        <h1 className={styles.title}>{activity.title}</h1>

                        <div className={styles.meta}>
                            <span className={styles.metaItem}>
                                <MapPin size={18} />
                                {activity.placeName}
                            </span>
                            <span className={styles.metaItem}>
                                <Calendar size={18} />
                                {new Date(activity.date).toLocaleDateString("ar-JO", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                            <span className={styles.metaItem}>
                                <Clock size={18} />
                                {activity.startTime} - {activity.endTime}
                            </span>
                            <span className={styles.metaItem}>
                                <Users size={18} />
                                {activity.currentVolunteers} / {activity.maxVolunteers} متطوع
                            </span>
                        </div>
                    </header>

                    <div className={styles.body}>
                        <p className={styles.description}>{formatForDisplay(activity.description)}</p>
                    </div>

                    <div className={styles.actionContainer}>{getActionButton()}</div>
                </div>
            </article>
        </div>
    );
};

export default ActivityDetailsPage;