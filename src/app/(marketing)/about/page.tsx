"use client";
import { CarFront, ShieldCheck } from 'lucide-react';

export default function About() {
  return (
    <div className="w-full relative py-32 px-6 bg-transparent text-zinc-50 z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-950/30 border border-brand-900/50 text-sm font-medium text-brand-500 mb-8 shadow-sm">
            <CarFront size={16} />
            Our Story
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-12 font-serif text-balance leading-tight">
            Built by collision experts,<br/>for collision experts.
          </h1>
        </div>

        <div className="relative w-full h-[400px] md:h-[600px] rounded-[3rem] overflow-hidden mb-16 shadow-2xl border border-zinc-800">
          <img src="/floor.png" alt="Collision center floor" className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="max-w-3xl mx-auto prose prose-lg prose-invert prose-zinc text-zinc-400 space-y-8 bg-zinc-900/40 p-8 md:p-16 rounded-[3rem] border border-zinc-800/60 shadow-xl backdrop-blur-sm">
          <p className="text-xl md:text-2xl leading-relaxed font-serif text-zinc-100 font-medium text-balance">
            For decades, the collision repair industry has been held hostage by clunky, monopolistic legacy software. Software that takes hours to learn, crashes constantly, and makes a simple parts order feel like a chore.
          </p>
          <p>
            We realized that while mechanical repair shops were getting modern, cloud-based, beautifully designed tools, auto body shops were left behind. The unique complexities of collision repair—insurance DRPs, supplements, flag hours, and multi-stage production—were deemed "too hard" to build for by modern startups.
          </p>
          <p>
            <strong>So we built it ourselves.</strong>
          </p>
          <p>
            InGarage is the modern operating system for the independent body shop. We believe that shop owners shouldn't have to maintain expensive on-premise servers. We believe that your production board should be visual, real-time, and accessible from your phone.
          </p>
          
          <div className="bg-zinc-950 p-8 rounded-2xl border border-zinc-800 my-10">
            <h3 className="text-xl font-bold text-zinc-50 flex items-center gap-2 mb-4">
              <ShieldCheck className="text-brand-600" />
              Our Promise
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-500" />
                Never trap your data. You own your shop's data.
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-500" />
                No hidden setup fees or forced hardware purchases.
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-500" />
                Continuous, free cloud updates. No installation required.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
