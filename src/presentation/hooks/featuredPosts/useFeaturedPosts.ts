import { useEffect, useCallback, useState } from "react";
import { useResourceCRUD } from "@/presentation/hooks";
import { featuredPostApi, uploadApi } from "@/lib/api";
import type {
  FeaturedPostDto,
  CreateFeaturedPostRequest,
  UpdateFeaturedPostRequest,
} from "@/lib";

interface UseFeaturedPostsOptions {
  activeOnly?: boolean;
  autoLoad?: boolean;
}

export const useFeaturedPosts = (options: UseFeaturedPostsOptions = {}) => {
  const { activeOnly = false, autoLoad = true } = options;
  const [isUploading, setIsUploading] = useState(false);

  const {
    items: list,
    isLoading,
    isSubmitting,
    error,
    refresh,
    create,
    update,
    remove,
  } = useResourceCRUD<
    FeaturedPostDto,
    CreateFeaturedPostRequest,
    UpdateFeaturedPostRequest
  >({
    fetchAll: featuredPostApi.getAll,
    createOne: featuredPostApi.create,
    updateOne: featuredPostApi.update,
    deleteOne: featuredPostApi.delete,
    filterActive: activeOnly,
  });

  useEffect(() => {
    if (autoLoad) refresh();
  }, [autoLoad, refresh]);

  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      setIsUploading(true);
      try {
        const result = await uploadApi.uploadFeaturedImage(file);
        return result.success && result.imageUrl ? result.imageUrl : null;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  return {
    list,
    isLoading,
    isSubmitting,
    isUploading,
    error,
    refresh,
    create,
    update,
    remove,
    uploadImage,
  };
};
