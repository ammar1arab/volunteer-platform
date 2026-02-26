"use client";
import styles from "./ActivityDetailsPage.module.scss";

import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { LoadingState, Button, Share, Modal } from "@/presentation/components";
import { useActivityDetails, useActivityParticipations, useToast } from "@/presentation/hooks";
import { getMonthLabel, ROUTES } from "@/presentation/constants";
import { ArrowRight, MapPin, Calendar, Clock, Users, Target, Share2, CheckCircle2, XCircle } from "lucide-react";

const ActivityDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const { showToast } = useToast();
    const [locationModalOpen, setLocationModalOpen] = useState(false);

    const id = params?.id as string;
    const { activity, loading, error } = useActivityDetails(id);
    const { submitting, createRequest, getRequestForActivity } = useActivityParticipations({ autoFetch: !!session });

    const handleJoin = async () => {
        if (!session) { router.push(ROUTES.LOGIN); return; }
        if (!activity) return;
        const success = await createRequest(activity.id);
        showToast(success ? "تم إرسال طلب الانضمام" : "فشل إرسال الطلب", success ? "success" : "error");
    };

    const getActionButton = () => {
        if (!activity) return null;
        if (!session) return <Button variant="primary" size="md" onClick={() => router.push(ROUTES.LOGIN)}>تسجيل الدخول للانضمام</Button>;
        const request = getRequestForActivity(activity.id);
        if (activity.isFull) return <Button variant="ghost" size="md" disabled>اكتمل العدد</Button>;
        if (request?.status === "PENDING") return <Button variant="ghost" size="md" disabled>قيد المراجعة</Button>;
        if (request?.status === "APPROVED") return <Button variant="ghost" size="md" disabled>أنت مشارك</Button>;
        return <Button variant="primary" size="md" loading={submitting} onClick={handleJoin}>انضم الآن</Button>;
    };

    if (loading) return <div className={styles.loadingContainer}><LoadingState /></div>;
    if (error || !activity) return (
        <div className={styles.empty}>
            <p>{error || "النشاط غير موجود"}</p>
            <Button onClick={() => router.push(ROUTES.ACTIVITIES)}>رجوع للفرص</Button>
        </div>
    );

    const date = new Date(activity.date);
    const formattedDate = `${date.getDate()} ${getMonthLabel(date.getMonth() + 1)} ${date.getFullYear()}`;
    const mapsUrl = `https://www.google.com/maps?q=${activity.location.latitude},${activity.location.longitude}`;
    const shareText = `${activity.title}\n\n${activity.placeName}\n${formattedDate} - ${activity.startTime} – ${activity.endTime}\nالفئة: ${activity.targetAudience}\n\n${typeof window !== "undefined" ? window.location.href : ""}`;

    return (
        <>
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
                        <Image src={activity.imageUrl} alt={activity.title} fill
                            className={styles.heroImage} priority sizes="(max-width: 600px) 100vw, 50vw" />
                        <div className={styles.heroBadges}>
                            {activity.isFull
                                ? <span className={styles.badgeFull}><XCircle size={13} /> مكتمل</span>
                                : <span className={styles.badgeOpen}><CheckCircle2 size={13} /> متاح للتسجيل</span>
                            }
                        </div>
                    </div>

                    <div className={styles.content}>
                        <div className={styles.titleRow}>
                            <h1 className={styles.title}>{activity.title}</h1>
                            <Share
                                trigger={(openShare) => (
                                    <button className={styles.shareBtn}
                                        onClick={() => openShare({ title: activity.title, text: shareText })}
                                        aria-label="مشاركة">
                                        <Share2 size={16} />
                                    </button>
                                )}
                            />
                        </div>

                        <div className={styles.chipsGrid}>
                            <div className={styles.chip} data-type="date">
                                <div className={styles.chipIcon}><Calendar size={15} /></div>
                                <div className={styles.chipContent}>
                                    <span className={styles.chipLabel}>التاريخ</span>
                                    <span className={styles.chipValue}>{formattedDate}</span>
                                </div>
                            </div>
                            <div className={styles.chip} data-type="time">
                                <div className={styles.chipIcon}><Clock size={15} /></div>
                                <div className={styles.chipContent}>
                                    <span className={styles.chipLabel}>الوقت</span>
                                    <span className={styles.chipValue}>{activity.startTime} – {activity.endTime}</span>
                                </div>
                            </div>
                            <div className={styles.chip} data-type="audience">
                                <div className={styles.chipIcon}><Target size={15} /></div>
                                <div className={styles.chipContent}>
                                    <span className={styles.chipLabel}>الفئة المستهدفة</span>
                                    <span className={styles.chipValue}>{activity.targetAudience}</span>
                                </div>
                            </div>
                            <div className={styles.chip} data-type="volunteers">
                                <div className={styles.chipIcon}><Users size={15} /></div>
                                <div className={styles.chipContent}>
                                    <span className={styles.chipLabel}>المتطوعون</span>
                                    <span className={styles.chipValue}>{activity.currentVolunteers} / {activity.maxVolunteers}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.locationCard}>
                            <div className={styles.locationMain}>
                                <div className={styles.locationIconWrap}><MapPin size={18} /></div>
                                <div className={styles.locationText}>
                                    <span className={styles.placeName}>{activity.placeName}</span>
                                    {activity.location.address && <span className={styles.address}>{activity.location.address}</span>}
                                </div>
                            </div>
                            <button className={styles.mapsBtn} onClick={() => setLocationModalOpen(true)}>
                                <MapPin size={13} /> افتح الخريطة
                            </button>
                        </div>

                        <div className={styles.descriptionCard}>
                            <h2 className={styles.descTitle}>عن الفرصة</h2>
                            <div className={styles.markdownBody}>
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                    {activity.description}
                                </ReactMarkdown>
                            </div>
                        </div>

                        <div className={styles.actionContainer}>
                            {getActionButton()}
                        </div>
                    </div>
                </article>
            </div>

            <Modal isOpen={locationModalOpen} onClose={() => setLocationModalOpen(false)} title={activity.placeName} size="sm">
                <div className={styles.locBody}>
                    {activity.location.address && <p className={styles.locAddress}>{activity.location.address}</p>}
                    <div className={styles.locActions}>
                        <Share
                            trigger={(openShare) => (
                                <button type="button" className={styles.locBtnShare}
                                    onClick={() => openShare({ title: activity.placeName, text: `${activity.placeName}\n${activity.location.address}\n${mapsUrl}` })}>
                                    مشاركة الموقع
                                </button>
                            )}
                        />
                        <a className={styles.locBtnMaps} href={mapsUrl} target="_blank" rel="noopener noreferrer"
                            onClick={() => setLocationModalOpen(false)}>
                            فتح في Google Maps
                        </a>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ActivityDetailsPage;