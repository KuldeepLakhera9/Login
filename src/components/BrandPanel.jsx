import React, { useEffect, useState } from 'react';
import { Terminal, Shield, Zap, RefreshCw, Activity } from 'lucide-react';

export function BrandPanel() {
  const [buildStep, setBuildStep] = useState(0);
  const [tick, setTick] = useState(0);

  const steps = [
    { text: 'git commit -m "feat: auth flow"', type: 'cmd' },
    { text: '✔ Fetching commit data...', type: 'ok' },
    { text: '✔ Building production assets...', type: 'ok' },
    { text: '✔ Bundling client bundle (1.4MB)...', type: 'ok' },
    { text: '✔ Deploying to global edge network...', type: 'ok' },
    { text: '✔ Active on https://nexoraa.app', type: 'done' },
  ];

  const stats = [
    { label: 'Uptime', value: '99.99%', color: 'text-emerald-400' },
    { label: 'Latency', value: '12ms', color: 'text-sky-400' },
    { label: 'Regions', value: '24', color: 'text-violet-400' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setBuildStep((prev) => (prev < steps.length - 1 ? prev + 1 : 0));
      setTick((t) => t + 1);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="relative w-full h-full min-h-[420px] flex flex-col justify-between p-8 md:p-10 overflow-hidden rounded-3xl md:rounded-r-none select-none"
      style={{
        backgroundImage: 'url(/brand-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/50 to-slate-950/80 rounded-3xl md:rounded-r-none" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,0.6) 1px, transparent 1px),
            linear-gradient(to right, rgba(99,102,241,0.6) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Glow orb top right */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-indigo-500/20 blur-[80px] animate-pulse-slow pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-violet-500/15 blur-[70px] animate-pulse-slow pointer-events-none" style={{ animationDelay: '3s' }} />

      {/* Floating micro dots */}
      <div className="absolute top-[28%] right-[22%] w-1.5 h-1.5 rounded-full bg-sky-400/60 blur-[0.5px] animate-float pointer-events-none" />
      <div className="absolute bottom-[35%] left-[18%] w-2 h-2 rounded-full bg-violet-400/50 blur-[1px] animate-float pointer-events-none" style={{ animationDelay: '1.8s' }} />
      <div className="absolute top-[55%] left-[42%] w-1 h-1 rounded-full bg-indigo-300/60 animate-float pointer-events-none" style={{ animationDelay: '3.5s' }} />

      {/* ── HEADER: Logo ── */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/40 ring-1 ring-white/20">
          <Zap className="w-5 h-5 text-white drop-shadow" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black font-display tracking-wider text-white leading-none">
            Nexoraa
          </span>
          <span className="text-[10px] font-semibold text-indigo-300/80 tracking-widest uppercase mt-0.5">
            Edge Platform
          </span>
        </div>
      </div>

      {/* ── MIDDLE: Copy ── */}
      <div className="relative z-10 flex flex-col gap-5 max-w-sm my-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/25 backdrop-blur-sm w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-indigo-200 tracking-widest uppercase">All Systems Operational</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-black font-display leading-[1.08] text-left text-white tracking-tight">
          Where speed{' '}
          <span
            className="text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #818cf8, #a78bfa, #67e8f9)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
            }}
          >
            meets reliability
          </span>
        </h1>

        <p className="text-sm text-slate-300/80 text-left font-light leading-relaxed">
          Deploy and scale your frontend applications instantly on our optimized edge network. Zero config, fully automated pipelines, maximum compliance.
        </p>

        {/* Stat pills */}
        <div className="flex gap-3 flex-wrap">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col px-3 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <span className={`text-base font-black font-display ${s.color}`}>{s.value}</span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM: Terminal Mockup ── */}
      <div className="relative z-10 w-full max-w-sm animate-float">
        <div
          className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          style={{ background: 'rgba(10, 12, 28, 0.75)', backdropFilter: 'blur(20px)' }}
        >
          {/* Title bar */}
          <div className="flex justify-between items-center px-4 py-2.5 border-b border-white/8 bg-slate-950/40">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/90" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/90" />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
              <Terminal className="w-3 h-3" />
              <span>bash — nexoraa-cli</span>
            </div>
            <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          </div>

          {/* Body */}
          <div className="p-4 font-mono text-left text-[11px] leading-relaxed min-h-[140px]">
            <div className="text-slate-500 mb-2 flex items-center gap-1">
              <span className="text-indigo-400">›</span>
              <span>nexoraa deploy --prod</span>
            </div>
            {steps.map((step, idx) => {
              if (idx > buildStep) return null;
              const isCurrent = idx === buildStep;
              let cls = 'text-slate-400';
              if (step.type === 'done') cls = 'text-emerald-400 font-semibold';
              else if (isCurrent) cls = 'text-indigo-300 font-medium';
              return (
                <div key={idx} className={`flex items-center gap-2 mb-1 transition-all duration-300 ${cls}`}>
                  {isCurrent && step.type !== 'done' && (
                    <RefreshCw className="w-2.5 h-2.5 animate-spin shrink-0 text-indigo-400" />
                  )}
                  <span>{step.text}</span>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center px-4 py-2.5 border-t border-white/8 bg-slate-950/30 text-[10px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-indigo-400" />
              <span>TLS 1.3 · Zero-Trust</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Response: <strong className="text-slate-300">12ms</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
