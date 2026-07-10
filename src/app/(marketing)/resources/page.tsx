"use client";
import { BookOpen, FileVideo, Article, ArrowRight } from 'phosphor-react';
// Wait, phosphor-react might not be installed, we use @phosphor-icons/react. Let me fix the import.
import { BookOpen as BookOpenIcon, VideoCamera, FileText, ArrowRight as ArrowRightIcon } from '@phosphor-icons/react';

export default function Resources() {
  const articles = [
    {
      title: "How to Reduce Cycle Times by 20%",
      category: "Guide",
      readTime: "8 min read",
      description: "Learn the exact processes top shops use to eliminate bottlenecks and get cars back to customers faster.",
      icon: <FileText size={20} className="text-brand-400" />
    },
    {
      title: "Mastering Insurance Negotiations",
      category: "Video",
      readTime: "15 min watch",
      description: "A deep dive into writing supplements that get approved the first time without endless phone calls.",
      icon: <VideoCamera size={20} className="text-blue-400" />
    },
    {
      title: "Setting up Direct-to-Merchant Invoicing",
      category: "Documentation",
      readTime: "5 min read",
      description: "A step-by-step guide to configuring Stripe in your InGarage dashboard to get paid instantly.",
      icon: <BookOpenIcon size={20} className="text-emerald-400" />
    }
  ];

  return (
    <div className="w-full min-h-screen bg-zinc-950 flex flex-col items-center pt-32 px-6 pb-24">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-20">
          <p className="text-brand-500 font-bold uppercase tracking-widest text-sm mb-4">Knowledge Base</p>
          <h1 className="text-4xl md:text-6xl font-bold text-zinc-50 tracking-tighter mb-6 font-['Outfit']">
            Learn and grow.
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            Guides, best practices, and documentation for running a high-performance auto repair shop.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden group hover:border-brand-500/50 transition-all duration-300 flex flex-col cursor-pointer">
              <div className="h-48 bg-zinc-950 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-transparent z-0" />
                <div className="z-10 w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                  {article.icon}
                </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
                    {article.category}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">{article.readTime}</span>
                </div>
                
                <h3 className="text-xl font-bold text-zinc-100 font-['Outfit'] mb-3 group-hover:text-brand-400 transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-zinc-400 text-sm leading-relaxed mb-8 flex-1">
                  {article.description}
                </p>
                
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-100 group-hover:text-brand-400 transition-colors mt-auto">
                  Read article <ArrowRightIcon size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
