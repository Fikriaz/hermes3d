import { describe, expect, it } from "vitest";

import { OFFICE_ROSTER } from "@/lib/office/roster";

// The gateway adapter seeds one agent per roster member from
// server/office-team-seed.js. Nothing at build time links the two files, so a
// rename in one place could silently leave the task board pointing at an agent
// id that no longer exists. These assertions are that link.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const seed = require("../../server/office-team-seed.js") as {
  OFFICE_TEAM: Array<{ id: string; name: string; role: string; responsibilities: string[] }>;
  buildOfficeAgentPrompt: (member: {
    name: string;
    role: string;
    room: string;
    responsibilities: string[];
    personality?: string;
  }) => string;
  seedOfficeAgents: (
    registry: Map<string, unknown>,
    homeDir: string,
    model: string,
  ) => string[];
};

describe("office team seed ↔ roster parity", () => {
  it("seeds exactly one agent per roster member", () => {
    expect(seed.OFFICE_TEAM.map((member) => member.id).sort()).toEqual(
      OFFICE_ROSTER.map((member) => member.agentId).sort(),
    );
  });

  it("keeps display names and roles identical on both sides", () => {
    for (const member of OFFICE_ROSTER) {
      const seeded = seed.OFFICE_TEAM.find((item) => item.id === member.agentId);
      expect(seeded, `missing seed for ${member.agentId}`).toBeTruthy();
      expect(seeded?.name).toBe(member.name);
      expect(seeded?.role).toBe(member.role);
      expect(seeded?.responsibilities).toEqual(member.responsibilities);
    }
  });

  it("carries each member's personality into the seeded prompt", () => {
    for (const member of OFFICE_ROSTER) {
      const seeded = seed.OFFICE_TEAM.find((item) => item.id === member.agentId);
      const prompt = seed.buildOfficeAgentPrompt({
        ...seeded!,
        room: "HQ",
        personality: member.personality,
      });
      expect(prompt).toContain(member.name);
      expect(prompt).toContain(member.role);
      if (member.personality) {
        expect(prompt).toContain(member.personality);
      }
    }
  });

  it("seeds the founder as Fikri and the tech lead as Kevin", () => {
    const registry = new Map<string, unknown>();
    const ids = seed.seedOfficeAgents(registry, "/home/test", "hermes");

    expect(ids).toHaveLength(OFFICE_ROSTER.length);
    expect(registry.has("founder")).toBe(true);
    expect(registry.has("tech-lead")).toBe(true);

    const founder = registry.get("founder") as { name: string; role: string };
    const techLead = registry.get("tech-lead") as { name: string; role: string };
    expect(founder).toMatchObject({ name: "Fikri", role: "Founder" });
    expect(techLead).toMatchObject({ name: "Kevin", role: "Tech Lead" });
  });

  it("does not clobber an agent that already exists", () => {
    const registry = new Map<string, unknown>([["founder", { id: "founder", name: "Existing" }]]);
    seed.seedOfficeAgents(registry, "/home/test", "hermes");
    expect((registry.get("founder") as { name: string }).name).toBe("Existing");
  });
});
