export const MEETING_GATE_ROLES = ["host", "guest"] as const;
export type MeetingGateRole = (typeof MEETING_GATE_ROLES)[number];

export const MEETING_GATE_STAGES = ["waiting_host", "waiting_admit", "admitted", "denied"] as const;
export type MeetingGateStage = (typeof MEETING_GATE_STAGES)[number];

const PARTICIPANT_TTL_MS = 120_000;

type SeatStage = "waiting" | "admitted" | "denied";

export type MeetingGateIdentity = {
  userId: string;
  fullName: string;
  email: string;
};

type Seat = MeetingGateIdentity & {
  role: MeetingGateRole;
  stage: SeatStage;
  joinedAt: number;
  lastSeenAt: number;
};

type Room = {
  seats: Map<string, Seat>;
};

export type MeetingWaitingGuest = MeetingGateIdentity & {
  requestedAt: number;
};

export type MeetingGateSnapshot = {
  role: MeetingGateRole;
  stage: MeetingGateStage;
  identity: MeetingGateIdentity;
  hostPresent: boolean;
  canEnterMedia: boolean;
  waiting: MeetingWaitingGuest[];
};

const rooms = new Map<string, Room>();

const identityOf = (seat: Seat): MeetingGateIdentity => ({
  userId: seat.userId,
  fullName: seat.fullName,
  email: seat.email
});

const getRoom = (activityId: string): Room => {
  const existing = rooms.get(activityId);
  if (existing) return existing;
  const created: Room = { seats: new Map() };
  rooms.set(activityId, created);
  return created;
};

const prune = (activityId: string, room: Room, now: number) => {
  for (const [userId, seat] of room.seats) {
    if (now - seat.lastSeenAt > PARTICIPANT_TTL_MS) room.seats.delete(userId);
  }
  if (room.seats.size === 0) rooms.delete(activityId);
};

const hostPresent = (room: Room, now: number) => {
  for (const seat of room.seats.values()) {
    if (seat.role === "host" && now - seat.lastSeenAt <= PARTICIPANT_TTL_MS) return true;
  }
  return false;
};

const waitingGuests = (room: Room, now: number): MeetingWaitingGuest[] => {
  const list: MeetingWaitingGuest[] = [];
  for (const seat of room.seats.values()) {
    if (seat.role !== "guest") continue;
    if (seat.stage !== "waiting") continue;
    if (now - seat.lastSeenAt > PARTICIPANT_TTL_MS) continue;
    list.push({ ...identityOf(seat), requestedAt: seat.joinedAt });
  }
  list.sort((a, b) => a.requestedAt - b.requestedAt);
  return list;
};

const toStage = (seat: Seat, present: boolean): MeetingGateStage => {
  if (seat.role === "host") return "admitted";
  if (seat.stage === "denied") return "denied";
  if (seat.stage === "admitted") return "admitted";
  return present ? "waiting_admit" : "waiting_host";
};

const snapshotOf = (seat: Seat, room: Room, now: number): MeetingGateSnapshot => {
  const present = hostPresent(room, now);
  const stage = toStage(seat, present);
  return {
    role: seat.role,
    stage,
    identity: identityOf(seat),
    hostPresent: present,
    canEnterMedia: stage === "admitted",
    waiting: seat.role === "host" ? waitingGuests(room, now) : []
  };
};

export const touchMeetingGate = (input: {
  activityId: string;
  identity: MeetingGateIdentity;
  role: MeetingGateRole;
}): MeetingGateSnapshot => {
  const now = Date.now();
  const room = getRoom(input.activityId);
  prune(input.activityId, room, now);

  const existing = room.seats.get(input.identity.userId);
  const seat: Seat = existing
    ? {
        ...existing,
        fullName: input.identity.fullName,
        email: input.identity.email,
        role: input.role,
        lastSeenAt: now,
        stage:
          input.role === "host"
            ? "admitted"
            : existing.stage === "denied" || existing.stage === "admitted"
              ? existing.stage
              : "waiting"
      }
    : {
        ...input.identity,
        role: input.role,
        stage: input.role === "host" ? "admitted" : "waiting",
        joinedAt: now,
        lastSeenAt: now
      };

  room.seats.set(seat.userId, seat);
  return snapshotOf(seat, room, now);
};

export const leaveMeetingGate = (activityId: string, userId: string): boolean => {
  const room = rooms.get(activityId);
  if (!room) return false;
  const existed = room.seats.delete(userId);
  prune(activityId, room, Date.now());
  return existed;
};

export const admitMeetingGuest = (input: {
  activityId: string;
  hostUserId: string;
  guestUserId: string;
  allow: boolean;
}): MeetingGateSnapshot | "not_host" | "not_waiting" => {
  const now = Date.now();
  const room = rooms.get(input.activityId);
  if (!room) return "not_waiting";
  prune(input.activityId, room, now);

  const host = room.seats.get(input.hostUserId);
  if (!host || host.role !== "host") return "not_host";

  const guest = room.seats.get(input.guestUserId);
  if (!guest || guest.role !== "guest") return "not_waiting";
  if (guest.stage === "admitted" && input.allow) return snapshotOf(host, room, now);
  if (guest.stage !== "waiting" && guest.stage !== "admitted") return "not_waiting";

  guest.stage = input.allow ? "admitted" : "denied";
  guest.lastSeenAt = now;
  room.seats.set(guest.userId, guest);
  return snapshotOf(host, room, now);
};
