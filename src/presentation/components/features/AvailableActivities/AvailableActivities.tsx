'use client';

import styles from './AvailableActivities.module.scss';

import { Container, SectionHeader } from '@/presentation/components';
import { useActivities } from '@/presentation/hooks';

import { FiMapPin, FiCalendar, FiClock, FiUsers, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const AvailableActivities = () => {
    const { activities, totalPages, currentPage, next, prev, goTo } = useActivities();

    return (
        <section className={styles.section}>
            <Container>
                <SectionHeader
                    title="الأنشطة المتاحة"
                    subtitle="فرص تطوعية يمكنك استكشافها والتقديم عليها"
                />

                <div className={styles.gridWrapper}>
                    <div className={styles.grid}>
                        {activities.map(activity => (
                            <article key={activity.id} className={styles.card}>
                                <div className={styles.imageCol}>
                                    <img src={activity.image} alt={activity.title} className={styles.image} />
                                    <span className={`${styles.badge} ${styles[`badge-${activity.type}`]}`}> {activity.category}</span>
                                </div>

                                <div className={styles.content}>
                                    <h3 className={styles.title}>{activity.title}</h3>
                                    <p className={styles.desc}>{activity.description}</p>

                                    <div className={styles.meta}>
                                        <div className={styles.metaItem}>
                                            <FiMapPin aria-hidden="true" className={styles.icon} />
                                            <span>{activity.location}</span>
                                        </div>

                                        <div className={styles.metaItem}>
                                            <FiCalendar aria-hidden="true" className={styles.icon} />
                                            <span>{activity.date}</span>
                                        </div>

                                        <div className={styles.metaItem}>
                                            <FiClock aria-hidden="true" className={styles.icon} />
                                            <span>{activity.time}</span>
                                        </div>

                                        <div className={styles.metaItem}>
                                            <FiUsers aria-hidden="true" className={styles.icon} />
                                            <span>{activity.volunteersNeeded} متطوع</span>
                                        </div>
                                    </div>

                                    <div className={styles.actions}>
                                        <button type="button" className={styles.moreBtn} aria-label="معرفة المزيد" title="معرفة المزيد"> معرفة المزيد</button>

                                        <button type="button" className={styles.applyBtn} aria-label="قدم طلبك الآن" title="قدم طلبك الآن"> قدم طلبك الآن</button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className={styles.navigation}>
                            <button type="button" className={styles.navBtn} onClick={prev} disabled={currentPage === 0} aria-label="الصفحة السابقة" title="الصفحة السابقة">
                                <FiChevronRight aria-hidden="true" />
                            </button>

                            <div className={styles.dots}>
                                {Array.from({ length: totalPages }).map((_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={`${styles.dot} ${index === currentPage ? styles.activeDot : ''
                                            }`}
                                        onClick={() => goTo(index)}
                                        aria-label={`الانتقال إلى الصفحة ${index + 1}`}
                                        title={`الانتقال إلى الصفحة ${index + 1}`}
                                    />
                                ))}
                            </div>

                            <button type="button" className={styles.navBtn} onClick={next} disabled={currentPage === totalPages - 1} aria-label="الصفحة التالية" title="الصفحة التالية">
                                <FiChevronLeft aria-hidden="true" />
                            </button>
                        </div>
                    )}
                </div>
            </Container>
        </section>
    );
};

export default AvailableActivities;
