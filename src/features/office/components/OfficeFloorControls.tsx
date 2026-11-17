"use client";

import { useState } from "react";
import { OFFICE_ROSTER } from "@/lib/office/roster";

type FloorId = "hermes" | "studio";

const ROOM_LABELS: Record<(typeof OFFICE_ROSTER)[number]["room"], string> = {
  war_room: "War Room",
  worker_room: "Worker Room",
  playing_room: "Playing Room",
  planning_room: "Planning & Collaboration",
  social_media_studio: "Social Media Studio",
  hq: "HQ",
};

export function OfficeFloorControls({
  activeFloorId,
  onFloorChange,
}: {
  activeFloorId: FloorId;
  onFloorChange: (floorId: FloorId) => void;
}) {
  const [teamOpen, setTeamOpen] = useState(false);
  const social = OFFICE_ROSTER.filter((member) => member.room === "social_media_studio");

  return (
    <div className="pointer-events-auto absolute left-3 top-3 z-40 flex max-w-[calc(100%-1.5rem)] flex-col items-start gap-2">
      <nav aria-label="Office floors" className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-[#120e09]/95 p-1 shadow-lg backdrop-blur-md">
        <button
          type="button"
          aria-pressed={activeFloorId === "hermes"}
          onClick={() => onFloorChange("hermes")}
          className={`rounded-lg px-2.5 py-2 text-left font-mono text-[10px] uppercase tracking-wider transition-colors ${activeFloorId === "hermes" ? "bg-amber-400/15 text-amber-100" : "text-white/55 hover:bg-white/5 hover:text-white/85"}`}
        >
          Lantai 1 · HQ
        </button>
        <button
          type="button"
          aria-pressed={activeFloorId === "studio"}
          onClick={() => onFloorChange("studio")}
          className={`rounded-lg px-2.5 py-2 text-left font-mono text-[10px] uppercase tracking-wider transition-colors ${activeFloorId === "studio" ? "bg-cyan-400/15 text-cyan-100" : "text-white/55 hover:bg-white/5 hover:text-white/85"}`}
        >
          Lantai 2 · Planning + Studio
        </button>
        <button
          type="button"
          aria-expanded={teamOpen}
          onClick={() => setTeamOpen((open) => !open)}
          className="rounded-lg px-2.5 py-2 font-mono text-[10px] uppercase tracking-wider text-white/55 hover:bg-white/5 hover:text-white/85"
        >
          {teamOpen ? "Tutup tim" : "Tim & alur video"}
        </button>
      </nav>

      {teamOpen ? (
        <section aria-label="Team plan" className="max-h-[min(65vh,560px)] w-[min(360px,calc(100vw-1.5rem))] overflow-y-auto rounded-xl border border-cyan-400/15 bg-[#10141a]/96 p-3 text-white/80 shadow-2xl backdrop-blur-md">
          <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-100">Susunan tim</h2>
          <h3 className="mt-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-amber-100">Tim IT · HQ</h3>
          <p className="mt-1 text-[10px] text-white/35">War Room · arsitektur, sprint planning, insiden & code review<br />Worker Room · coding, backend, frontend, database & QA<br />Playing Room · R&D, eksplorasi tool dan eksperimen</p>
          <ul className="mt-2 space-y-2 text-xs">
            {OFFICE_ROSTER.filter((member) => member.floor === "hermes").map((member) => (
              <li key={member.id} className="rounded-lg bg-white/[0.04] p-2"><b className="text-amber-100">{member.name}</b><span className="text-white/55"> · {member.role} · {ROOM_LABELS[member.room]} — {member.responsibilities.join(" · ")}</span></li>
            ))}
          </ul>
          <h3 className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-100">Planning & Collaboration</h3>
          <ul className="mt-2 space-y-2 text-xs">
            {OFFICE_ROSTER.filter((member) => member.floor === "studio" && member.room === "planning_room").map((member) => (
              <li key={member.id} className="rounded-lg bg-white/[0.04] p-2"><b className="text-cyan-100">{member.name}</b><span className="text-white/55"> · {member.role} · {ROOM_LABELS[member.room]} — {member.responsibilities.join(" · ")}</span></li>
            ))}
          </ul>
          <h3 className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-pink-100">Tim Sosmed · YouTube & TikTok</h3>
          <ol className="mt-2 space-y-2 text-xs">
            {social.map((member, index) => (
              <li key={member.id} className="flex gap-2 rounded-lg bg-white/[0.04] p-2">
                <span className="font-mono text-pink-200/65">0{index + 1}</span>
                <span><b className="text-white/90">{member.name}</b><span className="block text-white/50">{member.responsibilities.join(" · ")}</span></span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[10px] leading-relaxed text-white/35">Alur: brief → script & hook → storyboard → animasi → edit, subtitle & audio → versi Shorts/TikTok → review → jadwal tayang. Peran ditetapkan; belum disambungkan ke identitas agent runtime sampai dibuat/di-assign di gateway.</p>
        </section>
      ) : null}
    </div>
  );
}
