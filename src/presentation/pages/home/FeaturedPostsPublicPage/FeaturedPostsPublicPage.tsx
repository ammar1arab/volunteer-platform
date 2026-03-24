"use client";
import styles from "./FeaturedPostsPublicPage.module.scss";
import { useFeaturedPostsPublicPage } from "./FeaturedPostsPublicPage.logic";
import { FeaturedPostCard, LoadingState, Pagination, Dropdown, EmptyState, Search } from "@/presentation/components";
import { FileImage } from "lucide-react";

const FeaturedPostsPublicPage = () => {
  const {
    posts, loading,
    monthOptions, categoryOptions,
    selectedMonth, selectedCategory,
    searchQuery, appliedSearch,
    currentPage, totalItems, itemsPerPage,
    setCurrentPage,
    handleMonthChange, handleCategoryChange,
    handleSearch, handleSearchChange,
  } = useFeaturedPostsPublicPage();

  if (loading) return (
    <div className={styles.loadingContainer}><LoadingState /></div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>منشورات ملهمة</h1>
        <p className={styles.subtitle}>توثيق للحظات الإنجاز ودروس مستفادة من قلب العمل التطوعي</p>
      </header>

      <div className={styles.filters}>
        <Search
          value={searchQuery}
          onChange={handleSearchChange}
          onSearch={handleSearch}
          placeholder="ابحث بالعنوان أو الوصف..."
        />
        <div className={styles.dropdowns}>
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
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon={FileImage}
          title="لا توجد منشورات"
          message={appliedSearch ? "لم نجد أي منشورات تطابق البحث" : "لا توجد منشورات بعد"}
        />
      ) : (
        <>
          <div className={styles.grid}>
            {posts.map(post => (
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