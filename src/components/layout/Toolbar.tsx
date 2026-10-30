
import { Plus, GitBranch, Shield, Inbox, Settings } from 'lucide-react';

export default function Toolbar() {
  return (
    <aside className="w-16 flex flex-col items-center py-6 gap-6 border-r border-white/5 z-40 bg-[#1a1a2e]">
      <div className="p-3 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer text-slate-300">
        <Plus className="w-6 h-6" />
      </div>
      <div className="p-3 bg-[#e76f2f]/20 text-[#e76f2f] rounded-xl cursor-pointer border border-[#e76f2f]/30">
        <GitBranch className="w-6 h-6" />
      </div>
      <div className="p-3 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer text-slate-300">
        <Shield className="w-6 h-6" />
      </div>
      <div className="p-3 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer text-slate-300">
        <Inbox className="w-6 h-6" />
      </div>
      <div className="mt-auto p-3 text-slate-500 cursor-pointer">
        <Settings className="w-6 h-6" />
      </div>
    </aside>
  );
}
