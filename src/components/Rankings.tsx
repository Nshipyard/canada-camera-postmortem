"use client";

import { useMemo, useState } from "react";
import { useLang } from "@/i18n";
import { fmt, fmtMoney, fmtRange, type AseSite, type Intersection } from "@/lib/format";

interface Props {
  ase: AseSite[];
  rlc: Intersection[];
}

export default function Rankings({ ase, rlc }: Props) {
  const { t } = useLang();
  const [tab, setTab] = useState<"ase" | "rlc">("ase");
  const [q, setQ] = useState("");

  const aseRows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const hits = needle ? ase.filter((s) => `${s.location} ${s.code}`.toLowerCase().includes(needle)) : ase;
    return [...hits].sort((a, b) => b.total_charges - a.total_charges);
  }, [ase, q]);

  const rlcRows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const hits = needle ? rlc.filter((x) => `${x.name} ${x.code}`.toLowerCase().includes(needle)) : rlc;
    return [...hits].sort((a, b) => b.total_charges - a.total_charges);
  }, [rlc, q]);

  const period = (start: string | null, end: string | null) =>
    start && end ? `${start.slice(0, 7)} – ${end.slice(0, 7)}` : "–";

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex rounded-full border border-line p-1">
          {(["ase", "rlc"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              aria-pressed={tab === k}
              className={`rounded-full px-5 py-2 text-[15px] font-medium ${tab === k ? "bg-ink text-white" : "text-ink/60 hover:text-ink"}`}
            >
              {k === "ase" ? t.explorer.tabAse : t.explorer.tabRlc}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.explorer.search}
          className="min-w-[220px] flex-1 rounded-full border border-line bg-white px-5 py-2.5 text-[15px] outline-none placeholder:text-ink/40 focus:border-ink/40"
        />
      </div>

      {tab === "ase" && (
        <p className="mb-5 max-w-[760px] rounded-xl border border-line bg-muted px-5 py-4 text-[14px] leading-relaxed text-ink/70">
          {t.explorer.aseNote}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[760px] text-left text-[15px]">
          <thead>
            <tr className="border-b border-line bg-muted text-[13px] uppercase tracking-wide text-ink/55">
              <th className="px-5 py-3 font-medium">{t.explorer.colRank}</th>
              <th className="px-5 py-3 font-medium">{t.explorer.colLocation}</th>
              <th className="px-5 py-3 font-medium">{t.explorer.colWard}</th>
              <th className="px-5 py-3 font-medium">{t.explorer.colActive}</th>
              <th className="px-5 py-3 text-right font-medium">{t.explorer.colTickets}</th>
              <th className="px-5 py-3 text-right font-medium">{t.explorer.colRevenue}</th>
            </tr>
          </thead>
          <tbody>
            {(tab === "ase" ? aseRows : rlcRows).map((r, i) => {
              const isAse = tab === "ase";
              const rev = isAse
                ? fmtRange((r as AseSite).revenue_low, (r as AseSite).revenue_high)
                : fmtMoney((r as Intersection).revenue_exact);
              const name = isAse ? (r as AseSite).location : (r as Intersection).name;
              const start = isAse ? (r as AseSite).enforcement_start : (r as Intersection).enforcement_start;
              const end = isAse ? (r as AseSite).enforcement_end : (r as Intersection).enforcement_end;
              return (
                <tr key={isAse ? (r as AseSite).code : (r as Intersection).code} className="border-b border-line/60 last:border-0 hover:bg-muted/60">
                  <td className="px-5 py-3 font-semibold text-ink/60">{i + 1}</td>
                  <td className="px-5 py-3 font-medium">{name}</td>
                  <td className="px-5 py-3 text-ink/60">{r.ward ?? "–"}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-ink/60">{period(start, end)}</td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">{fmt(r.total_charges)}</td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums text-canada-dark">{rev}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[13px] text-ink/50">
        {t.explorer.showing} {(tab === "ase" ? aseRows : rlcRows).length} {t.explorer.of} {(tab === "ase" ? ase : rlc).length}
        {(tab === "ase" ? aseRows : rlcRows).length === 0 && ` · ${t.explorer.noResult}`}
      </p>
    </div>
  );
}
