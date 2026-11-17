import { describe, expect, it } from "vitest";

import {
  DEFAULT_ACTIVE_FLOOR_ID,
  getOfficeFloor,
  HERMES_FLOOR,
  OFFICE_FLOORS,
  resolveActiveOfficeFloorId,
  STUDIO_FLOOR,
} from "@/lib/office/floors";

describe("office floors", () => {
  it("exposes an HQ floor and a studio floor", () => {
    expect(OFFICE_FLOORS.map((floor) => floor.id)).toEqual(["hermes", "studio"]);
  });

  it("labels the studio floor for planning and social media", () => {
    const studio = getOfficeFloor("studio");
    expect(studio.label.toLowerCase()).toContain("studio");
    expect(studio.rooms).toEqual(
      expect.arrayContaining(["planning_room", "social_media_studio"]),
    );
  });

  it("includes the three technical work zones on HQ", () => {
    expect(HERMES_FLOOR.rooms).toEqual(
      expect.arrayContaining(["war_room", "worker_room", "playing_room"]),
    );
  });

  it("includes planning and social media zones on the studio floor", () => {
    expect(STUDIO_FLOOR.rooms).toEqual(
      expect.arrayContaining(["planning_room", "social_media_studio"]),
    );
  });

  it("defaults to the HQ floor and keeps unknown ids on the default", () => {
    expect(DEFAULT_ACTIVE_FLOOR_ID).toBe("hermes");
    expect(resolveActiveOfficeFloorId("studio")).toBe("studio");
    expect(resolveActiveOfficeFloorId("lobby")).toBe("hermes");
    expect(resolveActiveOfficeFloorId(null)).toBe("hermes");
  });
});
