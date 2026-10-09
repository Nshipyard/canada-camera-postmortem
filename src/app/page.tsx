"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Banner, Nav, Footer } from "@/components/chrome";
import Rankings from "@/components/Rankings";
import { useLang } from "@/i18n";
import type { AseSite, Intersection } from "@/lib/cameras";

const CameraMap = dynamic(() => import("@/components/CameraMap"), { ssr: false });

function Hero() {
  const { t } = useLang();
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-[1392px] px-6 py-16 md:py-24">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-canada">{t.hero.kicker}</p>
        <h1 className="display mt-4 max-w-[16ch] text-[44px] leading-[1.02] md:text-[72px]">{t.hero.title}</h1>
        <p className="mt-6 max-w-[720px] text-[17px] leading-relaxed text-ink/70">{t.hero.sub}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#explorer" className="rounded-full bg-ink px-6 py-3 text-[15px] font-medium text-white hover:bg-canada-dark">
            {t.hero.cta1}
          </a>
          <a href="#methodology" className="rounded-full border border-line px-6 py-3 text-[15px] font-medium hover:border-ink/40">
            {t.hero.cta2}
          </a>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const { t } = useLang();
  return (
    <section className="border-b border-line bg-muted/50">
      <div className="mx-auto grid max-w-[1392px] grid-cols-1 gap-px px-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {t.stats.map((s) => (
          <div key={s.label} className="px-2 py-4">
            <p className="display text-[36px] text-canada-dark">{s.value}</p>
            <p className="mt-2 text-[14px] leading-snug text-ink/60">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MapSection({ ase, rlc }: { ase: AseSite[]; rlc: Intersection[] }) {
  const { t } = useLang();
  return (
    <section className="mx-auto max-w-[1392px] px-6 py-16">
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-canada">{t.explorer.mapTitle}</p>
      <p className="mt-3 max-w-[720px] text-[15px] text-ink/60">{t.explorer.mapSub}</p>
      <div className="mt-6">
        <CameraMap ase={ase} rlc={rlc} />
      </div>
    </section>
  );
}

function ExplorerSection({ ase, rlc }: { ase: AseSite[]; rlc: Intersection[] }) {
  const { t } = useLang();
  return (
    <section id="explorer" className="border-t border-line bg-paper-warm">
      <div className="mx-auto max-w-[1392px] px-6 py-16">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-canada">{t.explorer.kicker}</p>
        <h2 className="display mt-3 text-[36px] md:text-[48px]">{t.explorer.title}</h2>
        <div className="mt-8">
          <Rankings ase={ase} rlc={rlc} />
        </div>
      </div>
    </section>
  );
}

function Caveats() {
  const { t } = useLang();
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-[1392px] px-6 py-16">
        <div className="rounded-2xl border-2 border-canada/25 bg-canada/5 px-6 py-8 md:px-10">
          <h2 className="display text-[30px] md:text-[36px]">{t.caveats.title}</h2>
          <ul className="mt-6 space-y-4">
            {t.caveats.items.map((item) => (
              <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-ink/75">
                <span className="mt-2 inline-block h-2 w-2 shrink-0 rounded-full bg-canada" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Methodology() {
  const { t } = useLang();
  return (
    <section id="methodology" className="border-t border-line bg-paper-warm">
      <div className="mx-auto max-w-[1392px] px-6 py-16">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-canada">{t.methodology.kicker}</p>
        <h2 className="display mt-3 text-[36px] md:text-[48px]">{t.methodology.title}</h2>

        <h3 className="mt-10 text-[20px] font-semibold">{t.methodology.sources}</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {t.methodology.sourceList.map(([name, desc, url]) => (
            <a key={name} href={url} className="rounded-2xl border border-line bg-white p-5 hover:border-ink/30">
              <p className="font-semibold">{name}</p>
              <p className="mt-1 text-[14px] text-ink/60">{desc}</p>
              <p className="mt-2 break-all text-[13px] text-canada-dark underline underline-offset-2">{url}</p>
            </a>
          ))}
        </div>

        <h3 className="mt-10 text-[20px] font-semibold">{t.methodology.joins}</h3>
        <ul className="mt-4 max-w-[820px] space-y-3">
          {t.methodology.joinItems.map((item) => (
            <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-ink/75">
              <span className="mt-2 inline-block h-2 w-2 shrink-0 rounded-full bg-ink/40" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h3 className="mt-10 text-[20px] font-semibold">{t.methodology.revenue}</h3>
        <ul className="mt-4 max-w-[820px] space-y-3">
          {t.methodology.revenueItems.map((item) => (
            <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-ink/75">
              <span className="mt-2 inline-block h-2 w-2 shrink-0 rounded-full bg-ink/40" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h3 className="mt-10 text-[20px] font-semibold">{t.methodology.leftout}</h3>
        <ul className="mt-4 max-w-[820px] space-y-3">
          {t.methodology.leftoutItems.map((item) => (
            <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-ink/75">
              <span className="mt-2 inline-block h-2 w-2 shrink-0 rounded-full bg-ink/40" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className="mt-10 max-w-[820px] rounded-xl border border-line bg-white px-5 py-4 text-[14px] text-ink/60">
          {t.methodology.vintage}
        </p>
      </div>
    </section>
  );
}

function Developers() {
  const { t } = useLang();
  const origin = "https://cameras.canada.nshipyard.com";
  return (
    <section id="developers" className="border-t border-line">
      <div className="mx-auto max-w-[1392px] px-6 py-16">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-canada">{t.developers.kicker}</p>
        <h2 className="display mt-3 text-[36px] md:text-[48px]">{t.developers.title}</h2>
        <p className="mt-4 max-w-[720px] text-[16px] text-ink/70">{t.developers.body}</p>
        <h3 className="mt-10 text-[20px] font-semibold">{t.developers.apiTitle}</h3>
        <div className="mt-4 overflow-hidden rounded-2xl border border-line">
          {t.developers.endpoints.map(([ep, desc], i) => (
            <div key={ep} className={`flex flex-col gap-1 px-5 py-4 md:flex-row md:items-baseline md:gap-6 ${i % 2 ? "bg-muted/50" : "bg-white"}`}>
              <code className="shrink-0 font-mono text-[14px] font-semibold text-canada-dark">{ep}</code>
              <span className="text-[14px] text-ink/65">{desc}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={`${origin}/api/v1/summary`} className="rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-white hover:bg-canada-dark">
            {t.developers.tryIt}: /api/v1/summary
          </a>
          <a href={`${origin}/api/openapi.json`} className="rounded-full border border-line px-5 py-2.5 text-[14px] font-medium hover:border-ink/40">
            /api/openapi.json
          </a>
        </div>
      </div>
    </section>
  );
}

function DataSection() {
  const { t } = useLang();
  return (
    <section id="data" className="border-t border-line bg-paper-warm">
      <div className="mx-auto max-w-[1392px] px-6 py-16">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-canada">{t.data.kicker}</p>
        <h2 className="display mt-3 text-[36px] md:text-[48px]">{t.data.title}</h2>
        <p className="mt-4 max-w-[720px] text-[16px] text-ink/70">{t.data.body}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {t.data.files.map(([file, desc]) => (
            <div key={file} className="rounded-2xl border border-line bg-white p-6">
              <code className="font-mono text-[15px] font-semibold">{file}</code>
              <p className="mt-2 text-[14px] leading-relaxed text-ink/60">{desc}</p>
              <a
                href={`/data/${file}`}
                download
                className="mt-4 inline-block rounded-full bg-ink px-5 py-2 text-[14px] font-medium text-white hover:bg-canada-dark"
              >
                {t.data.download}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  const [ase, setAse] = useState<AseSite[]>([]);
  const [rlc, setRlc] = useState<Intersection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const [a, r] = await Promise.all([
          fetch("/data/ase_sites.json").then((x) => x.json()),
          fetch("/data/redlight.json").then((x) => x.json()),
        ]);
        if (live) {
          setAse(a);
          setRlc(r);
        }
      } catch {
        /* data stays empty; tables show no results */
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  return (
    <div id="top">
      <Banner />
      <Nav />
      <main>
        <Hero />
        <Stats />
        {loading ? (
          <div className="mx-auto max-w-[1392px] px-6 py-24 text-center text-ink/50">…</div>
        ) : (
          <>
            <MapSection ase={ase} rlc={rlc} />
            <ExplorerSection ase={ase} rlc={rlc} />
          </>
        )}
        <Caveats />
        <Methodology />
        <Developers />
        <DataSection />
      </main>
      <Footer />
    </div>
  );
}
