"use client";
import Image from "next/image";
import { Upload, MapPinned } from "lucide-react";
import { useActivityModal } from "./ActivityModal.logic";
import styles from "./ActivityModal.module.scss";
import { Modal, SelectInput, BirthDateInput, TimePickerInput } from '@/presentation/components';
import { DAY_OPTIONS } from '@/presentation/constants/labels';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    mode: "create" | "edit";
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    onImageUpload: (file: File) => Promise<string | null>;
    isSubmitting: boolean;
};

const ActivityModal = ({ isOpen, onClose, mode, initialData, onSubmit, onImageUpload, isSubmitting }: Props) => {
    const {
        form,
        preview,
        uploading,
        useCustomLocation,
        setForm,
        setUseCustomLocation,
        handleImage,
        detectLocation,
        handleSubmit
    } = useActivityModal({ initialData, onSubmit, onImageUpload, onClose });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={mode === "create" ? "إنشاء فرصة تطوعية" : "تعديل الفرصة"} size="lg">
            <form className={styles.form} onSubmit={handleSubmit}>

                <div className={styles.row}>
                    <div className={styles.field}>
                        <label className={styles.label}>عنوان الفرصة</label>
                        <input
                            className={styles.input}
                            value={form.title}
                            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                            required
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>الفئة المستهدفة</label>
                        <input
                            className={styles.input}
                            value={form.targetAudience}
                            onChange={(e) => setForm((p) => ({ ...p, targetAudience: e.target.value }))}
                        />
                    </div>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>وصف الفعالية</label>
                    <textarea
                        className={styles.textarea}
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        rows={3}
                    />
                </div>

                <div className={styles.row}>
                    <div className={styles.field}>
                        <SelectInput
                            label="اليوم"
                            value={form.dayOfWeek}
                            options={DAY_OPTIONS}
                            onChange={(value) => setForm((p) => ({ ...p, dayOfWeek: value }))}
                            required
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>العدد الأقصى للمتطوعين</label>
                        <input
                            className={styles.input}
                            type="number"
                            min={1}
                            value={form.maxVolunteers}
                            onChange={(e) => setForm((p) => ({ ...p, maxVolunteers: parseInt(e.target.value) || 1 }))}
                        />
                    </div>
                </div>

                <div className={styles.timeRow}>
                    <div className={styles.field}>
                        <BirthDateInput
                            label="التاريخ"
                            value={form.date}
                            onChange={(value) => setForm((p) => ({ ...p, date: value }))}
                            required
                        />
                    </div>

                    <TimePickerInput
                        label="وقت البدء"
                        value={form.startTime}
                        onChange={(value) => setForm((p) => ({ ...p, startTime: value }))}
                        required
                    />

                    <TimePickerInput
                        label="وقت الانتهاء"
                        value={form.endTime}
                        onChange={(value) => setForm((p) => ({ ...p, endTime: value }))}
                        required
                    />
                </div>

                <div className={styles.row}>
                    <div className={styles.field}>
                        <label className={styles.label}>اسم المكان</label>
                        <input
                            className={styles.input}
                            value={form.placeName}
                            onChange={(e) => setForm((p) => ({ ...p, placeName: e.target.value }))}
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>العنوان</label>
                        <input
                            className={styles.input}
                            value={form.address}
                            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                        />
                    </div>
                </div>

                <div className={styles.location}>
                    <div className={styles.locationHeader}>
                        <label className={styles.label}>إحداثيات الموقع (GPS)</label>
                        <div className={styles.locationActions}>
                            <button type="button" className={styles.btnLocation} onClick={detectLocation}>
                                <MapPinned size={14} />
                                تحديد موقعي الحالي
                            </button>
                            <button type="button" className={styles.btnToggle} onClick={() => setUseCustomLocation(!useCustomLocation)}>
                                {useCustomLocation ? "إخفاء الإحداثيات" : "إدخال يدوي"}
                            </button>
                        </div>
                    </div>

                    {useCustomLocation && (
                        <div className={styles.coords}>
                            <div className={styles.field}>
                                <label className={styles.labelSmall}>خط العرض (Latitude)</label>
                                <input
                                    className={styles.input}
                                    type="number"
                                    step="any"
                                    value={form.latitude}
                                    onChange={(e) => setForm((p) => ({ ...p, latitude: parseFloat(e.target.value) || 0 }))}
                                />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.labelSmall}>خط الطول (Longitude)</label>
                                <input
                                    className={styles.input}
                                    type="number"
                                    step="any"
                                    value={form.longitude}
                                    onChange={(e) => setForm((p) => ({ ...p, longitude: parseFloat(e.target.value) || 0 }))}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>صورة الفعالية</label>
                    <div className={styles.uploadSection}>
                        {(preview || form.imageUrl) && (
                            <div className={styles.preview}>
                                <Image src={preview || form.imageUrl} alt="Preview" fill className={styles.previewImg} />
                            </div>
                        )}
                        <label className={styles.btnUpload}>
                            <Upload size={16} />
                            {uploading ? "جاري الرفع..." : (form.imageUrl ? "تغيير الصورة" : "رفع صورة الغلاف")}
                            <input
                                type="file"
                                accept="image/*"
                                className={styles.fileInput}
                                onChange={(e) => handleImage(e.target.files?.[0] ?? null)}
                                disabled={uploading}
                            />
                        </label>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="button" className={styles.btnCancel} onClick={onClose} disabled={isSubmitting}>
                        إلغاء
                    </button>
                    <button type="submit" className={styles.btnSubmit} disabled={isSubmitting || uploading || !form.title}>
                        {isSubmitting ? "جاري الحفظ..." : mode === "create" ? "إنشاء الفرصة" : "حفظ التعديلات"}
                    </button>
                </div>

            </form>
        </Modal>
    );
};

export default ActivityModal;