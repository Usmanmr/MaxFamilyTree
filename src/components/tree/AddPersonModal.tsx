import { useState, useEffect, useMemo } from 'react';
import { useTreeStore } from '../../store/treeStore';
import { X, User2, MapPin, Briefcase, Search } from 'lucide-react';
import { Person, Relationship } from '../../types';

export default function AddPersonModal() {
  const store = useTreeStore();
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [selectedExistingId, setSelectedExistingId] = useState<string>('');
  
  const [tab, setTab] = useState(1);
  const [formData, setFormData] = useState<Partial<Person> & { marriageDate?: string }>({
    firstName: '',
    lastName: '',
    gender: 'unknown',
    isLiving: true,
  });

  const isSpouse = store.addPersonModalDefaults?.relType === 'spouse';

  const availablePersons = useMemo(() => {
    if (!store.addPersonModalDefaults?.relatedTo) return [];
    // exclude the person themselves and those already related directly via spouse/parent/child
    return store.persons.filter(p => p.id !== store.addPersonModalDefaults!.relatedTo);
  }, [store.persons, store.addPersonModalDefaults?.relatedTo]);

  useEffect(() => {
    if (store.addPersonModalOpen && store.addPersonModalDefaults) {
      setFormData({
        firstName: '',
        lastName: '',
        gender: store.addPersonModalDefaults.gender || 'unknown',
        isLiving: true,
        marriageDate: '',
      });
      setTab(1);
      setMode('new');
      setSelectedExistingId('');
    } else if (store.addPersonModalOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        gender: 'unknown',
        isLiving: true,
        marriageDate: '',
      });
      setTab(1);
      setMode('new');
      setSelectedExistingId('');
    }
  }, [store.addPersonModalOpen, store.addPersonModalDefaults]);

  if (!store.addPersonModalOpen) return null;

  const handleSubmit = () => {
    let newPersonId = '';
    
    if (mode === 'new') {
      let canvasX = 0;
      let canvasY = 0;
      
      // Attempt to drop the new person near the relative
      if (store.addPersonModalDefaults?.relatedTo) {
        const relPerson = store.persons.find(p => p.id === store.addPersonModalDefaults!.relatedTo);
        if (relPerson) {
          if (store.addPersonModalDefaults.relType === 'parent') {
            canvasX = relPerson.canvasX;
            canvasY = relPerson.canvasY - 150;
          } else if (store.addPersonModalDefaults.relType === 'child') {
            canvasX = relPerson.canvasX;
            canvasY = relPerson.canvasY + 150;
          } else if (store.addPersonModalDefaults.relType === 'spouse') {
            canvasX = relPerson.canvasX + 250;
            canvasY = relPerson.canvasY;
          }
        }
      }

      const newPerson: Person = {
        id: Math.random().toString(),
        treeId: store.treeId || 'default',
        firstName: formData.firstName || 'Unknown',
        lastName: formData.lastName || 'Person',
        gender: formData.gender as any || 'unknown',
        isLiving: formData.isLiving ?? true,
        dateOfBirth: formData.dateOfBirth,
        dateOfDeath: formData.dateOfDeath,
        occupation: formData.occupation,
        bio: formData.bio,
        canvasX,
        canvasY,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      store.addPersonLocally(newPerson);
      newPersonId = newPerson.id;
    } else {
      newPersonId = selectedExistingId;
    }

    if (store.addPersonModalDefaults?.relatedTo && store.addPersonModalDefaults?.relType && newPersonId) {
      const parentRel = store.addPersonModalDefaults.relType;
      const relatedToId = store.addPersonModalDefaults.relatedTo;
      
      const rel: Relationship = {
        id: Math.random().toString(),
        treeId: store.treeId || 'default',
        person1Id: parentRel === 'parent' ? newPersonId : parentRel === 'child' ? relatedToId : relatedToId,
        person2Id: parentRel === 'parent' ? relatedToId : parentRel === 'child' ? newPersonId : newPersonId,
        type: parentRel === 'parent' || parentRel === 'child' ? 'parent' : 'spouse',
        marriageDate: parentRel === 'spouse' ? formData.marriageDate : undefined,
        isCurrent: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      store.addRelationshipLocally(rel);
    }

    store.selectPerson(newPersonId);
    store.closeAddPersonModal();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-person-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-[580px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 id="add-person-title" className="text-xl font-bold text-slate-800">
            {store.addPersonModalDefaults?.relatedTo ? `Add ${store.addPersonModalDefaults.relType}` : 'Add Person'}
          </h2>
          <button onClick={store.closeAddPersonModal} aria-label="Close" className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {store.addPersonModalDefaults?.relatedTo && (
          <div className="flex bg-slate-50 p-1 mx-6 mt-4 rounded-lg border border-slate-200">
            <button 
              onClick={() => setMode('new')} 
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'new' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}>
              Create New
            </button>
            <button 
              onClick={() => setMode('existing')} 
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'existing' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}>
              Select Existing
            </button>
          </div>
        )}

        {mode === 'new' && (
          <div className="flex border-b border-slate-100 px-6">
            <button onClick={() => setTab(1)} className={`py-3 text-sm font-medium border-b-2 mr-6 ${tab === 1 ? 'border-[#e76f2f] text-[#e76f2f]' : 'border-transparent text-slate-500'}`}>Basic Info</button>
            <button onClick={() => setTab(2)} className={`py-3 text-sm font-medium border-b-2 mr-6 ${tab === 2 ? 'border-[#e76f2f] text-[#e76f2f]' : 'border-transparent text-slate-500'}`}>Details</button>
            <button onClick={() => setTab(3)} className={`py-3 text-sm font-medium border-b-2 ${tab === 3 ? 'border-[#e76f2f] text-[#e76f2f]' : 'border-transparent text-slate-500'}`}>Photo</button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {mode === 'existing' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Select a Person</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select 
                    className="w-full border border-slate-300 rounded-lg p-2.5 pl-9 text-sm text-black font-semibold outline-none focus:border-[#e76f2f] appearance-none"
                    value={selectedExistingId}
                    onChange={(e) => setSelectedExistingId(e.target.value)}
                  >
                    <option value="" disabled>Choose someone...</option>
                    {availablePersons.map(p => (
                      <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                    ))}
                  </select>
                </div>
              </div>
              {isSpouse && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date of Marriage</label>
                  <input type="date" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold text-black outline-none focus:border-[#e76f2f] focus:ring-1 focus:ring-[#e76f2f]" 
                    value={formData.marriageDate || ''} onChange={(e) => setFormData({...formData, marriageDate: e.target.value})} />
                </div>
              )}
            </div>
          ) : (
            <>
              {tab === 1 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
                      <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold text-black outline-none focus:border-[#e76f2f] focus:ring-1 focus:ring-[#e76f2f]" 
                        value={formData.firstName || ''} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
                      <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold text-black outline-none focus:border-[#e76f2f] focus:ring-1 focus:ring-[#e76f2f]" 
                        value={formData.lastName || ''} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Gender</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['male', 'female', 'other'].map(g => (
                        <button key={g} onClick={() => setFormData({...formData, gender: g as any})} 
                          className={`py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${formData.gender === g ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                      <input type="date" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold text-black outline-none focus:border-[#e76f2f] focus:ring-1 focus:ring-[#e76f2f]" 
                        value={formData.dateOfBirth || ''} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} />
                    </div>
                    <div className="flex items-center mt-6">
                      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={formData.isLiving} onChange={(e) => setFormData({...formData, isLiving: e.target.checked})} className="rounded text-[#e76f2f] focus:ring-[#e76f2f]" />
                        <span>This person is living</span>
                      </label>
                    </div>
                  </div>

                  {!formData.isLiving && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Date of Death</label>
                        <input type="date" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold text-black outline-none focus:border-[#e76f2f]" 
                          value={formData.dateOfDeath || ''} onChange={(e) => setFormData({...formData, dateOfDeath: e.target.value})} />
                      </div>
                    </div>
                  )}

                  {isSpouse && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Date of Marriage</label>
                        <input type="date" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold text-black outline-none focus:border-[#e76f2f] focus:ring-1 focus:ring-[#e76f2f]" 
                          value={formData.marriageDate || ''} onChange={(e) => setFormData({...formData, marriageDate: e.target.value})} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === 2 && (
                 <div className="space-y-4">
                   <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Occupation</label>
                      <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold text-black outline-none focus:border-[#e76f2f]" placeholder="e.g. Teacher, Engineer" value={formData.occupation || ''} onChange={(e) => setFormData({...formData, occupation: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Bio / Life Story</label>
                      <textarea rows={4} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold text-black outline-none focus:border-[#e76f2f]" value={formData.bio || ''} onChange={(e) => setFormData({...formData, bio: e.target.value})}></textarea>
                   </div>
                 </div>
              )}

              {tab === 3 && (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#e76f2f] hover:bg-orange-50/50 transition-colors">
                  <div className="w-16 h-16 bg-blue-100 text-blue-500 flex items-center justify-center rounded-full mb-4">
                     <User2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">Drag and drop a photo</h3>
                  <p className="text-xs text-slate-500 mb-4">or click to browse from your computer</p>
                  <div className="text-[10px] text-slate-400">Max 10MB, JPG/PNG/WEBP. This will be set as their profile photo.</div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between">
          <button onClick={store.closeAddPersonModal} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
          
          <div className="flex gap-3">
            {mode === 'new' && tab > 1 && <button onClick={() => setTab(tab-1)} className="px-5 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50">Previous</button>}
            
            {mode === 'new' && tab < 3 ? (
              <button onClick={() => setTab(tab+1)} className="px-5 py-2.5 text-sm font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors">Next</button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={mode === 'new' ? !formData.firstName : !selectedExistingId}
                className="px-6 py-2.5 text-sm font-medium bg-[#e76f2f] text-white rounded-lg hover:bg-[#cf5e25] disabled:opacity-50 transition-colors shadow-sm shadow-[#e76f2f]/20">
                {mode === 'new' ? 'Add to Tree' : 'Connect Person'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
