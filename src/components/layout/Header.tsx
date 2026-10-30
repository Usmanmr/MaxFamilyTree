
import { Search, Bell, Users, Plus, LayoutGrid, Settings, HelpCircle, Share2, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-[#1a1a2e]/80 backdrop-blur-md z-50">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-[#e76f2f] rounded-lg flex items-center justify-center shadow-lg shadow-[#e76f2f]/20">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight text-white">The Harrison Legacy</h1>
          <p className="text-xs text-slate-400">142 Members • Last modified 2 hours ago</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full border-2 border-[#1a1a2e] bg-slate-500 flex items-center justify-center text-[10px] text-white">JD</div>
          <div className="w-8 h-8 rounded-full border-2 border-[#1a1a2e] bg-[#e76f2f] flex items-center justify-center text-[10px] text-white">SH</div>
          <div className="w-8 h-8 rounded-full border-2 border-[#1a1a2e] bg-slate-700 flex items-center justify-center text-[10px] text-white">+3</div>
        </div>
        <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
        <button className="px-4 py-2 bg-[#e76f2f] hover:bg-[#cf5e25] text-white rounded-md text-sm font-medium transition-colors">Share Tree</button>
        <div className="w-10 h-10 rounded-full border border-white/20 bg-slate-800 flex items-center justify-center text-white">
          <User className="w-5 h-5" />
        </div>
      </div>
    </header>
  );
}
