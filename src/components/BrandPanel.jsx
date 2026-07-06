import React, { useEffect, useState } from 'react';
import { Terminal, Shield, Zap, RefreshCw } from 'lucide-react';

export function BrandPanel() {
  const [buildStep, setBuildStep] = useState(0);
  const steps = [
    { text: 'git commit -m "feat: login flow"', done: true },
    { text: '✔ Fetching commit data...', done: true },
    { text: '✔ Building production assets...', done: false },
    { text: '✔ Bundling client bundle (1.4MB)...', done: false },
    { text: '✔ Optimizing edge middleware routes...', done: false },
    { text: '✔ Deploying to global edge network...', done: false },
    { text: '✔ Done! Active on https://nexoraa.com', done: false, active: true },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setBuildStep((prev) => (prev < steps.length - 1 ? prev + 1 : 0));
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[400px] flex flex-col justify-between p-8 md:p-12 overflow-hidden bg-slate-900 text-white rounded-3xl md:rounded-r-none select-none">
      {/* Background Glowing Aurora Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[80px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-500/10 blur-[80px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        {/* Floating small particles */}
        <div className="absolute top-[20%] right-[30%] w-2 h-2 rounded-full bg-indigo-400/40 blur-[1px] animate-float"></div>
        <div className="absolute bottom-[30%] left-[20%] w-3 h-3 rounded-full bg-violet-400/30 blur-[1px] animate-float" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-[60%] left-[40%] w-1.5 h-1.5 rounded-full bg-indigo-300/40 blur-[0.5px] animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Header: Logo and Title */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold font-display tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
          Nexoraa
        </span>
      </div>

      {/* Middle: Brand Copy */}
      <div className="relative z-10 flex flex-col gap-4 max-w-md my-auto">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-display leading-[1.1] text-left text-slate-100 tracking-tight">
          Where speed meets{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-indigo-300 to-violet-400">
            reliability
          </span>
        </h1>
        <p className="text-sm md:text-base text-slate-400 text-left font-light leading-relaxed">
          Deploy and scale your frontend applications instantly on our optimized edge network. Zero config, fully automated pipelines, maximum compliance.
        </p>
      </div>

      {/* Bottom: Mock Terminal Mockup (Visual) */}
      <div className="relative z-10 w-full mt-6 max-w-md animate-float">
        <div className="glass-panel border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
          {/* Terminal Title Bar */}
          <div className="flex justify-between items-center px-4 py-3 bg-slate-950/40 border-b border-white/5">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
              <Terminal className="w-3 h-3" />
              <span>bash - nexoraa-cli</span>
            </div>
            <div className="w-6"></div>
          </div>

          {/* Terminal Body */}
          <div className="p-4 font-mono text-left text-[11px] leading-relaxed min-h-[160px] bg-slate-950/20">
            <div className="text-slate-500 mb-1.5">$ nexoraa deploy --prod</div>
            {steps.map((step, idx) => {
              if (idx > buildStep) return null;
              
              const isCurrent = idx === buildStep;
              let textColor = 'text-slate-400';
              if (step.active) textColor = 'text-emerald-400 font-semibold';
              else if (isCurrent && !step.active) textColor = 'text-indigo-400 font-semibold';

              return (
                <div key={idx} className={`flex items-center gap-2 mb-1 ${textColor}`}>
                  {isCurrent && !step.active && (
                    <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
                  )}
                  <span>{step.text}</span>
                </div>
              );
            })}
          </div>

          {/* Dashboard Info Footer inside mockup */}
          <div className="flex justify-between items-center px-4 py-3 bg-slate-950/40 border-t border-white/5 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>TLS Enforced</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Response: <strong className="text-slate-200">12ms</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
