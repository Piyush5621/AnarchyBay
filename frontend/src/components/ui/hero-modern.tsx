import React, { useEffect, useMemo, useRef, useState } from "react";

const STYLE_ID = "hero3-animations";

const getRootTheme = () => {
  if (typeof document === "undefined") {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  }

  const root = document.documentElement;
  if (root.classList.contains("dark")) return "dark";
  if (root.getAttribute("data-theme") === "dark" || root.dataset?.theme === "dark") return "dark";
  if (root.classList.contains("light")) return "light";

  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return "light";
};

const useThemeSync = () => {
  const [theme, setTheme] = useState(() => getRootTheme());

  useEffect(() => {
    if (typeof document === "undefined") return;

    const sync = () => {
      const next = getRootTheme();
      setTheme((prev) => (prev === next ? prev : next));
    };

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    const media =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;

    const onMedia = () => sync();
    media?.addEventListener("change", onMedia);

    const onStorage = (event: StorageEvent) => {
      if (event.key === "hero-theme" || event.key === "bento-theme") sync();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
    }

    return () => {
      observer.disconnect();
      media?.removeEventListener("change", onMedia);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", onStorage);
      }
    };
  }, []);

  return [theme, setTheme] as const;
};

const DeckGlyph = ({ theme = "dark" }) => {
  const stroke = theme === "dark" ? "#111111" : "#111111";
  const fill = theme === "dark" ? "rgba(17,17,17,0.08)" : "rgba(17,17,17,0.08)";

  return (
    <svg viewBox="0 0 120 120" className="h-16 w-16" aria-hidden>
      <circle
        cx="60"
        cy="60"
        r="46"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        className="motion-safe:animate-[hero3-orbit_8.5s_linear_infinite] motion-reduce:animate-none"
        style={{ strokeDasharray: "18 14" }}
      />
      <rect
        x="34"
        y="34"
        width="52"
        height="52"
        rx="0"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        className="motion-safe:animate-[hero3-grid_5.4s_ease-in-out_infinite] motion-reduce:animate-none"
      />
      <circle cx="60" cy="60" r="7" fill={stroke} />
      <path
        d="M60 30v10M60 80v10M30 60h10M80 60h10"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="square"
        className="motion-safe:animate-[hero3-pulse_6s_ease-in-out_infinite] motion-reduce:animate-none"
      />
    </svg>
  );
};

export function HeroOrbitDeck() {
  const [theme] = useThemeSync();
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"strategy" | "execution">("strategy");
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.innerHTML = `
      @keyframes hero3-intro {
        0% { opacity: 0; transform: translate3d(0, 64px, 0) scale(0.98); filter: blur(12px); }
        60% { filter: blur(0); }
        100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); filter: blur(0); }
      }
      @keyframes hero3-card {
        0% { opacity: 0; transform: translate3d(0, 32px, 0) scale(0.95); }
        100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
      }
      @keyframes hero3-orbit {
        0% { stroke-dashoffset: 0; transform: rotate(0deg); }
        100% { stroke-dashoffset: -64; transform: rotate(360deg); }
      }
      @keyframes hero3-grid {
        0%, 100% { transform: rotate(-4deg); opacity: 0.8; }
        50% { transform: rotate(4deg); opacity: 1; }
      }
      @keyframes hero3-pulse {
        0%, 100% { stroke-dasharray: 0 200; opacity: 0.3; }
        45%, 60% { stroke-dasharray: 200 0; opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  useEffect(() => {
    if (!sectionRef.current || typeof window === "undefined") {
      setVisible(true);
      return;
    }

    const node = sectionRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const palette = useMemo(
    () => ({
      surface: "bg-white text-black",
      subtle: "text-black/70",
      border: "border-black border-2",
      card: "bg-white border-black border-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
      accent: "bg-white",
      background: {
        color: "#ffffff",
        dots: "radial-gradient(circle at 25% 25%, rgba(0,0,0,0.1) 1px, transparent 1px)",
      },
    }),
    []
  );

  const metrics = [
    { label: "Idea Volume", value: "2.4k" },
    { label: "Active Shelves", value: "840" },
    { label: "Sync Speed", value: "0.2s" },
  ];

  const modes = useMemo(
    () => ({
      strategy: {
        title: "The BitShelf Way",
        description:
          "Start small and scale fast. Frame your digital library with clarity and keep your knowledge organized in bits.",
        items: [
          "Start Small",
          "Work Consistently",
          "Adapt and Improve",
        ],
      },
      execution: {
        title: "Knowledge Loop",
        description:
          "Iterate often and get feedback. Build your shelf with response telemetry visible and minimal friction.",
        items: [
          "Get Feedback",
          "Iterate Often",
          "Knowledge Sharing",
        ],
      },
    }),
    []
  );

  const activeMode = modes[mode];

  const protocols = [
    {
      name: "Bit Intake",
      detail: "Audit your thoughts, define your capture cadence, and ingest context.",
      status: "Ready",
      color: "bg-cyan-300"
    },
    {
      name: "Shelf Sync",
      detail: "Cross-platform sync, assign categories, and prime your library.",
      status: "Active",
      color: "bg-yellow-300"
    },
    {
      name: "Knowledge Launch",
      detail: "Verify your insights, activate sharing, and monitor stability.",
      status: "Live",
      color: "bg-green-400"
    },
  ];

  const setSpotlight = (event: React.MouseEvent<HTMLLIElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--hero3-x", `${event.clientX - rect.left}px`);
    target.style.setProperty("--hero3-y", `${event.clientY - rect.top}px`);
  };

  const clearSpotlight = (event: React.MouseEvent<HTMLLIElement>) => {
    const target = event.currentTarget;
    target.style.removeProperty("--hero3-x");
    target.style.removeProperty("--hero3-y");
  };

  const showcaseImage = {
    src: "/howworks.png",
    alt: "BitShelf Process",
  };

  return (
    <div className={`relative isolate min-h-screen w-full transition-colors duration-700 ${palette.surface}`}>
      <div
        className="pointer-events-none absolute inset-0 -z-30"
        style={{
          backgroundColor: palette.background.color,
          backgroundImage: palette.background.dots,
          backgroundSize: "24px 24px",
          backgroundRepeat: "repeat",
        }}
      />

      <section
        ref={sectionRef}
        className={`relative flex min-h-screen w-full flex-col gap-16 px-6 py-24 transition-opacity duration-700 md:gap-20 md:px-10 lg:px-16 xl:px-24 ${
          visible ? "motion-safe:animate-[hero3-intro_1s_cubic-bezier(.22,.68,0,1)_forwards]" : "opacity-0"
        }`}
      >
          <header className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] lg:items-end">
            <div className="space-y-8">
              <div className="flex flex-wrap items-center gap-4">
                <span className={`inline-flex items-center gap-2 rounded-none border-2 border-black px-4 py-1.5 md:px-6 md:py-2 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}>
                  BitShelf Deck
                </span>
              </div>
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight uppercase italic">
                  All those <span className="text-pink-500">great ideas</span>, <br/> stored in one place.
                </h1>
                <p className={`max-w-2xl text-base md:text-xl lg:text-2xl font-bold leading-tight ${palette.subtle}`}>
                  BitShelf is your command deck for absolute knowledge. Build your system and frame your legacy with discipline.
                </p>
              </div>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between lg:justify-start lg:gap-12">
                <div className={`inline-flex items-center gap-4 rounded-none border-2 border-black px-5 py-3 md:px-6 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] transition bg-green-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
                    System Live
                  </span>
                  <span className="opacity-40">∙</span>
                  <span className="whitespace-nowrap">Ideas Synchronized</span>
                </div>
                <div className={`grid grid-cols-3 divide-x-2 divide-black overflow-hidden rounded-none border-2 border-black text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.35em] bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}>
                  {metrics.map((metric) => (
                    <div key={metric.label} className="flex flex-col px-3 py-2 md:px-6 md:py-4 text-black text-center sm:text-left">
                      <span className={`opacity-60 text-[8px] md:text-[10px]`}>{metric.label}</span>
                      <span className="text-sm md:text-xl font-black tracking-tight">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`relative flex flex-col gap-6 md:gap-8 rounded-none border-2 p-6 md:p-10 transition ${palette.card}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-[0.4em] text-pink-600">Active Mode</p>
                <h2 className="text-3xl font-black tracking-tight uppercase leading-none">{activeMode.title}</h2>
              </div>
              <div className="p-2 bg-neutral-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <DeckGlyph />
              </div>
            </div>
            <p className={`text-base leading-relaxed font-bold ${palette.subtle}`}>{activeMode.description}</p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setMode("strategy")}
                className={`flex-1 rounded-none border-2 border-black px-6 py-3 text-xs font-black uppercase tracking-[0.4em] transition ${
                  mode === "strategy" ? "bg-black text-white" : "bg-white text-black hover:bg-neutral-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                }`}
              >
                Strategy
              </button>
              <button
                type="button"
                onClick={() => setMode("execution")}
                className={`flex-1 rounded-none border-2 border-black px-6 py-3 text-xs font-black uppercase tracking-[0.4em] transition ${
                  mode === "execution" ? "bg-black text-white" : "bg-white text-black hover:bg-neutral-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                }`}
              >
                Execution
              </button>
            </div>
            <ul className="grid grid-cols-1 gap-3 text-sm">
              {activeMode.items.map((item) => (
                <li key={item} className={`flex items-center gap-4 font-black p-3 bg-neutral-50 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`}>
                  <span className="h-3 w-3 bg-pink-500 border border-black" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </header>

        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className={`flex flex-col gap-10 rounded-none border-2 p-12 transition ${palette.card}`}>
            <div className="space-y-6">
              <header className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] text-blue-600">Control stack</h3>
                  <p className="text-2xl font-black uppercase tracking-tight">System Architecture</p>
                </div>
                <span className="text-xs font-black uppercase tracking-[0.4em] opacity-40">v3.0</span>
              </header>
              <p className={`text-xl leading-snug font-bold ${palette.subtle}`}>
                Designed for BitShelf where clarity outruns chaos. Craft your digital shelf that introduces the system and frames your knowledge with discipline.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="p-6 bg-pink-300 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-xs font-black uppercase mb-1">Status</p>
                    <p className="text-lg font-black uppercase italic">Ready</p>
                 </div>
                 <div className="p-6 bg-yellow-300 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-xs font-black uppercase mb-1">Uptime</p>
                    <p className="text-lg font-black uppercase italic">99.9%</p>
                 </div>
              </div>
              <div className="space-y-4">
                {["Parity Guaranteed", "Neutral Hues", "Neo-Brutalism"].map((item, idx) => (
                  <div key={item} className={`relative overflow-hidden rounded-none border-2 border-black px-8 py-5 text-sm font-black uppercase tracking-[0.4em] transition duration-500 hover:-translate-y-1 ${idx % 3 === 0 ? 'bg-pink-300' : idx % 3 === 1 ? 'bg-yellow-300' : 'bg-cyan-300'} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <figure className="overflow-hidden rounded-none border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white">
              <div className="relative w-full aspect-video">
                <img
                  src={showcaseImage.src}
                  alt={showcaseImage.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-contain p-8 grayscale-0"
                />
              </div>
              <figcaption className="flex items-center justify-between px-8 py-6 text-xs font-black uppercase tracking-[0.4em] border-t-4 border-black bg-neutral-50">
                <span>Core Interface</span>
                <span className="flex items-center gap-3">
                  <span className="h-1.5 w-12 bg-black" />
                  BitShelf v1
                </span>
              </figcaption>
            </figure>

            <div className="grid gap-6">
               {protocols.map((protocol) => (
                  <div key={protocol.name} className={`flex items-center justify-between p-6 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${protocol.color}`}>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-[0.3em]">{protocol.name}</h4>
                      <p className="text-xs font-bold text-black/60">{protocol.detail}</p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] px-3 py-1 border-2 border-black bg-white">{protocol.status}</span>
                  </div>
               ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HeroOrbitDeck;
