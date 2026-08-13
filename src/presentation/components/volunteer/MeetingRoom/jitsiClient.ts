import { logger } from "@/lib/utils";
import {
  getJitsiExternalApiSrc,
  getJitsiHost,
  JITSI_CONFIG_OVERWRITE,
  JITSI_INTERFACE_OVERWRITE,
  JITSI_LANGUAGE,
  MEETING_LABELS
} from "@/presentation/constants/meetingEmbed";

export type JitsiConferenceStatus = "boot" | "ready" | "joined" | "left" | "failed";

export type JitsiSnapshot = {
  status: JitsiConferenceStatus;
  participantCount: number;
};

export type JitsiConferenceCallbacks = {
  onJoined: () => void;
  onLeft: (reason: "hangup" | "cancel") => void;
  onFailed: () => void;
};

type JitsiErrorPayload = {
  error?: {
    message?: string;
    isFatal?: boolean;
  };
};

type JitsiMeetExternalApi = {
  dispose: () => void;
  getNumberOfParticipants: () => number;
  executeCommand: (command: string, ...args: Array<string | boolean | number>) => void;
  addListener: (event: string, listener: (payload?: JitsiErrorPayload) => void) => void;
};

type JitsiApiConstructor = new (
  domain: string,
  options: {
    roomName: string;
    parentNode: HTMLElement;
    lang: string;
    width: number;
    height: number;
    userInfo: { displayName: string };
    configOverwrite: typeof JITSI_CONFIG_OVERWRITE;
    interfaceConfigOverwrite: typeof JITSI_INTERFACE_OVERWRITE;
    onload?: () => void;
  }
) => JitsiMeetExternalApi;

type ScriptStatus = "idle" | "loading" | "ready" | "error";

const SCRIPT_SCOPE = "JitsiClient";
const IDLE_SNAPSHOT: JitsiSnapshot = { status: "boot", participantCount: 0 };

let scriptStatus: ScriptStatus = "idle";
const scriptListeners = new Set<() => void>();

const emitScript = () => {
  scriptListeners.forEach((listener) => listener());
};

const ensureJitsiScript = () => {
  if (typeof window === "undefined") return;
  const existing = window.JitsiMeetExternalAPI;
  if (existing) {
    scriptStatus = "ready";
    return;
  }
  if (scriptStatus === "loading" || scriptStatus === "ready") return;

  scriptStatus = "loading";
  const script = document.createElement("script");
  script.src = getJitsiExternalApiSrc();
  script.async = true;
  script.onload = () => {
    scriptStatus = window.JitsiMeetExternalAPI ? "ready" : "error";
    emitScript();
  };
  script.onerror = () => {
    scriptStatus = "error";
    logger.error(SCRIPT_SCOPE, "script.load", MEETING_LABELS.loadError);
    emitScript();
  };
  document.body.appendChild(script);
};

export const subscribeJitsiScript = (listener: () => void) => {
  scriptListeners.add(listener);
  ensureJitsiScript();
  return () => {
    scriptListeners.delete(listener);
  };
};

export const getJitsiScriptStatus = (): ScriptStatus => {
  if (typeof window !== "undefined" && window.JitsiMeetExternalAPI) return "ready";
  return scriptStatus;
};

type ConferenceSession = {
  key: string;
  api: JitsiMeetExternalApi | null;
  snapshot: JitsiSnapshot;
  joined: boolean;
  listeners: Set<() => void>;
};

const conferences = new Map<string, ConferenceSession>();

const emitConference = (session: ConferenceSession) => {
  session.listeners.forEach((listener) => listener());
};

const disposeApi = (session: ConferenceSession) => {
  if (!session.api) return;
  const api = session.api;
  session.api = null;
  api.dispose();
};

const readParticipantCount = (api: JitsiMeetExternalApi | null) => {
  if (!api) return 0;
  try {
    return api.getNumberOfParticipants();
  } catch {
    return 0;
  }
};

const fillEmbedFrame = (root: HTMLElement) => {
  const frame = root.querySelector("iframe");
  const holder = frame?.parentElement ?? root.firstElementChild;
  if (holder instanceof HTMLElement) {
    holder.style.width = "100%";
    holder.style.height = "100%";
    holder.style.minHeight = "100%";
  }
  if (frame instanceof HTMLIFrameElement) {
    frame.style.width = "100%";
    frame.style.height = "100%";
    frame.style.minHeight = "100%";
    frame.style.border = "0";
    frame.style.display = "block";
  }
};

export const connectJitsiConference = (
  key: string,
  options: {
    roomName: string;
    displayName: string;
    subject: string;
    parentNode: HTMLElement;
    callbacks: JitsiConferenceCallbacks;
  },
  onStoreChange: () => void
) => {
  const existing = conferences.get(key);
  if (existing) {
    existing.listeners.add(onStoreChange);
    return () => {
      existing.listeners.delete(onStoreChange);
      if (existing.listeners.size === 0) {
        disposeApi(existing);
        conferences.delete(key);
      }
    };
  }

  const Ctor = window.JitsiMeetExternalAPI;
  const session: ConferenceSession = {
    key,
    api: null,
    snapshot: { status: "boot", participantCount: 0 },
    joined: false,
    listeners: new Set([onStoreChange])
  };
  conferences.set(key, session);

  if (!Ctor) {
    session.snapshot = { status: "failed", participantCount: 0 };
    emitConference(session);
    queueMicrotask(options.callbacks.onFailed);
    return () => {
      session.listeners.delete(onStoreChange);
      conferences.delete(key);
    };
  }

  options.parentNode.dir = "ltr";
  options.parentNode.replaceChildren();

  const host = options.parentNode.parentElement;
  const width = Math.max(options.parentNode.clientWidth, host?.clientWidth ?? 0, 1);
  const height = Math.max(options.parentNode.clientHeight, host?.clientHeight ?? 0, 1);

  const api = new Ctor(getJitsiHost(), {
    roomName: options.roomName,
    parentNode: options.parentNode,
    lang: JITSI_LANGUAGE,
    width,
    height,
    userInfo: { displayName: options.displayName },
    configOverwrite: JITSI_CONFIG_OVERWRITE,
    interfaceConfigOverwrite: JITSI_INTERFACE_OVERWRITE,
    onload: () => {
      fillEmbedFrame(options.parentNode);
      if (!session.api) return;
      session.snapshot = {
        status: session.joined ? "joined" : "ready",
        participantCount: readParticipantCount(session.api)
      };
      emitConference(session);
    }
  });

  fillEmbedFrame(options.parentNode);

  const refreshParticipants = () => {
    if (!session.api) return;
    session.snapshot = {
      ...session.snapshot,
      participantCount: readParticipantCount(session.api)
    };
    emitConference(session);
  };

  const leave = (reason: "hangup" | "cancel") => {
    if (session.snapshot.status === "left" || session.snapshot.status === "failed") return;
    disposeApi(session);
    session.snapshot = { status: "left", participantCount: 0 };
    emitConference(session);
    options.callbacks.onLeft(reason);
  };

  api.addListener("videoConferenceJoined", () => {
    session.joined = true;
    session.snapshot = { status: "joined", participantCount: readParticipantCount(api) };
    emitConference(session);
    options.callbacks.onJoined();
    api.executeCommand("subject", options.subject);
  });

  api.addListener("participantJoined", refreshParticipants);
  api.addListener("participantLeft", refreshParticipants);

  api.addListener("readyToClose", () => {
    leave(session.joined ? "hangup" : "cancel");
  });

  api.addListener("videoConferenceLeft", () => {
    leave(session.joined ? "hangup" : "cancel");
  });

  api.addListener("errorOccurred", (payload) => {
    const fatal = payload?.error?.isFatal;
    if (fatal === false) return;
    logger.error(SCRIPT_SCOPE, "conference.error", payload?.error?.message ?? MEETING_LABELS.loadError);
    disposeApi(session);
    session.snapshot = { status: "failed", participantCount: 0 };
    emitConference(session);
    options.callbacks.onFailed();
  });

  session.api = api;

  return () => {
    session.listeners.delete(onStoreChange);
    if (session.listeners.size === 0) {
      disposeApi(session);
      conferences.delete(key);
    }
  };
};

export const getJitsiSnapshot = (key: string): JitsiSnapshot =>
  conferences.get(key)?.snapshot ?? IDLE_SNAPSHOT;

export const getIdleJitsiSnapshot = (): JitsiSnapshot => IDLE_SNAPSHOT;

declare global {
  interface Window {
    JitsiMeetExternalAPI?: JitsiApiConstructor;
  }
}
