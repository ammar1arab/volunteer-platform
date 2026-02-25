export const validatePdfFile = (file: File, maxSizeMB = 50): string | null => {
  if (file.type !== "application/pdf") {
    return "نوع الملف غير مدعوم، يجب أن يكون PDF";
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `حجم الملف كبير (الحد ${maxSizeMB}MB)`;
  }
  return null;
};

export const createPdfPreview = (file: File) => URL.createObjectURL(file);
export const revokePdfPreview = (url: string) => URL.revokeObjectURL(url);

export const processPdfForUpload = (
  file: File,
  options?: { maxSizeMB?: number }
): { file: File; error?: string } => {
  const error = validatePdfFile(file, options?.maxSizeMB);
  if (error) return { file, error };
  return { file };
};