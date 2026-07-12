"use client";
export default function Stories() {
  const stories = [
    {
      shop: "Sunrise Body Shop",
      location: "Austin, TX",
      quote: "InGarage cut our administrative time by 40%. We now focus entirely on the vehicles rather than fighting with paperwork.",
      author: "Michael T., Owner",
      metric: "-40% Admin Time"
    },
    {
      shop: "Elite Collision Center",
      location: "Denver, CO",
      quote: "The direct-to-merchant invoicing allowed us to get paid instantly. No more waiting 30 days for insurance checks.",
      author: "Sarah L., Finance Manager",
      metric: "Instant Payouts"
    },
    {
      shop: "Westside Auto Repair",
      location: "Seattle, WA",
      quote: "Finally, a platform that doesn't look like it was built in 1995. My technicians actually enjoy using it on their tablets.",
      author: "David H., Lead Tech",
      metric: "100% Adoption"
    }
  ];

  return (
    <div className="w-full min-h-[100dvh] bg-transparent pt-24 px-6 pb-24 font-sans text-zinc-50 overflow-hidden relative z-10">
      <div className="max-w-6xl w-full mx-auto relative z-10">
        
        {/* Photo-backed Hero Section */}
        <div className="relative w-full h-[500px] rounded-[3rem] overflow-hidden mb-24 shadow-2xl border border-zinc-800">
          <img src="/owner.png" alt="Shop Owner" className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale mix-blend-luminosity hover:mix-blend-normal hover:grayscale-0 transition-all duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/60 to-transparent mix-blend-multiply pointer-events-none" />
          
          <div className="absolute bottom-12 left-12 right-12 z-10">
            <p className="text-brand-400 font-bold uppercase tracking-widest text-sm mb-4">Customer Success</p>
            <h1 className="text-4xl md:text-6xl font-bold text-zinc-50 tracking-tighter mb-4 font-serif text-balance leading-tight">
              Built for modern shops.
            </h1>
            <p className="text-zinc-300 max-w-2xl text-lg leading-relaxed">
              See how top collision centers and independent repair shops are transforming their operations and cycle times with InGarage.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden group hover:border-brand-500/50 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-brand-500/10 transition-colors" />
              
              <div className="mb-6 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-zinc-100 font-['Outfit']">{story.shop}</h3>
                  <p className="text-sm text-zinc-500">{story.location}</p>
                </div>
                <div className="bg-brand-500/10 text-brand-400 text-xs font-bold px-3 py-1 rounded-full border border-brand-500/20">
                  {story.metric}
                </div>
              </div>

              <blockquote className="text-zinc-300 text-lg mb-8 leading-relaxed">
                "{story.quote}"
              </blockquote>

              <div className="flex items-center gap-4 mt-auto">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold">
                  {story.author.charAt(0)}
                </div>
                <p className="text-sm font-bold text-zinc-400">{story.author}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
