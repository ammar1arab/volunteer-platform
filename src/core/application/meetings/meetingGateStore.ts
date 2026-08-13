import type {
  MeetingGateIdentityDto,
  MeetingGateRoleDto,
  MeetingGateSnapshotDto,
  MeetingWaitingGuestDto
} from "@/core/application/dtos";

/** Waiting guests drop if they stop polling. */
const WAITING_TTL_MS = 180_000;
/** Admitted seats / hosts stay until explicit leave (or very long idle). */
const ADMITTED_TTL_MS = 2 * 60 * 60 * 1000;

type SeatStage = "waiting" | "admitted" | "denied";

type Seat = MeetingGateIdentityDto & {
  role: MeetingGateRoleDto;
  stage: SeatStage;
  joinedAt: number;
  lastSeenAt: number;
};

type Room = { seats: Map<string, Seat> };

const rooms = new Map<string, Room>();

const identityOf = (seat: Seat): MeetingGateIdentityDto => ({
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

const seatTtl = (seat: Seat) =>
  seat.role === "host" || seat.stage === "admitted" ? ADMITTED_TTL_MS : WAITING_TTL_MS;

const prune = (room: Room, now: number) => {
  for (const [userId, seat] of room.seats) {
    if (now - seat.lastSeenAt > seatTtl(seat)) room.seats.delete(userId);
  }
};

const dropIfEmpty = (activityId: string, room: Room) => {
  if (room.seats.size === 0) rooms.delete(activityId);
};

const isLiveHost = (seat: Seat, now: number) =>
  seat.role === "host" && now - seat.lastSeenAt <= ADMITTED_TTL_MS;

const hostPresent = (room: Room, now: number) => {
  for (const seat of room.seats.values()) {
    if (isLiveHost(seat, now)) return true;
  }
  return false;
};

const waitingGuests = (room: Room, now: number): MeetingWaitingGuestDto[] =>
  [...room.seats.values()]
    .filter(
      (seat) =>
        seat.role === "guest" &&
        seat.stage === "waiting" &&
        now - seat.lastSeenAt <= WAITING_TTL_MS
    )
    .sort((a, b) => a.joinedAt - b.joinedAt)
    .map((seat) => ({ ...identityOf(seat), requestedAt: seat.joinedAt }));

const snapshotOf = (seat: Seat, room: Room, now: number): MeetingGateSnapshotDto => {
  const present = hostPresent(room, now);
  const stage =
    seat.role === "host"
      ? "admitted"
      : seat.stage === "waiting"
        ? present
          ? "waiting_admit"
          : "waiting_host"
        : seat.stage;
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
  identity: MeetingGateIdentityDto;
  role: MeetingGateRoleDto;
}): MeetingGateSnapshotDto => {
  const now = Date.now();
  const room = getRoom(input.activityId);
  prune(room, now);

  const existing = room.seats.get(input.identity.userId);
  const guestStage =
    existing?.stage === "admitted" || existing?.stage === "denied" ? existing.stage : "waiting";
  const seat: Seat = {
    ...input.identity,
    role: input.role,
    joinedAt: existing?.joinedAt ?? now,
    lastSeenAt: now,
    stage: input.role === "host" ? "admitted" : guestStage
  };

  room.seats.set(seat.userId, seat);
  return snapshotOf(seat, room, now);
};

export const leaveMeetingGate = (activityId: string, userId: string): boolean => {
  const room = rooms.get(activityId);
  if (!room) return false;
  const existed = room.seats.delete(userId);
  prune(room, Date.now());
  dropIfEmpty(activityId, room);
  return existed;
};

export const admitMeetingGuest = (input: {
  activityId: string;
  hostUserId: string;
  guestUserId: string;
  allow: boolean;
}): MeetingGateSnapshotDto | "not_host" | "not_waiting" => {
  const now = Date.now();
  const room = rooms.get(input.activityId);
  if (!room) return "not_waiting";
  prune(room, now);

  if (input.hostUserId === input.guestUserId) return "not_waiting";

  const host = room.seats.get(input.hostUserId);
  if (!host || host.role !== "host") return "not_host";

  const guest = room.seats.get(input.guestUserId);
  if (!guest || guest.role !== "guest" || guest.stage === "denied") return "not_waiting";
  if (guest.stage === "admitted" && input.allow) return snapshotOf(host, room, now);

  guest.stage = input.allow ? "admitted" : "denied";
  guest.lastSeenAt = now;
  room.seats.set(guest.userId, guest);
  return snapshotOf(host, room, now);
};
