"use client";

import { useState } from "react";
import { OFFICE_ROSTER, type OfficeTeamRole } from "@/lib/office/roster";
import { OFFICE_ACCENTS, type OfficeAccentTone } from "@/features/office/theme/accents";

type FloorId = "hermes" | "studio";

const ROOM_LABELS: Record<OfficeTeamRole["room"], string> = {
  war_room: "War Room",
  worker_room: "Worker Room",
  playing_room: "Playing Room",
  planning_room: "Planning & Collaboration",
  social_media_studio: "Social Media Studio",
  hq: "HQ",
};

function MemberRow({ member, accent }: { member: OfficeTeamRole; accent: OfficeAccentTone }) {
  return (
    <li className={`rounded-lg p-2 ${accent.card}`}>
      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
        <b className={accent.name}>{member.name}</b>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">{member.role}</span>
        <span className="text-white/35">· {ROOM_LABELS[member.room]}</span>
      </div>
      <p className="mt-0.5 text-[11px] leading-snug text-white/55">{member.responsibilities.join(" · ")}</p>
      {member.personality ? (
        <p className="mt-1 border-l-2 border-white/15 pl-2 text-[10px] italic leading-snug text-white/40">
          {member.personality}
        </p>
      ) : null}
    </li>
  );
}

export function OfficeFloorControls({
  activeFloorId,
  onFloorChange,
}: {
  activeFloorId: FloorId;
  onFloorChange: (floorId: FloorId) => void;
}) {
  const [teamOpen, setTeamOpen] = useState(false);
  const founder = OFFICE_ROSTER.find((member) => member.roleId === "founder");
  const itTeam = OFFICE_ROSTER.filter(
    (member) => member.floor === "hermes" && member.roleId !== "founder",
  );
  const planning = OFFICE_ROSTER.filter(
    (member) => member.floor === "studio" && member.room === "planning_room",
  );
  const social = OFFICE_ROSTER.filter((member) => member.room === "social_media_studio");

  return (
    <div className="pointer-events-auto absolute left-3 top-3 z-40 flex max-w-[calc(100%-1.5rem)] flex-col items-start gap-2">
      <nav aria-label="Office floors" className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-[#0f1319]/95 p-1 shadow-lg backdrop-blur-md">
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
          className={`rounded-lg px-2.5 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors ${teamOpen ? "bg-white/[0.08] text-white/90" : "text-white/55 hover:bg-white/5 hover:text-white/85"}`}
        >
          {teamOpen ? "Tutup tim" : "Tim & alur video"}
        </button>
      </nav>

      {teamOpen ? (
        <section aria-label="Team plan" className="max-h-[min(65vh,560px)] w-[min(380px,calc(100vw-1.5rem))] overflow-y-auto rounded-xl border border-white/10 bg-[#0f1319]/95 p-3 text-white/80 shadow-2xl backdrop-blur-md">
          <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white/85">Susunan tim</h2>

          {founder ? (
            <>
              <h3 className={`mt-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${OFFICE_ACCENTS.founder.heading}`}>
                Founder · HQ
              </h3>
              <ul className="mt-2 space-y-2 text-xs">
                <MemberRow member={founder} accent={OFFICE_ACCENTS.founder} />
              </ul>
            </>
          ) : null}

          <h3 className={`mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${OFFICE_ACCENTS.it.heading}`}>
            Tim IT · HQ
          </h3>
          <p className="mt-1 text-[10px] leading-snug text-white/35">
            War Room · arsitektur, sprint planning, insiden &amp; code review<br />
            Worker Room · coding, backend, frontend, database &amp; QA<br />
            Playing Room · R&amp;D, eksplorasi tool dan eksperimen
          </p>
          <ul className="mt-2 space-y-2 text-xs">
            {itTeam.map((member) => (
              <MemberRow key={member.id} member={member} accent={OFFICE_ACCENTS.it} />
            ))}
          </ul>

          <h3 className={`mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${OFFICE_ACCENTS.planning.heading}`}>
            Planning &amp; Collaboration
          </h3>
          <ul className="mt-2 space-y-2 text-xs">
            {planning.map((member) => (
              <MemberRow key={member.id} member={member} accent={OFFICE_ACCENTS.planning} />
            ))}
          </ul>

          <h3 className={`mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${OFFICE_ACCENTS.social.heading}`}>
            Tim Sosmed · YouTube &amp; TikTok
          </h3>
          <ol className="mt-2 space-y-2 text-xs">
            {social.map((member, index) => (
              <li key={member.id} className={`flex gap-2 rounded-lg p-2 ${OFFICE_ACCENTS.social.card}`}>
                <span className="font-mono text-pink-200/65">0{index + 1}</span>
                <span>
                  <b className="text-white/90">{member.name}</b>
                  <span className="block text-white/50">{member.responsibilities.join(" · ")}</span>
                </span>
              </li>
            ))}
          </ol>

          <p className="mt-3 text-[10px] leading-relaxed text-white/35">
            Alur: brief → script &amp; hook → storyboard → animasi → edit, subtitle &amp; audio → versi Shorts/TikTok → review → jadwal tayang.
            Peran ditetapkan; belum disambungkan ke identitas agent runtime sampai dibuat/di-assign di gateway.
          </p>
        </section>
      ) : null}
    </div>
  );
}
