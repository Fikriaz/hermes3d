// The office has exactly one floor: Hermes. The multi-floor directory was
// removed — the gateway adapter (demo vs hermes) is chosen in settings, not
// by walking between floors. The floor model is kept as a thin type so
// persisted settings and the roster cache keep a stable shape.

export type FloorProvider =
  | "hermes"
  | "custom"
  | "demo"
  | "local"
  | "hermes3d";
export type FloorZone = "building";

export type FloorId = "hermes" | "studio";

export type FloorKind = "runtime" | "production";

export type OfficeRoomId =
  | "planning_room"
  | "social_media_studio"
  | "war_room"
  | "worker_room"
  | "playing_room";

export type FloorDefinition = {
  id: FloorId;
  label: string;
  shortLabel: string;
  provider: FloorProvider;
  kind: FloorKind;
  zone: FloorZone;
  enabled: boolean;
  sortOrder: number;
  runtimeProfileId: string | null;
  rooms: readonly OfficeRoomId[];
};

export const HERMES_FLOOR: FloorDefinition = {
  id: "hermes",
  label: "Hermes",
  shortLabel: "Hermes",
  provider: "hermes",
  kind: "runtime",
  zone: "building",
  enabled: true,
  sortOrder: 0,
  runtimeProfileId: "hermes-default",
  rooms: ["war_room", "worker_room", "playing_room", "planning_room", "social_media_studio"],
};

export const STUDIO_FLOOR: FloorDefinition = {
  id: "studio",
  label: "Studio — Planning & Social Media",
  shortLabel: "Studio",
  provider: "hermes",
  kind: "production",
  zone: "building",
  enabled: true,
  sortOrder: 1,
  runtimeProfileId: "hermes-default",
  rooms: ["planning_room", "social_media_studio"],
};

export const OFFICE_FLOORS: readonly FloorDefinition[] = [HERMES_FLOOR, STUDIO_FLOOR];

export const DEFAULT_ACTIVE_FLOOR_ID: FloorId = "hermes";

export const getOfficeFloor = (floorId?: string | null): FloorDefinition =>
  floorId === STUDIO_FLOOR.id ? STUDIO_FLOOR : HERMES_FLOOR;

export const listEnabledOfficeFloors = (): FloorDefinition[] =>
  OFFICE_FLOORS.filter((floor) => floor.enabled);

/**
 * Coerces any persisted floor id (including ids from the removed multi-floor
 * era such as "lobby" or "hermes-first") onto the single Hermes floor.
 */
export const resolveActiveOfficeFloorId = (floorId?: string | null): FloorId =>
  floorId === STUDIO_FLOOR.id ? STUDIO_FLOOR.id : DEFAULT_ACTIVE_FLOOR_ID;
