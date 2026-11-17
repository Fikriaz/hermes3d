export type OfficeTeamRole = {
  id: string;
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
};

/** Configured team plan. Names are only shown where the user specified them. */
export const OFFICE_ROSTER: readonly OfficeTeamRole[] = [
  {
    id: "tech-lead",
    name: "Fikri",
    role: "Tech Lead",
    roleId: "tech_lead",
    room: "war_room",
    floor: "hermes",
    responsibilities: ["Technical direction", "Review plans", "Coordinate delivery"],
  },
  {
    id: "backend-engineer",
    name: "Nabila",
    role: "Backend & Database",
    roleId: "backend_engineer",
    room: "worker_room",
    floor: "hermes",
    responsibilities: ["Backend services", "Database schema", "API and security"],
  },
  {
    id: "it-architect",
    name: "Arka",
    role: "IT Architect",
    roleId: "it_architect",
    room: "war_room",
    floor: "hermes",
    responsibilities: ["Break down tasks", "Architecture reviews", "Lead incident response"],
  },
  {
    id: "frontend-engineer",
    name: "Citra",
    role: "Frontend & UI/UX Engineer",
    roleId: "frontend_engineer",
    room: "worker_room",
    floor: "hermes",
    responsibilities: ["Next.js and React", "UI styling", "Interaction and visual design"],
  },
  {
    id: "qa-security",
    name: "Dian",
    role: "QA, Testing & Security",
    roleId: "qa_security",
    room: "worker_room",
    floor: "hermes",
    responsibilities: ["Automated testing", "Security review", "Bug verification"],
  },
  {
    id: "rd-explorer",
    name: "Eko",
    role: "R&D Explorer",
    roleId: "rd_explorer",
    room: "playing_room",
    floor: "hermes",
    responsibilities: ["Technology experiments", "Tool and library evaluation", "Benchmarks"],
  },
  {
    id: "planning-collab",
    name: "Dina",
    role: "Project planning",
    roleId: "planning_collaboration",
    room: "planning_room",
    floor: "studio",
    responsibilities: ["Break work into tasks", "Coordinate cross-team handoffs"],
  },
  {
    id: "scriptwriter",
    name: "Nadia",
    role: "Video script & hooks",
    roleId: "scriptwriter",
    room: "social_media_studio",
    floor: "studio",
    responsibilities: ["Write scripts", "Prepare hooks, narration and calls to action"],
  },
  {
    id: "storyboard-artist",
    name: "Raka",
    role: "Storyboard and animation",
    roleId: "animator",
    room: "social_media_studio",
    floor: "studio",
    responsibilities: ["Create storyboard", "Produce animation and visual assets"],
  },
  {
    id: "video-editor",
    name: "Maya",
    role: "Editing & sound",
    roleId: "video_editor",
    room: "social_media_studio",
    floor: "studio",
    responsibilities: ["Edit video", "Add captions, sound and final polish"],
  },
  {
    id: "social-publisher",
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
