export * from "./uiHooks/useToast";
export * from "./uiHooks/usePasswordValidation";
export * from "./uiHooks/useOtpTimer";
export * from "./uiHooks/useConfirmDialog";
export * from "./uiHooks/usePageReset";

export * from "./apiHooks/useAuth";
export * from "./apiHooks/useUsers";
export * from "./apiHooks/useUserDetails";
export * from "./apiHooks/useActivities";
export * from "./apiHooks/useCertificates";
export * from "./apiHooks/useActivityParticipations";
export * from "./apiHooks/useFeaturedPosts";
export * from "./apiHooks/useVolunteerSpotlight";
export * from "./apiHooks/useMonthlyMagazine";
export * from "./apiHooks/useNotifications";
export * from "./apiHooks/usePushNotifications";
export * from "./apiHooks/useCompleteActivity";
export * from "./apiHooks/useMeetings";


export {
  useFetchData,
  useApiMutation,
  useCacheUpdater,
  useInfiniteFetchData,
  useBooleanMutation,
  useIsClient,
  useNow,
  queryKeys,
  unwrapResult,
  getErrorMessage
} from "@/presentation/query";
