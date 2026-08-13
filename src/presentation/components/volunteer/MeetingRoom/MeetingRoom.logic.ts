export const formatMeetingDate = (date?: string) => {
  if (!date) return null;
  try {
    return new Date(date).toLocaleDateString("ar-JO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch {
    return date;
  }
};

export const getInAppMeetingSrc = (activityId: string, displayName?: string) => {
  const room = `YouthPrints${activityId.replace(/-/g, "")}`;
  const hash = [
    "config.prejoinConfig.enabled=true",
    "config.disableDeepLinking=true",
    "config.startWithAudioMuted=true",
    "interfaceConfig.SHOW_JITSI_WATERMARK=false",
    "interfaceConfig.SHOW_BRAND_WATERMARK=false",
    displayName ? `userInfo.displayName="${encodeURIComponent(displayName)}"` : ""
  ]
    .filter(Boolean)
    .join("&");

  return `https://meet.jit.si/${encodeURIComponent(room)}#${hash}`;
};
