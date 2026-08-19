"use client";
import styles from "./VolunteerSpotlightPage.module.scss";
import { useVolunteerSpotlightPage } from "./VolunteerSpotlightPage.logic";

import Image from "next/image";
import { AdminVolunteerSpotlightCard, ToastContainer, Modal, LoadingState, EmptyState, Pagination, ConfirmDialog, Dropdown, SelectInput, Search, Button } from "@/presentation/components";
import { Plus, Upload, Edit2, Eye, EyeOff, Trash2, Users, User } from "lucide-react";
import { MONTH_LABELS, isJordanianCity } from "@/presentation/constants";

const VolunteerSpotlightPage = () => {
    const {
        status,
        isLoading,
        isSubmitting,
        isUploading,
        mode,
        form,
        preview,
        showModal,
        filteredList,
        paginatedList,
        currentPage,
        itemsPerPage,
        activeCity,
        setActiveCity,
        cityOptions,
        toasts,
        removeToast,
        confirmDialog,
        setForm,
        setCurrentPage,
        resetForm,
        openCreate,
        openEdit,
        handleFileChange,
        handleSubmit,
        handleToggle,
        handleDelete,
        searchQuery,
        setSearchQuery,
        setAppliedSearch,
    } = useVolunteerSpotlightPage();

    if (status === "loading") return <LoadingState />;

    return (
        <>
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            <header className={styles.header}>
                <div className={styles.actions}>
                    <Search value={searchQuery} onChange={setSearchQuery} onSearch={setAppliedSearch} placeholder="ابحث عن متطوع..." />
                    <div className={styles.actionsEnd}>
                        <Dropdown
                            items={[
                                { key: "all", label: "الجميع" },
                                ...cityOptions.map((city) => ({ key: city.value, label: city.label })),
                            ]}
                            active={activeCity}
                            onChange={setActiveCity}
                            placeholder="المدينة"
                            compact
                        />
                        <Button variant="primary" icon={<Plus size={18} />} onClick={openCreate} disabled={isSubmitting}>
                            إضافة متطوع مميز
                        </Button>
                    </div>
                </div>
            </header>
            {isLoading ? (
                <LoadingState />
            ) : filteredList.length === 0 ? (
                <EmptyState
                    icon={Users}
                    message={activeCity !== "all" ? "لا يوجد متطوعون من هذه المدينة" : "لا يوجد متطوعون بارزين"}
                    action={{ label: "إضافة متطوع", onClick: openCreate }}
                />
            ) : (
                <>
                    <div className={styles.grid}>
                        {paginatedList.map((spotlight) => (
                            <AdminVolunteerSpotlightCard
                                key={spotlight.id}
                                imageUrl={spotlight.imageUrl}
                                name={spotlight.name}
                                description={spotlight.description}
                                city={spotlight.city}
                                spotlightDate={spotlight.spotlightDate}
                                meta={
                                    <span className={`${styles.badge} ${spotlight.isActive ? styles.active : styles.inactive}`}>
                                        {spotlight.isActive ? "نشط" : "مخفي"}
                                    </span>
                                }
                                actions={
                                    <div className={styles.cardActions}>
                                        <button className={styles.btn} onClick={() => openEdit(spotlight)} disabled={isSubmitting}>
                                            <Edit2 size={14} />
                                        </button>
                                        <button className={styles.btn} onClick={() => handleToggle(spotlight)} disabled={isSubmitting}>
                                            {spotlight.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                                        </button>
                                        <button className={styles.btnDanger} onClick={() => handleDelete(spotlight)} disabled={isSubmitting}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                }
                            />
                        ))}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredList.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        sticky
                    />
                </>
            )}

            <Modal
                isOpen={showModal}
                onClose={resetForm}
                title={mode === "create" ? "إضافة متطوع بارز جديد" : "تعديل بيانات المتطوع"}
                size="lg"
            >
                <div className={styles.form}>
                    <div className={styles.field}>
                        <label className={styles.label}>الاسم</label>
                        <input
                            className={styles.input}
                            value={form.name}
                            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                            disabled={isSubmitting || isUploading}
                        />
                    </div>

                    <div className={styles.row}>
                        <SelectInput
                            label="المدينة"
                            value={form.city}
                            options={cityOptions}
                            onChange={(value) => {
                                if (!isJordanianCity(value)) return;
                                setForm((p) => ({ ...p, city: value }));
                            }}
                            required
                        />
                        <SelectInput
                            label="الشهر"
                            value={form.month}
                            options={Object.entries(MONTH_LABELS).map(([value, label]) => ({ value, label }))}
                            onChange={(val) => setForm((p) => ({ ...p, month: val }))}
                            disabled={isSubmitting || isUploading}
                        />
                        <SelectInput
                            label="السنة"
                            value={form.year}
                            options={Array.from({ length: 10 }, (_, i) => {
                                const y = String(new Date().getFullYear() - 2 + i);
                                return { value: y, label: y };
                            })}
                            onChange={(val) => setForm((p) => ({ ...p, year: val }))}
                            disabled={isSubmitting || isUploading}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>الوصف</label>
                        <textarea
                            className={styles.textarea}
                            value={form.description}
                            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                            disabled={isSubmitting || isUploading}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>الصورة الشخصية</label>
                        <div className={styles.uploadSection}>
                            <div className={styles.preview}>
                                {(preview || form.imageUrl) ? (
                                    <Image
                                        src={preview || form.imageUrl}
                                        alt="Volunteer"
                                        fill
                                        className={styles.previewImg}
                                    />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f5f5f5', color: '#ccc' }}>
                                        <User size={32} />
                                    </div>
                                )}
                            </div>
                            <div className={styles.uploadContent}>
                                <span className={styles.uploadHint}>
                                    {isUploading ? "جاري الرفع..." : "اختر صورة شخصية واضحة"}
                                </span>
                                <label className={styles.btnUpload}>
                                    <Upload size={14} />
                                    تغيير الصورة
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className={styles.fileInput}
                                        onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                                        disabled={isSubmitting || isUploading}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    <label className={styles.toggle}>
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                            disabled={isSubmitting || isUploading}
                        />
                        <span className={styles.slider} />
                        <span>تفعيل الظهور في القائمة</span>
                    </label>

                    <div className={styles.modalActions}>
                        <Button variant="ghost" onClick={resetForm} disabled={isSubmitting || isUploading}>
                            إلغاء
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={isSubmitting || isUploading || !form.imageUrl || !form.name.trim()}
                            loading={isSubmitting}
                        >
                            {isSubmitting ? "جاري الحفظ..." : "حفظ"}
                        </Button>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={confirmDialog.handleCancel}
                onConfirm={confirmDialog.handleConfirm}
                title={confirmDialog.options.title}
                message={confirmDialog.options.message}
                confirmText={confirmDialog.options.confirmText}
                cancelText={confirmDialog.options.cancelText}
                variant={confirmDialog.options.variant}
            />
        </>
    );
};

export default VolunteerSpotlightPage;