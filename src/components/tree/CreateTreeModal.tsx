import { useState } from 'react';
import { X, TreePine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTreeStore } from '../../store/treeStore';

export default function CreateTreeModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [treeName, setTreeName] = useState('');
  const navigate = useNavigate();
  const store = useTreeStore();

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!treeName.trim()) return;
    
    const newTreeId = Math.random().toString(36).substring(7);
    store.addTreeLocally({
      id: newTreeId,
      name: treeName,
      persons: 0,
      lastUpdated: 'Just now'
    });
    
    onClose();
    navigate(`/tree/${newTreeId}`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[480px] overflow-hidden flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Create New Tree</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-orange-100/50 flex items-center justify-center rounded-full">
              <TreePine className="w-8 h-8 text-[#e76f2f]" />
            </div>
          </div>
          
          <div>
             <label className="block text-sm font-bold text-slate-700 mb-2">Family Tree Name</label>
             <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none focus:border-[#e76f2f] focus:ring-1 focus:ring-[#e76f2f] shadow-sm" 
                placeholder="e.g. The Harrison Legacy" 
                value={treeName} 
                onChange={(e) => setTreeName(e.target.value)}
                autoFocus
             />
             <p className="text-xs text-slate-500 mt-2">You can always rename this later.</p>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3\">
           <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
           <button 
             onClick={handleSubmit}
             disabled={!treeName.trim()}
             className="px-6 py-2.5 text-sm font-medium bg-[#e76f2f] text-white rounded-lg hover:bg-[#cf5e25] disabled:opacity-50 transition-colors shadow-sm shadow-[#e76f2f]/20">
             Create Tree
           </button>
        </div>
      </div>
    </div>
  );
}
