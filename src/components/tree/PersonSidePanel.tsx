import { X, Edit2, Trash2, Camera, MapPin, Briefcase, GraduationCap, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTreeStore } from '../../store/treeStore';
import { format, parseISO } from 'date-fns';

export default function PersonSidePanel() {
  const store = useTreeStore();
  const person = store.persons.find(p => p.id === store.selectedPersonId);
  
  if (!person) return null;

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'male': return '#3b82f6';
      case 'female': return '#ec4899';
      case 'other': return '#8b5cf6';
      default: return '#94a3b8';
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      return format(parseISO(dateStr), 'd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  const hasFather = store.relationships.some(r => r.type === 'parent' && r.person2Id === person.id && store.persons.find(p => p.id === r.person1Id)?.gender === 'male');
  const hasMother = store.relationships.some(r => r.type === 'parent' && r.person2Id === person.id && store.persons.find(p => p.id === r.person1Id)?.gender === 'female');
  const hasSpouse = store.relationships.some(r => r.type === 'spouse' && (r.person1Id === person.id || r.person2Id === person.id));

  return (
    <AnimatePresence>
      {store.sidePanelOpen && (
        <motion.aside
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 w-full md:absolute md:top-0 md:right-0 md:left-auto md:w-[320px] lg:w-[400px] h-[80vh] md:h-full bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.1)] md:shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-50 flex flex-col md:border-l border-slate-200 rounded-t-3xl md:rounded-none"
        >
          {/* Mobile drag handle */}
          <div className="w-full flex justify-center py-2 md:hidden absolute top-0 z-20">
            <div className="w-12 h-1.5 bg-white/50 backdrop-blur rounded-full"></div>
          </div>

          {/* Header */}
          <div className="relative h-48 md:h-64 bg-slate-100 flex-shrink-0 group rounded-t-3xl md:rounded-none overflow-hidden">
            <button 
              onClick={store.closeSidePanel}
              className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 z-10 transition-colors hidden md:block"
            >
              <X className="w-4 h-4" />
            </button>
            
            <button 
              onClick={store.closeSidePanel}
              className="absolute top-4 left-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 z-10 transition-colors md:hidden"
            >
              <X className="w-4 h-4" />
            </button>

            {person.profilePhotoUrl ? (
              <img src={person.profilePhotoUrl} className="w-full h-full object-cover" alt="" />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center text-6xl text-white font-bold"
                style={{ background: `linear-gradient(to bottom right, ${getGenderColor(person.gender)}, #1e293b)` }}
              >
                {person.firstName[0]}{person.lastName[0]}
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <div className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full flex items-center gap-2">
                <Camera className="w-4 h-4" /> Change Photo
              </div>
            </div>

            <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
              <h2 className="text-2xl font-bold text-white drop-shadow-md">
                {person.firstName} {person.middleName} {person.lastName}
              </h2>
              <div className="text-white/80 text-sm mt-1 flex items-center gap-2">
                <span>{person.gender === 'male' ? '♂' : person.gender === 'female' ? '♀' : '⚧'}</span>
                <span>
                  {person.dateOfBirth ? parseISO(person.dateOfBirth).getFullYear() : '?'} — 
                  {person.isLiving ? ' Present' : person.dateOfDeath ? ` ${parseISO(person.dateOfDeath).getFullYear()}` : ' ?'}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
            {['overview', 'photos', 'events', 'edit'].map(tab => (
              <button
                key={tab}
                onClick={() => store.setSidePanelTab(tab as any)}
                className={`flex-1 py-3 px-4 text-sm font-medium capitalize border-b-2 whitespace-nowrap transition-colors ${store.sidePanelTab === tab ? 'border-[#e76f2f] text-[#e76f2f]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            {store.sidePanelTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-3 text-sm text-slate-700">
                  {person.dateOfBirth && (
                    <div className="flex items-start gap-3">
                      <span className="text-xl w-6 text-center">🌟</span>
                      <div>
                        <div className="font-medium text-slate-900">Born</div>
                        <div className="text-slate-600">{formatDate(person.dateOfBirth)}{person.birthPlace && ` in ${person.birthPlace}`}</div>
                      </div>
                    </div>
                  )}
                  {!person.isLiving && person.dateOfDeath && (
                    <div className="flex items-start gap-3">
                      <span className="text-xl w-6 text-center">✝</span>
                      <div>
                        <div className="font-medium text-slate-900">Died</div>
                        <div className="text-slate-600">{formatDate(person.dateOfDeath)}{person.deathPlace && ` in ${person.deathPlace}`}</div>
                      </div>
                    </div>
                  )}
                  {person.occupation && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-slate-400" />
                      <span>{person.occupation}</span>
                    </div>
                  )}
                  {person.education && (
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-slate-400" />
                      <span>{person.education}</span>
                    </div>
                  )}
                </div>

                {person.bio && (
                  <div>
                    <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Biography</h3>
                    <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-lg border border-slate-200">
                      {person.bio}
                    </p>
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-slate-900">Family</h3>
                  </div>
                  {/* Stubs for Family links */}
                  <div className="bg-white rounded-lg border border-slate-200 p-2 divide-y divide-slate-100">
                    {!hasFather && (
                      <button onClick={() => store.openAddPersonModal({ relatedTo: person.id, relType: 'parent', gender: 'male' })} className="w-full text-left p-2 text-sm text-[#e76f2f] hover:bg-orange-50 rounded font-medium transition-colors">
                        + Add Father
                      </button>
                    )}
                    {!hasMother && (
                      <button onClick={() => store.openAddPersonModal({ relatedTo: person.id, relType: 'parent', gender: 'female' })} className="w-full text-left p-2 text-sm text-[#e76f2f] hover:bg-orange-50 rounded font-medium transition-colors">
                        + Add Mother
                      </button>
                    )}
                    {!hasSpouse && (
                      <button onClick={() => store.openAddPersonModal({ relatedTo: person.id, relType: 'spouse' })} className="w-full text-left p-2 text-sm text-[#e76f2f] hover:bg-orange-50 rounded font-medium transition-colors">
                        + Add Spouse
                      </button>
                    )}
                    {hasSpouse && (
                      <button onClick={() => store.openAddPersonModal({ relatedTo: person.id, relType: 'child' })} className="w-full text-left p-2 text-sm text-[#e76f2f] hover:bg-orange-50 rounded font-medium transition-colors">
                        + Add Child
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-6 flex justify-around border-t border-slate-200">
                   <button onClick={() => store.setSidePanelTab('edit')} className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-800">
                     <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50"><Edit2 className="w-4 h-4" /></div>
                     <span className="text-[10px] font-medium uppercase">Edit</span>
                   </button>
                   <button onClick={() => store.removePersonLocally(person.id)} className="flex flex-col items-center gap-1 text-red-500 hover:text-red-700">
                     <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-red-50"><Trash2 className="w-4 h-4" /></div>
                     <span className="text-[10px] font-medium uppercase">Delete</span>
                   </button>
                </div>
              </div>
            )}
            
            {store.sidePanelTab === 'photos' && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
                <p>No photos yet</p>
                <button className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors">Upload Photo</button>
              </div>
            )}
            
            {store.sidePanelTab === 'events' && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                <FileText className="w-12 h-12 mb-4 opacity-50" />
                <p>No life events added</p>
                <button className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors">Add Event</button>
              </div>
            )}
            
            {store.sidePanelTab === 'edit' && (
              <div className="space-y-4 pb-10 border-t border-slate-100 flex flex-col max-h-min overflow-scroll">
                <div className="text-sm font-medium text-slate-500 mb-2 border-b pb-2">Edit basic info</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">First Name</label>
                    <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-1 focus:border-[#e76f2f] focus:ring-[#e76f2f] shadow-sm text-sm text-black font-bold bg-white" placeholder="First Name" value={person.firstName || ''} onChange={(e) => store.updatePersonLocally(person.id, { firstName: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Middle Name</label>
                    <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-1 focus:border-[#e76f2f] focus:ring-[#e76f2f] shadow-sm text-sm text-black font-bold bg-white" placeholder="Middle Name" value={person.middleName || ''} onChange={(e) => store.updatePersonLocally(person.id, { middleName: e.target.value })} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Last Name</label>
                    <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-1 focus:border-[#e76f2f] focus:ring-[#e76f2f] shadow-sm text-sm text-black font-bold bg-white" placeholder="Last Name" value={person.lastName || ''} onChange={(e) => store.updatePersonLocally(person.id, { lastName: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Maiden Name</label>
                    <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-1 focus:border-[#e76f2f] focus:ring-[#e76f2f] shadow-sm text-sm text-black font-bold bg-white" placeholder="Maiden Name" value={person.maidenName || ''} onChange={(e) => store.updatePersonLocally(person.id, { maidenName: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Gender</label>
                  <select className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-1 focus:border-[#e76f2f] focus:ring-[#e76f2f] shadow-sm text-sm text-black font-bold bg-white" value={person.gender} onChange={(e) => store.updatePersonLocally(person.id, { gender: e.target.value as any })}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={person.isLiving} onChange={(e) => store.updatePersonLocally(person.id, { isLiving: e.target.checked })} className="w-4 h-4 text-[#e76f2f] rounded border-slate-300 focus:ring-[#e76f2f]" />
                    <span className="text-sm font-medium text-slate-700">Currently Living</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Date of Birth</label>
                    <input type="date" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-1 focus:border-[#e76f2f] focus:ring-[#e76f2f] shadow-sm text-sm text-black font-bold bg-white" value={person.dateOfBirth?.split('T')[0] || ''} onChange={(e) => store.updatePersonLocally(person.id, { dateOfBirth: e.target.value || null })} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">City Born In</label>
                    <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-1 focus:border-[#e76f2f] focus:ring-[#e76f2f] shadow-sm text-sm text-black font-bold bg-white" placeholder="City" value={person.birthPlace || ''} onChange={(e) => store.updatePersonLocally(person.id, { birthPlace: e.target.value || null })} />
                  </div>
                </div>

                {!person.isLiving && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Date of Death</label>
                      <input type="date" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-1 focus:border-[#e76f2f] focus:ring-[#e76f2f] shadow-sm text-sm text-black font-bold bg-white" value={person.dateOfDeath?.split('T')[0] || ''} onChange={(e) => store.updatePersonLocally(person.id, { dateOfDeath: e.target.value || null })} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Death Place</label>
                      <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-1 focus:border-[#e76f2f] focus:ring-[#e76f2f] shadow-sm text-sm text-black font-bold bg-white" placeholder="City" value={person.deathPlace || ''} onChange={(e) => store.updatePersonLocally(person.id, { deathPlace: e.target.value || null })} />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Current Location</label>
                  <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-1 focus:border-[#e76f2f] focus:ring-[#e76f2f] shadow-sm text-sm text-black font-bold bg-white" placeholder="Current Location" value={person.currentLocation || ''} onChange={(e) => store.updatePersonLocally(person.id, { currentLocation: e.target.value || null })} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Occupation</label>
                  <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-1 focus:border-[#e76f2f] focus:ring-[#e76f2f] shadow-sm text-sm text-black font-bold bg-white" placeholder="Occupation" value={person.occupation || ''} onChange={(e) => store.updatePersonLocally(person.id, { occupation: e.target.value || null })} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Education</label>
                  <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-1 focus:border-[#e76f2f] focus:ring-[#e76f2f] shadow-sm text-sm text-black font-bold bg-white" placeholder="Education" value={person.education || ''} onChange={(e) => store.updatePersonLocally(person.id, { education: e.target.value || null })} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Nationality</label>
                    <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-1 focus:border-[#e76f2f] focus:ring-[#e76f2f] shadow-sm text-sm text-black font-bold bg-white" placeholder="Nationality" value={person.nationality || ''} onChange={(e) => store.updatePersonLocally(person.id, { nationality: e.target.value || null })} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Religion</label>
                    <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-1 focus:border-[#e76f2f] focus:ring-[#e76f2f] shadow-sm text-sm text-black font-bold bg-white" placeholder="Religion" value={person.religion || ''} onChange={(e) => store.updatePersonLocally(person.id, { religion: e.target.value || null })} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Biography</label>
                  <textarea rows={4} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-1 focus:border-[#e76f2f] focus:ring-[#e76f2f] shadow-sm text-sm text-black font-semibold bg-white" placeholder="Biography" value={person.bio || ''} onChange={(e) => store.updatePersonLocally(person.id, { bio: e.target.value || null })}></textarea>
                </div>
                
                <button 
                  onClick={async () => {
                    await store.savePersonToDb(person.id);
                    store.setSidePanelTab('overview');
                  }} 
                  disabled={store.isSaving}
                  className="w-full bg-[#e76f2f] text-white font-bold p-3 rounded-lg hover:bg-[#d65f1e] transition-colors mt-4 disabled:opacity-50"
                >
                  {store.isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function ImageIcon(props: any) {
  return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
}
