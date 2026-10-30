import { ArrowLeft, Lock, Download, Plus, Settings, Menu, X, Filter } from 'lucide-react';
import { useTreeStore } from '../../store/treeStore';
import { applyHierarchicalLayout, applyRadialLayout } from './TreeLayoutEngine';
import { useState } from 'react';

export default function TreeToolbar() {
  const store = useTreeStore();
  const [layoutMode, setLayoutMode] = useState<'hierarchical' | 'radial'>('hierarchical');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const runLayout = (mode: 'hierarchical' | 'radial') => {
    setLayoutMode(mode);
    if (!store.persons.length) return;

    let newPositions: Record<string, {x:number, y:number}> = {};
    if (mode === 'hierarchical') {
      newPositions = applyHierarchicalLayout(store.persons, store.relationships);
    } else {
      const rootId = store.selectedPersonId || store.persons[0]?.id;
      newPositions = applyRadialLayout(store.persons, store.relationships, rootId);
    }
    
    // Apply batch
    Object.entries(newPositions).forEach(([id, pos]) => {
      store.updatePersonPosition(id, pos.x, pos.y);
    });
  };

  return (
    <>
      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden absolute top-[120px] left-4 right-4 bg-white rounded-xl shadow-xl border border-slate-200 p-4 transition-all z-40 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="flex flex-col gap-4">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button 
              onClick={() => { store.setViewMode('tree'); setMobileMenuOpen(false); }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${store.viewMode === 'tree' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Tree View
            </button>
            <button 
              onClick={() => { store.setViewMode('list'); setMobileMenuOpen(false); }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${store.viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              List View
            </button>
            <button 
              onClick={() => { store.setViewMode('map'); setMobileMenuOpen(false); }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${store.viewMode === 'map' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Map View
            </button>
          </div>
          {store.viewMode === 'tree' && (
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button 
                onClick={() => { runLayout('hierarchical'); setMobileMenuOpen(false); }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${layoutMode === 'hierarchical' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Hierarchical
              </button>
              <button 
                onClick={() => { runLayout('radial'); setMobileMenuOpen(false); }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${layoutMode === 'radial' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Radial
              </button>
            </div>
          )}
          
          <button 
            id="add-person-btn"
            onClick={() => { store.openAddPersonModal(); setMobileMenuOpen(false); }}
            className="bg-[#e76f2f] hover:bg-[#cf5e25] text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors w-full"
          >
            <Plus className="w-4 h-4" /> Add Person
          </button>
        </div>
      </div>

      <div className="h-14 flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm relative z-30 w-full">
        <div className="flex items-center gap-2 md:gap-4 flex-1">
          <button className="md:hidden text-slate-500 hover:text-slate-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={() => store.toggleFilterPanel()}
            className="flex bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-sm font-medium items-center gap-2 transition-colors border border-slate-200"
          >
            <Filter className="w-4 h-4" /> 
            <span className="hidden md:inline">Filters</span>
          </button>
        </div>

        <div className="flex items-center gap-4 flex-1 justify-center">
          <button 
            id="add-person-btn-desktop"
            onClick={() => store.openAddPersonModal()}
            className="hidden md:flex bg-[#e76f2f] hover:bg-[#cf5e25] text-white px-5 py-2 rounded-lg text-sm font-bold items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Person
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end">
          <div className="text-sm font-medium text-slate-800 flex items-center gap-1 hidden md:flex mr-2">
            <span>👤 {store.persons.length} people</span>
          </div>

          {/* View Mode Toggle & Save Button Wrapper */}
          <div className="hidden md:flex flex-col items-end relative">
            <div className="bg-slate-100 rounded-lg p-1 border border-slate-200 flex">
              <button 
                onClick={() => store.setViewMode('tree')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${store.viewMode === 'tree' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Tree
              </button>
              <button 
                onClick={() => store.setViewMode('list')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${store.viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                List
              </button>
              <button 
                onClick={() => store.setViewMode('map')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${store.viewMode === 'map' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Map
              </button>
            </div>
            
            {/* Save Cards Button */}
            {store.viewMode === 'tree' && (
              <button
                onClick={() => store.flushPositionUpdates()}
                disabled={store.isSaving || Object.keys(store.pendingPositionUpdates).length === 0}
                className="absolute top-[120%] bg-[#e76f2f] hover:bg-[#cf5e25] text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded shadow-sm transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {store.isSaving ? 'Saving...' : 'Save Cards'}
              </button>
            )}
          </div>
          
          <button className="p-2 text-slate-800 hover:text-[#e76f2f] transition-colors md:hidden">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>
    </>
  );
}
