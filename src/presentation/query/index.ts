export { createQueryClient } from "./client";
export { QueryProvider } from "./QueryProvider";
export { queryKeys } from "./keys";
export { EMPTY_ARRAY } from "./utils/constants";

export { useFetchData, type UseFetchDataParams, type UseFetchDataResult, type UseFetchDataOptions } from "./hooks/useFetchData";
export { useApiMutation, type UseApiMutationParams } from "./hooks/useApiMutation";
export { useCacheUpdater } from "./hooks/useCacheUpdater";
export {
  useInfiniteFetchData,
  type UseInfiniteFetchDataParams,
  type InfiniteFetchDataOptions
} from "./hooks/useInfiniteFetchData";
export { useBooleanMutation } from "./hooks/useBooleanMutation";
export { useIsClient } from "./hooks/useIsClient";
export { useNow } from "./hooks/useNow";

export { ApiError, getErrorMessage, isNotFoundError, type ErrorDetails } from "./utils/errors";
export { isResult, unwrapResult, unwrapRequest } from "./utils/result";
