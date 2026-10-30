import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MoreVertical, Image as ImageIcon, Users, Clock, Edit2, Trash2, Network, MapPin, Baby, Gift, Activity, X } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import CreateTreeModal from '../components/tree/CreateTreeModal';
import { useTreeStore } from '../store/treeStore';
import { formatDistanceToNow, parseISO, differenceInDays, isAfter, setYear, isBefore, getMonth, format } from 'date-fns';

export default function Dashboard() {
  const store = useTreeStore();
  const trees = store.trees;
  const persons = store.persons;
  const activityLog = store.activityLog;
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<string | null>(null);
  const [showBirthdaysModal, setShowBirthdaysModal] = useState(false);
  const [showNewbornsModal, setShowNewbornsModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    store.fetchDashboardData();
    if (store.persons.length === 0) {
      store.fetchTreeData('1');
    }
  }, []);

  const handleDelete = () => {
    if (deleteConfirmOpen) {
      store.removeTreeLocally(deleteConfirmOpen);
      setDeleteConfirmOpen(null);
    }
  };

  const currentYear = new Date().getFullYear();
  const today = new Date();

  // Calculate stats for the first/current tree
  const treeStats = useMemo(() => {
    const locations = new Set(persons.map(p => p.currentLocation).filter(Boolean));
    
    let newborns = 0;
    let upcomingBirthdays = 0;
    
    persons.forEach(p => {
      if (!p.dateOfBirth) return;
      const dob = parseISO(p.dateOfBirth);
      if (isNaN(dob.getTime())) return;
      
      const age = currentYear - dob.getFullYear();
      if (age === 0 || age === 1) {
        newborns++;
      }
      
      const nextBirthday = setYear(dob, currentYear);
      if (isBefore(nextBirthday, today)) {
          nextBirthday.setFullYear(currentYear + 1);
      }
      
      const diff = differenceInDays(nextBirthday, today);
      if (diff >= 0 && diff <= 30) {
        upcomingBirthdays++;
      }
    });

    return {
      peopleCount: persons.length,
      locationsCount: locations.size,
      newborns,
      upcomingBirthdays
    };
  }, [persons, currentYear, today]);

  const birthdaysInSelectedMonth = useMemo(() => {
    return persons.filter(p => {
      if (!p.dateOfBirth) return false;
      const dob = parseISO(p.dateOfBirth);
      if (isNaN(dob.getTime())) return false;
      return getMonth(dob) === selectedMonth;
    }).sort((a, b) => {
      const dayA = parseISO(a.dateOfBirth!).getDate();
      const dayB = parseISO(b.dateOfBirth!).getDate();
      return dayA - dayB;
    });
  }, [persons, selectedMonth]);

  const newbornsList = useMemo(() => {
    return persons.filter(p => {
      if (!p.dateOfBirth) return false;
      const dob = parseISO(p.dateOfBirth);
      if (isNaN(dob.getTime())) return false;
      const age = currentYear - dob.getFullYear();
      return age === 0 || age === 1;
    }).sort((a, b) => {
      const dateA = parseISO(a.dateOfBirth!).getTime();
      const dateB = parseISO(b.dateOfBirth!).getTime();
      return dateB - dateA;
    });
  }, [persons, currentYear]);

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(i);
    return format(d, 'MMMM');
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'add': return <Plus className="w-5 h-5 text-emerald-600" />;
      case 'update': return <Edit2 className="w-5 h-5 text-orange-600" />;
      case 'delete': return <Trash2 className="w-5 h-5 text-red-600" />;
      case 'photo': return <ImageIcon className="w-5 h-5 text-blue-600" />;
      default: return <Activity className="w-5 h-5 text-slate-600" />;
    }
  };

  const getActivityBg = (type: string) => {
    switch (type) {
      case 'add': return 'bg-emerald-100';
      case 'update': return 'bg-orange-100';
      case 'delete': return 'bg-red-100';
      case 'photo': return 'bg-blue-100';
      default: return 'bg-slate-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-6 py-8">
      
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-800">My Family Trees</h1>
        <button 
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 bg-[#e76f2f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#d4621f] transition"
        >
          <Plus className="w-4 h-4" /> New Tree
        </button>
      </div>

      {trees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {trees.map(tree => (
            <div key={tree.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col">
              <div className="h-[120px] bg-gradient-to-br from-orange-100 to-rose-100 relative shrink-0">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #e76f2f 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-900">{tree.name}</h3>
                  <button className="text-slate-400 hover:text-slate-700" onClick={() => setDeleteConfirmOpen(tree.id)}>
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-3 mb-6 mt-2">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col">
                      <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1"><Users className="w-3 h-3"/> People</span>
                      <span className="text-xl font-bold text-slate-800">{treeStats.peopleCount}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col">
                      <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Locations</span>
                      <span className="text-xl font-bold text-slate-800">{treeStats.locationsCount}</span>
                    </div>
                    <button 
                      onClick={() => setShowNewbornsModal(true)}
                      className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex flex-col hover:bg-emerald-100 transition duration-200 text-left"
                    >
                      <span className="text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1"><Baby className="w-3 h-3"/> Newborns</span>
                      <span className="text-xl font-bold text-emerald-800">{treeStats.newborns}</span>
                    </button>
                    <button 
                      onClick={() => setShowBirthdaysModal(true)}
                      className="bg-purple-50 p-3 rounded-xl border border-purple-100 flex flex-col hover:bg-purple-100 transition duration-200 text-left"
                    >
                      <span className="text-purple-700 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1"><Gift className="w-3 h-3"/> Birthdays</span>
                      <span className="text-xl font-bold text-purple-800">{treeStats.upcomingBirthdays}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 justify-center">
                  <Clock className="w-3.5 h-3.5" /> Last updated: {tree.lastUpdated}
                </div>
                <Link to={`/tree/${tree.id}`} className="block w-full text-center py-2.5 bg-orange-50 hover:bg-[#e76f2f] text-[#e76f2f] hover:text-white rounded-xl font-medium transition-colors border border-orange-100 hover:border-[#e76f2f]">
                  Open Tree
                </Link>
              </div>
            </div>
          ))}
          
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center h-full min-h-[350px] text-slate-500 hover:border-[#e76f2f] hover:bg-orange-50/50 hover:text-[#e76f2f] transition-colors"
          >
            <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-medium text-sm">Create a new family tree</span>
          </button>
        </div>
      ) : (
        <EmptyState
          title="Welcome to FamilyTree!"
          description="Start by creating your first family tree to begin documenting your family's history."
          illustration={
             <div className="w-40 h-40 bg-orange-50 rounded-full flex items-center justify-center border-4 border-white shadow-xl shadow-orange-500/10">
               <Network className="w-20 h-20 text-[#e76f2f]" />
             </div>
          }
          action={
            <button onClick={() => setCreateModalOpen(true)} className="bg-[#e76f2f] text-white px-8 py-3 rounded-full font-medium hover:bg-[#d4621f] transition">
              + Create Your First Tree
            </button>
          }
        />
      )}

      {trees.length > 0 && (
         <div className="mb-12">
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-2">Recent Activity</h2>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
              {activityLog.length > 0 ? activityLog.slice(0, 5).map(log => (
                <div key={log.id} className="p-4 flex gap-4 items-center hover:bg-slate-50 transition">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityBg(log.type)}`}>
                    {getActivityIcon(log.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-800 font-medium">{log.message}</p>
                    <p className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-slate-500">
                  <Activity className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p>No recent activity. Start adding people to your tree!</p>
                </div>
              )}
            </div>
         </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(null)}
        title="Delete Family Tree"
        message="Are you sure you want to delete this family tree? All people, photos, and connections will be permanently removed. This action cannot be undone."
        confirmLabel="Delete Tree"
        isDestructive={true}
        onConfirm={handleDelete}
      />
      <CreateTreeModal 
        isOpen={createModalOpen} 
        onClose={() => setCreateModalOpen(false)} 
      />

      {showBirthdaysModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-600" />
                Birthdays in {months[selectedMonth]}
              </h2>
              <button 
                onClick={() => setShowBirthdaysModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 border-b border-slate-100 bg-slate-50">
              <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#e76f2f] focus:border-transparent font-medium"
              >
                {months.map((month, idx) => (
                  <option key={month} value={idx}>{month}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {birthdaysInSelectedMonth.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {birthdaysInSelectedMonth.map(person => {
                    const dob = parseISO(person.dateOfBirth!);
                    const day = dob.getDate();
                    const age = currentYear - dob.getFullYear();
                    
                    return (
                      <div key={person.id} className="p-3 flex items-center gap-4 hover:bg-slate-50 rounded-xl transition">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex flex-col items-center justify-center font-bold relative overflow-hidden">
                           <div className="bg-purple-200 w-full text-[9px] uppercase tracking-wider text-center flex-1 pt-1 font-semibold">
                             {format(dob, 'MMM')}
                           </div>
                           <div className="flex-[1.5] flex items-center justify-center text-sm">
                             {day}
                           </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 text-base">{person.firstName} {person.lastName}</p>
                          <p className="text-sm text-slate-500">Turning {age} years old</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <Gift className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p>No birthdays found for this month.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showNewbornsModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Baby className="w-5 h-5 text-emerald-600" />
                Newborns (Age 0-1)
              </h2>
              <button 
                onClick={() => setShowNewbornsModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              {newbornsList.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {newbornsList.map(person => {
                    const dob = parseISO(person.dateOfBirth!);
                    return (
                      <div key={person.id} className="p-3 flex items-center gap-4 hover:bg-slate-50 rounded-xl transition">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex flex-col items-center justify-center font-bold relative overflow-hidden">
                           <div className="bg-emerald-200 w-full text-[9px] uppercase tracking-wider text-center flex-1 pt-1 font-semibold">
                             {format(dob, 'yyyy')}
                           </div>
                           <div className="flex-[1.5] flex items-center justify-center text-sm">
                             <Baby className="w-4 h-4"/>
                           </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 text-base">{person.firstName} {person.lastName}</p>
                          <p className="text-sm text-slate-500">Born {format(dob, 'MMMM d, yyyy')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <Baby className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p>No newborns found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
