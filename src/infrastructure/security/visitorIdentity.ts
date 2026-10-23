import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const VISITOR_COOKIE = "basmat_visitor";

export function visitorKey(value: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("Visitor identity signing is unavailable");
  return createHmac("sha256", secret).update(`basmat-analytics:${value}`).digest("hex");
}

export function signVisitor(id: string): string {
  return `${id}.${visitorKey(`cookie:${id}`)}`;
}

export function readVisitor(cookie: string | undefined): string | null {
  if (!cookie) return null;
  const [id, signature, extra] = cookie.split(".");
  if (extra || !id || !signature || !/^[a-f0-9]{64}$/.test(signature)) return null;
  const expected = Buffer.from(visitorKey(`cookie:${id}`), "hex");
  return timingSafeEqual(Buffer.from(signature, "hex"), expected) ? id : null;
}

export function newVisitorId() {
  return randomUUID();
}
