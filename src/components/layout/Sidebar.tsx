
export default function Sidebar() {
  return (
    <aside className="w-80 border-l border-white/5 bg-[#1a1a2e]/60 backdrop-blur-xl z-40 flex flex-col">
      <div className="p-6">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#e76f2f] to-orange-400 mb-4 shadow-xl shadow-[#e76f2f]/10 mx-auto"></div>
        <h2 className="text-xl font-bold text-center text-white">William Harrison</h2>
        <p className="text-sm text-[#e76f2f] text-center mb-6">Patriarch (Great-Grandfather)</p>
        
        <div className="space-y-6">
          <section>
            <h3 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-3">About</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Born in London during the peak of the Industrial Revolution. Emigrated to New York in 1868. Worked as a master shipwright in the Brooklyn Navy Yard.
            </p>
          </section>
        </div>
      </div>
      <div className="mt-auto p-6 border-t border-white/5">
        <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-medium transition-colors">View Full Profile</button>
      </div>
    </aside>
  );
}
