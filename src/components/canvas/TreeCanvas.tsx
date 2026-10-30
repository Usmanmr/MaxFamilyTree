
export default function TreeCanvas() {
  return (
    <main className="flex-1 bg-[#151526] relative overflow-hidden">
      <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
      
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
        <path d="M400 240 L400 320 M400 320 L250 320 L250 380 M400 320 L550 320 L550 380" stroke="#e76f2f" strokeWidth="2" fill="none" strokeDasharray="4" />
      </svg>

      <div className="absolute top-[120px] left-[310px] w-[180px] p-4 bg-slate-900 border border-[#e76f2f] rounded-xl shadow-[0_0_20px_rgba(231,111,47,0.15)] text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden ring-2 ring-[#e76f2f]">
            <div className="w-full h-full bg-gradient-to-br from-slate-400 to-slate-600"></div>
          </div>
          <div>
            <p className="font-bold text-sm">William Harrison</p>
            <p className="text-[10px] text-slate-400 italic">1845 — 1912</p>
          </div>
        </div>
      </div>
    </main>
  );
}
