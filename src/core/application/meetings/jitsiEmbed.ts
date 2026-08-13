import { createPrivateKey, createSign } from "crypto";
import { getJitsiRoomPrefix } from "@/presentation/constants/meetingEmbed";

const JAAS_HOST = "8x8.vc";
const PUBLIC_HOST = "meet.jit.si";
const TOKEN_TTL_SEC = 60 * 60;
const TOKEN_CACHE_MS = 50 * 60 * 1000;

export type JitsiEmbedDto = {
  host: string;
  roomName: string;
  jwt: string | null;
};

type TokenCacheEntry = {
  jwt: string;
  exp: number;
};

const tokenCache = new Map<string, TokenCacheEntry>();

const readEnv = (key: string) => process.env[key]?.trim() || "";

const jaasAppId = () => readEnv("JITSI_JAAS_APP_ID") || readEnv("NEXT_PUBLIC_JITSI_JAAS_APP_ID");
const jaasKeyId = () => readEnv("JITSI_JAAS_KEY_ID");
const jaasPrivateKey = () => readEnv("JITSI_JAAS_PRIVATE_KEY").replace(/\\n/g, "\n");

export const isJaasConfigured = () =>
  Boolean(jaasAppId() && jaasKeyId() && jaasPrivateKey().includes("BEGIN"));

export const getJitsiEmbedHost = () => {
  if (isJaasConfigured()) return JAAS_HOST;
  const custom = readEnv("NEXT_PUBLIC_JITSI_HOST")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  return custom || PUBLIC_HOST;
};

const localRoomName = (activityId: string) =>
  `${getJitsiRoomPrefix()}${activityId.replace(/-/g, "")}`;

const toBase64Url = (value: string) =>
  Buffer.from(value).toString("base64url");

const signRs256 = (data: string, pem: string) => {
  const sign = createSign("RSA-SHA256");
  sign.update(data);
  sign.end();
  return sign.sign(createPrivateKey(pem), "base64url");
};

const issueJaasJwt = (input: {
  activityId: string;
  userId: string;
  displayName: string;
  email: string;
  moderator: boolean;
}) => {
  const appId = jaasAppId();
  const keyId = jaasKeyId();
  const pem = jaasPrivateKey();
  const now = Math.floor(Date.now() / 1000);
  const cacheKey = `${input.activityId}:${input.userId}:${input.moderator ? "h" : "g"}`;
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.exp - 120 > now) return cached.jwt;

  const payload = {
    aud: "jitsi",
    iss: "chat",
    sub: appId,
    room: localRoomName(input.activityId),
    nbf: now - 10,
    exp: now + TOKEN_TTL_SEC,
    context: {
      user: {
        id: input.userId,
        name: input.displayName,
        email: input.email,
        moderator: input.moderator ? "true" : "false"
      },
      features: {
        livestreaming: "false",
        recording: input.moderator ? "true" : "false",
        transcription: "false",
        "outbound-call": "false"
      }
    }
  };

  const header = toBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT", kid: keyId }));
  const body = toBase64Url(JSON.stringify(payload));
  const jwt = `${header}.${body}.${signRs256(`${header}.${body}`, pem)}`;
  tokenCache.set(cacheKey, { jwt, exp: payload.exp });
  return jwt;
};

export const createJitsiEmbed = (input: {
  activityId: string;
  userId: string;
  displayName: string;
  email: string;
  moderator: boolean;
}): JitsiEmbedDto => {
  const host = getJitsiEmbedHost();
  const room = localRoomName(input.activityId);
  if (isJaasConfigured()) {
    return {
      host,
      roomName: `${jaasAppId()}/${room}`,
      jwt: issueJaasJwt(input)
    };
  }
  return { host, roomName: room, jwt: null };
};
