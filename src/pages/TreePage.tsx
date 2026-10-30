import TreeCanvas from '../components/tree/TreeCanvas';
import TreeToolbar from '../components/tree/TreeToolbar';
import PersonSidePanel from '../components/tree/PersonSidePanel';
import AddPersonModal from '../components/tree/AddPersonModal';
import AddRelationshipModal from '../components/tree/AddRelationshipModal';
import OnboardingTour from '../components/tree/OnboardingTour';
import SmartFilterPanel from '../components/tree/SmartFilterPanel';
import { useTreeStore } from '../store/treeStore';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AvatarImage from '../components/ui/AvatarImage';
import { useTreeSocket } from '../lib/socket';
import { useEffect } from 'react';

import ListView from '../components/tree/ListView';
import MapView from '../components/tree/MapView';

export default function TreePage() {
  const store = useTreeStore();
  const { id } = useParams();

  useTreeSocket(id || null);

  useEffect(() => {
    if (id) {
      store.fetchTreeData(id);
      store.closeSidePanel();
    }
  }, [id]);
  
  const currentTree = store.trees.find(t => t.id === store.treeId);
  const treeName = currentTree?.name || 'My Family Tree';
  const personCount = store.persons.length;

  return (
    <div className="flex flex-col w-full h-screen bg-[#1a1a2e] text-slate-100 font-sans overflow-hidden select-none relative">
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-[#1a1a2e]/80 backdrop-blur-md z-50 fixed top-0 w-full">
        <div className="flex items-center gap-4 flex-1">
          <Link to="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors mr-2">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </Link>
          <div className="hidden md:block text-xl font-bold text-white tracking-wide">
            MyKhandan<span className="text-[#e76f2f]">.pk</span>
          </div>
        </div>
        
        <div className="flex-1 flex justify-center text-center">
          <div>
            <h1 className="font-bold text-lg md:text-xl leading-tight text-white">{treeName}</h1>
            <p className="text-xs text-slate-400 hidden md:block">{personCount} {personCount === 1 ? 'person' : 'people'} • Last edited recently</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-1 justify-end">
           <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
             Print Chart
           </button>
        </div>
      </header>

      <div className="flex-1 mt-16 relative overflow-hidden flex flex-col w-full">
        <TreeToolbar />
        <div id="tree-canvas" className="relative flex-1 flex overflow-hidden">
          <SmartFilterPanel />
          <div className={`transition-all duration-300 flex-1 relative ${store.sidePanelOpen ? 'md:mr-[400px]' : ''}`}>
            {store.viewMode === 'list' && <ListView />}
            {store.viewMode === 'map' && <MapView />}
            {store.viewMode === 'tree' && <TreeCanvas />}
          </div>
          <div id="side-panel">
            <PersonSidePanel />
          </div>
        </div>
      </div>
      
      <AddPersonModal />
      <AddRelationshipModal />
      <OnboardingTour treeId={id || 'new-tree'} />
    </div>
  );
}
