export type OfficeTeamRole = {
  id: string;
  /** Gateway agent id this role maps to. Tasks assigned to the role land here. */
  agentId: string;
  name: string;
  role: string;
  roleId: string;
  room:
    | "planning_room"
    | "social_media_studio"
    | "war_room"
    | "worker_room"
    | "playing_room"
    | "hq";
  floor: "hermes" | "studio";
  responsibilities: string[];
  /** Optional working-style note shown in the team panel. */
  personality?: string;
};

/**
 * Configured team plan. Names are only shown where the user specified them.
 *
 * `agentId` is the gateway identity seeded by server/hermes-gateway-adapter.js.
 * Keeping the mapping here (rather than deriving it from the display name)
 * means renaming a person never silently re-points their tasks at nobody.
 */
export const OFFICE_ROSTER: readonly OfficeTeamRole[] = [
  {
    id: "founder",
    agentId: "founder",
    name: "Fikri",
    role: "Founder",
    roleId: "founder",
    room: "hq",
    floor: "hermes",
    responsibilities: [
      "Set the vision and direction",
      "Decide priorities and trade-offs",
      "Unblock the team and connect the dots",
    ],
    personality:
      "Curious ENTJ — relentless \"why?\", fast decisions, a dash of ADHD restlessness.",
  },
  {
    id: "tech-lead",
    agentId: "tech-lead",
    name: "Kevin",
    role: "Tech Lead",
    roleId: "tech_lead",
    room: "war_room",
    floor: "hermes",
    responsibilities: ["Technical direction", "Review plans", "Coordinate delivery"],
  },
  {
    id: "backend-engineer",
    agentId: "backend-engineer",
    name: "Nabila",
    role: "Backend & Database",
    roleId: "backend_engineer",
    room: "worker_room",
    floor: "hermes",
    responsibilities: ["Backend services", "Database schema", "API and security"],
  },
  {
    id: "it-architect",
    agentId: "it-architect",
    name: "Arka",
    role: "IT Architect",
    roleId: "it_architect",
    room: "war_room",
    floor: "hermes",
    responsibilities: ["Break down tasks", "Architecture reviews", "Lead incident response"],
  },
  {
    id: "frontend-engineer",
    agentId: "frontend-engineer",
    name: "Citra",
    role: "Frontend & UI/UX Engineer",
    roleId: "frontend_engineer",
    room: "worker_room",
    floor: "hermes",
    responsibilities: ["Next.js and React", "UI styling", "Interaction and visual design"],
  },
  {
    id: "qa-security",
    agentId: "qa-security",
    name: "Dian",
    role: "QA, Testing & Security",
    roleId: "qa_security",
    room: "worker_room",
    floor: "hermes",
    responsibilities: ["Automated testing", "Security review", "Bug verification"],
  },
  {
    id: "rd-explorer",
    agentId: "rd-explorer",
    name: "Eko",
    role: "R&D Explorer",
    roleId: "rd_explorer",
    room: "playing_room",
    floor: "hermes",
    responsibilities: ["Technology experiments", "Tool and library evaluation", "Benchmarks"],
  },
  {
    id: "planning-collab",
    agentId: "planning-collab",
    name: "Dina",
    role: "Project planning",
    roleId: "planning_collaboration",
    room: "planning_room",
    floor: "studio",
    responsibilities: ["Break work into tasks", "Coordinate cross-team handoffs"],
  },
  {
    id: "scriptwriter",
    agentId: "scriptwriter",
    name: "Nadia",
    role: "Video script & hooks",
    roleId: "scriptwriter",
    room: "social_media_studio",
    floor: "studio",
    responsibilities: ["Write scripts", "Prepare hooks, narration and calls to action"],
  },
  {
    id: "storyboard-artist",
    agentId: "storyboard-artist",
    name: "Raka",
    role: "Storyboard and animation",
    roleId: "animator",
    room: "social_media_studio",
    floor: "studio",
    responsibilities: ["Create storyboard", "Produce animation and visual assets"],
  },
  {
    id: "video-editor",
    agentId: "video-editor",
    name: "Maya",
    role: "Editing & sound",
    roleId: "video_editor",
    room: "social_media_studio",
    floor: "studio",
    responsibilities: ["Edit video", "Add captions, sound and final polish"],
  },
  {
    id: "social-publisher",
    agentId: "social-publisher",
    name: "Rafi",
    role: "YouTube & TikTok publishing",
    roleId: "social_publisher",
    room: "social_media_studio",
    floor: "studio",
    responsibilities: ["Prepare platform-specific versions", "Schedule and track posts"],
  },
];

export const getRosterByFloor = (floor: "hermes" | "studio") =>
  OFFICE_ROSTER.filter((member) => member.floor === floor);

const ROSTER_BY_AGENT_ID = new Map(OFFICE_ROSTER.map((member) => [member.agentId, member]));

/** Resolve a gateway agent id back to its roster entry (or null). */
export const getRosterMemberByAgentId = (agentId: string | null | undefined) =>
  agentId ? (ROSTER_BY_AGENT_ID.get(agentId) ?? null) : null;

/** Every gateway agent id the office expects to exist. */
export const ROSTER_AGENT_IDS: readonly string[] = OFFICE_ROSTER.map((member) => member.agentId);
