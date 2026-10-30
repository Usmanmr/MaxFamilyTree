import { useState } from 'react';
import { useTreeStore } from '../../store/treeStore';
import { X, Heart, Contact, Component, Users, Baby } from 'lucide-react';
import { Relationship, RelationshipType } from '../../types';

export default function AddRelationshipModal() {
  const store = useTreeStore();
  const [person2Id, setPerson2Id] = useState('');
  const [relType, setRelType] = useState<RelationshipType>('spouse');

  // Currently we just stub open state
  // We'd have store.addRelationshipModalOpen and store.addRelationshipDefaults
  const isOpen = false; 

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[420px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Add Relationship</h2>
          <button className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
           <div className="flex justify-between">
              <div className="w-20 h-24 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center">
                 <div className="w-8 h-8 rounded-full bg-slate-300 mb-2"></div>
                 <div className="text-[10px] font-bold text-slate-700">Person 1</div>
               </div>
               <div className="flex-1 flex items-center justify-center px-4">
                 <div className="h-[2px] bg-slate-200 w-full relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">↔</div>
                 </div>
               </div>
               <div className="w-20 h-24 bg-slate-100 rounded-lg border border-slate-200 border-dashed flex flex-col items-center justify-center text-slate-400">
                 <Contact className="w-6 h-6 mb-1" />
                 <div className="text-[10px] font-bold">Select...</div>
               </div>
           </div>

           <div>
             <label className="block text-xs font-bold text-slate-700 mb-2">Relationship Type</label>
             <div className="grid grid-cols-3 gap-2">
               {[
                 { type: 'spouse', icon: Heart, label: 'Spouse' },
                 { type: 'parent', icon: Users, label: 'Parent' },
                 { type: 'child', icon: Baby, label: 'Child' },
                 { type: 'sibling', icon: Contact, label: 'Sibling' },
               ].map(r => (
                 <button 
                   key={r.type}
                   onClick={() => setRelType(r.type as RelationshipType)}
                   className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-colors ${relType === r.type ? 'border-[#e76f2f] bg-orange-50 text-[#e76f2f]' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'}`}
                 >
                   <r.icon className="w-5 h-5 mb-1" />
                   <span className="text-[10px] font-bold">{r.label}</span>
                 </button>
               ))}
             </div>
           </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between">
           <button className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
           <button className="px-6 py-2.5 text-sm font-medium bg-[#e76f2f] text-white rounded-lg hover:bg-[#cf5e25] transition-colors">Save</button>
        </div>
      </div>
    </div>
  );
}
