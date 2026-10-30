import { Outlet, Link, useLocation } from 'react-router-dom';
import { Network, Bell, LayoutDashboard, Settings as SettingsIcon } from 'lucide-react';
import AvatarImage from '../components/ui/AvatarImage';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const isTreeRoute = location.pathname.startsWith('/tree/');

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      {!isTreeRoute && (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#e76f2f] flex items-center justify-center shadow-sm">
              <Network className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-800 tracking-tight">FamilyTree</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link 
              to="/dashboard" 
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${location.pathname === '/dashboard' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> My Trees
            </Link>
            
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            
            <Link to="/notifications" className="p-2 text-slate-800 hover:text-[#e76f2f] hover:bg-slate-100 rounded-full transition-colors relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            </Link>
            
            <Link to="/settings" className="p-2 text-slate-800 hover:text-[#e76f2f] hover:bg-slate-100 rounded-full transition-colors">
              <SettingsIcon className="w-6 h-6" />
            </Link>
            
            <div className="ml-2">
              <AvatarImage name={user ? `${user.firstName} ${user.lastName}` : 'Guest'} size="sm" className="cursor-pointer hover:ring-2 hover:ring-[#e76f2f] hover:ring-offset-2 transition-all" />
            </div>
          </div>
        </header>
      )}

      <main className={`flex-1 flex flex-col ${isTreeRoute ? '' : 'overflow-y-auto'}`}>
        <Outlet />
      </main>
    </div>
  );
}
