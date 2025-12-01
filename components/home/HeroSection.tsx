"use client";

import { useState } from "react";
import Link from "next/link";

export default function HeroSection() {
  const [coords, setCoords] = useState({ x: 50, y: 50 });

  return (
    <section
      className="hero-shell relative overflow-hidden rounded-3xl border border-[#0f766e]/15 bg-white/95 p-8 shadow-lg"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        setCoords({ x, y });
      }}
      onMouseLeave={() => setCoords({ x: 50, y: 50 })}
      style={
        {
          "--mouse-x": `${coords.x}%`,
          "--mouse-y": `${coords.y}%`,
        } as React.CSSProperties
      }
    >
      <div className="interactive-spotlight" />
      <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-[#0f172a] md:text-5xl">
            <span className="text-gradient">EnerTech Lab</span>
          </h1>
          <p className="text-base leading-relaxed text-slate-600 md:text-lg">
            EnerTech Lab は、暮らしの電気代からスマホ・PC・データセンター、そして次世代デバイス技術まで、
            “エネルギー効率”を軸にテクノロジーの仕組みをわかりやすく解説する技術メディアです。
            日常の疑問を物理の視点でひも解きながら、AIやコンピューティングの裏側で起きている
            「電力と効率の話」を自然に理解できる形でお届けします。
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/categories/lifestyle-energy"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-6 py-3 text-sm font-bold text-white shadow hover:bg-[#0d625b]"
            >
              電気代を安くする方法を知る
            </Link>
            
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-6 text-sm text-slate-600">
          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Coverage
            </p>
            <ul className="mt-2 space-y-1 text-slate-600">
              <li>・暖房・家電・電気代のしくみ</li>
              <li>・断熱・空調・住宅とエネルギー</li>
              <li>・スマホ・PC・AIモデルの電力問題</li>
              <li>・データセンター・GPUの効率</li>
              <li>・次世代デバイス</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
