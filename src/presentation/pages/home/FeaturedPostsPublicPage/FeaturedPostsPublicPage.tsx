"use client";

import { useFeaturedPostsPublicPage } from "./FeaturedPostsPublicPage.logic";
import { FeaturedPostCard, LoadingState, Pagination, Dropdown, EmptyState, } from "@/presentation/components";
import { FileImage } from "lucide-react";
import styles from "./FeaturedPostsPublicPage.module.scss";

const FeaturedPostsPublicPage = () => {
    const { posts, loading, monthOptions, categoryOptions, selectedMonth, selectedCategory, currentPage, totalItems, itemsPerPage, setCurrentPage, handleMonthChange, handleCategoryChange, } = useFeaturedPostsPublicPage();

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <LoadingState />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>منشورات ملهمة</h1>
                <p className={styles.subtitle}>تجارب وإنجازات تطوعية تستحق المشاركة</p>
            </header>

            <div className={styles.filters}>
                <Dropdown
                    items={monthOptions}
                    active={selectedMonth}
                    onChange={handleMonthChange}
                    placeholder="الشهر"
                    compact
                />
                <Dropdown
                    items={categoryOptions}
                    active={selectedCategory}
                    onChange={handleCategoryChange}
                    placeholder="التصنيف"
                    compact
                />
            </div>

            {posts.length === 0 ? (
                <EmptyState
                    icon={FileImage}
                    title="لا توجد منشورات"
                    message="لم نجد أي منشورات تطابق البحث"
                />
            ) : (
                <>
                    <div className={styles.grid}>
                        {posts.map((post) => (
                            <FeaturedPostCard
                                key={post.id}
                                id={post.id}
                                imageUrl={post.imageUrl}
                                title={post.title}
                                description={post.description}
                                variant="glass"
                            />
                        ))}
                    </div>

                    {totalItems > itemsPerPage && (
                        <Pagination
                            currentPage={currentPage}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            sticky
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default FeaturedPostsPublicPage;