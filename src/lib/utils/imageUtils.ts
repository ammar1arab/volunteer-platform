export const compressImage = async (
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8
): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              resolve(new File([blob], file.name, { type: file.type }));
            } else {
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const validateImageFile = (
  file: File,
  maxSizeMB = 10
): string | null => {
  if (
    !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)
  ) {
    return "نوع الملف غير مدعوم";
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `حجم الملف كبير (الحد ${maxSizeMB}MB)`;
  }
  return null;
};

export const createImagePreview = (file: File) => URL.createObjectURL(file);
export const revokeImagePreview = (url: string) => URL.revokeObjectURL(url);

export const processImageForUpload = async (
  file: File,
  options?: { maxSizeMB?: number; maxWidth?: number; quality?: number }
): Promise<{ file: File; previewUrl: string; error?: string }> => {
  const error = validateImageFile(file, options?.maxSizeMB);
  if (error) return { file, previewUrl: "", error };

  try {
    const compressed = await compressImage(
      file,
      options?.maxWidth,
      1080,
      options?.quality
    );
    return { file: compressed, previewUrl: createImagePreview(compressed) };
  } catch {
    return { file, previewUrl: "", error: "فشل معالجة الصورة" };
  }
};
