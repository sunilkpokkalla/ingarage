import { CarFront, ShieldCheck } from 'lucide-react';

export default function About() {
  return (
    <div className="w-full relative py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-medium text-brand-600 mb-8 shadow-sm">
            <CarFront size={16} />
            Our Story
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-zinc-50 tracking-tight mb-6">
            Built by collision experts, for collision experts.
          </h1>
        </div>

        <div className="prose prose-lg prose-slate max-w-none text-zinc-400 space-y-8 bg-zinc-900 p-12 rounded-3xl border border-zinc-800 shadow-sm">
          <p className="text-xl leading-relaxed font-medium text-zinc-50">
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
