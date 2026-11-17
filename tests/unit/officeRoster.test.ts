import { describe, expect, it } from "vitest";

import {
  OFFICE_ROSTER,
  ROSTER_AGENT_IDS,
  getRosterByFloor,
  getRosterMemberByAgentId,
} from "@/lib/office/roster";

describe("OFFICE_ROSTER", () => {
  it("has Kevin as the tech lead", () => {
    const techLead = OFFICE_ROSTER.find((member) => member.roleId === "tech_lead");
    expect(techLead?.name).toBe("Kevin");
  });

  it("includes the founder in HQ with a working-style note", () => {
    const founder = OFFICE_ROSTER.find((member) => member.roleId === "founder");
    expect(founder).toMatchObject({ name: "Fikri", role: "Founder", room: "hq", floor: "hermes" });
    expect(founder?.responsibilities.length).toBeGreaterThan(0);
    expect(founder?.personality).toContain("ENTJ");
  });

  it("gives every member a gateway agent id matching their roster id", () => {
    for (const member of OFFICE_ROSTER) {
      expect(member.agentId).toBe(member.id);
    }
    expect(new Set(ROSTER_AGENT_IDS).size).toBe(OFFICE_ROSTER.length);
  });

  it("resolves a roster member from a gateway agent id", () => {
    expect(getRosterMemberByAgentId("tech-lead")?.name).toBe("Kevin");
    expect(getRosterMemberByAgentId("founder")?.role).toBe("Founder");
    expect(getRosterMemberByAgentId("does-not-exist")).toBeNull();
    expect(getRosterMemberByAgentId(null)).toBeNull();
  });

  it("lists the founder before the rest of the team", () => {
    expect(OFFICE_ROSTER[0].roleId).toBe("founder");
  });

  it("renames the backend engineer to Nabila instead of Fitri", () => {
    const backend = OFFICE_ROSTER.find((member) => member.roleId === "backend_engineer");
    expect(backend?.name).toBe("Nabila");
    expect(OFFICE_ROSTER.map((member) => member.name)).not.toContain("Fitri");
  });

  it("includes the requested IT specialists in the HQ floor team", () => {
    const byRole = Object.fromEntries(OFFICE_ROSTER.map((member) => [member.roleId, member]));
    expect(byRole.it_architect).toMatchObject({ name: "Arka", room: "war_room", floor: "hermes" });
    expect(byRole.frontend_engineer).toMatchObject({ name: "Citra", room: "worker_room", floor: "hermes" });
    expect(byRole.qa_security).toMatchObject({ name: "Dian", room: "worker_room", floor: "hermes" });
    expect(byRole.rd_explorer).toMatchObject({ name: "Eko", room: "playing_room", floor: "hermes" });
  });

  it("staffs a social media team and a planning team", () => {
    const rooms = new Set(OFFICE_ROSTER.map((member) => member.room));
    expect(rooms.has("social_media_studio")).toBe(true);
    expect(rooms.has("planning_room")).toBe(true);
    const socmed = OFFICE_ROSTER.filter((member) => member.room === "social_media_studio");
    expect(socmed.length).toBeGreaterThanOrEqual(3);
    expect(socmed.some((member) => member.roleId === "scriptwriter")).toBe(true);
  });

  it("assigns human names to planning and creative roles", () => {
    const namesByRole = Object.fromEntries(
      OFFICE_ROSTER.map((member) => [member.roleId, member.name]),
    );
    expect(namesByRole).toMatchObject({
      planning_collaboration: "Dina",
      scriptwriter: "Nadia",
      animator: "Raka",
      video_editor: "Maya",
      social_publisher: "Rafi",
    });
  });

  it("keeps unique ids and names", () => {
    expect(new Set(OFFICE_ROSTER.map((member) => member.id)).size).toBe(
      OFFICE_ROSTER.length,
    );
    expect(new Set(OFFICE_ROSTER.map((member) => member.name)).size).toBe(
      OFFICE_ROSTER.length,
    );
  });

  it("assigns every member to an office floor", () => {
    expect(getRosterByFloor("studio").length).toBeGreaterThan(0);
    expect(getRosterByFloor("hermes").length).toBeGreaterThan(0);
  });
});
