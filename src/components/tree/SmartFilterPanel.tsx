import React, { useMemo } from 'react';
import { useTreeStore } from '../../store/treeStore';
import { Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseISO, getMonth } from 'date-fns';
import { getLocationColor } from '../../lib/locationColors';

const CURRENT_YEAR = 2026;

const GENERATIONS = [
  { id: '1', label: 'Boomers (Ages 62–80)', minAge: 62, maxAge: 80 },
  { id: '2', label: 'Gen X (Ages 46–61)', minAge: 46, maxAge: 61 },
  { id: '3', label: 'Millennials / Gen Y (Ages 30–45)', minAge: 30, maxAge: 45 },
  { id: '4', label: 'Gen Z (Ages 14–29)', minAge: 14, maxAge: 29 },
  { id: '5', label: 'Gen Alpha (Ages 0–13)', minAge: 0, maxAge: 13 },
];

const LIFE_STAGES = [
  { id: 'toddlers', label: 'Toddlers (0-3)', minAge: 0, maxAge: 3 },
  { id: 'kids', label: 'Kids (4-9)', minAge: 4, maxAge: 9 },
  { id: 'preteens', label: 'Pre-Teens (10-12)', minAge: 10, maxAge: 12 },
  { id: 'teenagers', label: 'Teenagers (13-19)', minAge: 13, maxAge: 19 },
  { id: 'youngadults', label: 'Young Adults (20-29)', minAge: 20, maxAge: 29 },
  { id: 'elders', label: 'Elders (60+)', minAge: 60, maxAge: 999 },
];

const DEMOGRAPHICS = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' }
];

const MONTHS = [
  { id: 0, label: 'January' },
  { id: 1, label: 'February' },
  { id: 2, label: 'March' },
  { id: 3, label: 'April' },
  { id: 4, label: 'May' },
  { id: 5, label: 'June' },
  { id: 6, label: 'July' },
  { id: 7, label: 'August' },
  { id: 8, label: 'September' },
  { id: 9, label: 'October' },
  { id: 10, label: 'November' },
  { id: 11, label: 'December' }
];

export function calculateAgeIn2026(dateOfBirth?: string | null, dateOfDeath?: string | null): number | null {
  if (!dateOfBirth) return null;
  const dob = parseISO(dateOfBirth);
  const endYear = dateOfDeath ? parseISO(dateOfDeath).getFullYear() : CURRENT_YEAR;
  const age = endYear - dob.getFullYear();
  return age;
}

export default function SmartFilterPanel() {
  const store = useTreeStore();
  const filters = store.filters;
  const isOpen = store.filterPanelOpen;

  // Extract unique locations
  const availableLocations = useMemo(() => {
    const locs = new Set<string>();
    store.persons.forEach(p => {
      if (p.currentLocation) locs.add(p.currentLocation);
      else if (p.birthPlace) locs.add(p.birthPlace);
    });
    return Array.from(locs).filter(Boolean).sort();
  }, [store.persons]);

  const getFilteredCount = useMemo(() => {
    return store.persons.filter(p => {
      // If no filters active, return true
      if (!filters.generations.length && !filters.lifeStages.length && !filters.demographics.length && (!filters.locations || !filters.locations.length) && (!filters.birthMonths || !filters.birthMonths.length) && (!filters.vitalStatus || !filters.vitalStatus.length)) return true;

      const age = calculateAgeIn2026(p.dateOfBirth, p.dateOfDeath);
      const location = p.currentLocation || p.birthPlace;
      const dobMonth = p.dateOfBirth ? getMonth(parseISO(p.dateOfBirth)) : null;
      
      let passGen = true;
      if (filters.generations.length > 0) {
        passGen = filters.generations.some(genId => {
          const gen = GENERATIONS.find(g => g.id === genId);
          return gen && age !== null && age >= gen.minAge && age <= gen.maxAge;
        });
      }

      let passStage = true;
      if (filters.lifeStages.length > 0) {
        passStage = filters.lifeStages.some(stageId => {
          const stage = LIFE_STAGES.find(s => s.id === stageId);
          return stage && age !== null && age >= stage.minAge && age <= stage.maxAge;
        });
      }

      let passDemo = true;
      if (filters.demographics.length > 0) {
        passDemo = filters.demographics.includes(p.gender);
      }

      let passLocation = true;
      if (filters.locations && filters.locations.length > 0) {
        passLocation = location !== null && location !== undefined ? filters.locations.includes(location) : false;
      }

      let passBirthMonth = true;
      if (filters.birthMonths && filters.birthMonths.length > 0) {
        passBirthMonth = dobMonth !== null ? filters.birthMonths.includes(dobMonth) : false;
      }
      
      let passVitalStatus = true;
      if (filters.vitalStatus && filters.vitalStatus.length > 0) {
        passVitalStatus = filters.vitalStatus.includes(p.isLiving ? 'living' : 'deceased');
      }

      return passGen && passStage && passDemo && passLocation && passBirthMonth && passVitalStatus;
    }).length;
  }, [store.persons, filters]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="h-full z-40 bg-gradient-to-br from-slate-900/80 to-[#0f172a]/90 backdrop-blur-2xl border-r border-white/10 flex flex-col flex-shrink-0 overflow-hidden relative"
          >
            <div className="w-80 h-full flex flex-col flex-shrink-0">
              <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
                <div className="flex items-center justify-between mb-8 mt-2">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Smart Filter</h2>
                  {(filters.generations.length > 0 || filters.lifeStages.length > 0 || filters.demographics.length > 0 || (filters.locations && filters.locations.length > 0) || (filters.birthMonths && filters.birthMonths.length > 0)) && (
                    <button 
                      onClick={store.clearFilters}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Gender */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold tracking-widest text-slate-400 uppercase mb-4">Gender</h3>
                <div className="flex flex-wrap gap-2">
                  {DEMOGRAPHICS.map(demo => {
                    const isActive = filters.demographics.includes(demo.id);
                    return (
                      <button
                        key={demo.id}
                        onClick={() => { store.toggleFilter('demographics', demo.id); store.setViewMode('list'); }}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border ${
                          isActive 
                            ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)]' 
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        {demo.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Birth Months */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold tracking-widest text-slate-400 uppercase mb-4">Birth Month</h3>
                <div className="grid grid-cols-3 gap-2">
                  {MONTHS.map(month => {
                    const isActive = filters.birthMonths?.includes(month.id);
                    const count = store.persons.filter(p => p.dateOfBirth && getMonth(parseISO(p.dateOfBirth)) === month.id).length;
                    return (
                      <button
                        key={month.id}
                        onClick={() => { store.toggleFilter('birthMonths', month.id); store.setViewMode('list'); }}
                        className={`relative px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-300 border ${
                          isActive 
                            ? 'bg-purple-500/20 border-purple-400/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        {month.label.substring(0, 3)}
                        {count > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-purple-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Vital Status */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold tracking-widest text-slate-400 uppercase mb-4">Living or Passed Away</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    {id: 'living', label: 'Living', color: 'emerald'},
                    {id: 'deceased', label: 'Passed Away', color: 'slate'}
                  ].map(status => {
                    const isActive = filters.vitalStatus?.includes(status.id);
                    return (
                      <button
                        key={status.id}
                        onClick={() => { store.toggleFilter('vitalStatus', status.id); store.setViewMode('list'); }}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border ${
                          isActive 
                            ? (status.id === 'living' ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)]' : 'bg-slate-500/20 border-slate-400/50 text-slate-300 shadow-[0_0_15px_rgba(148,163,184,0.3)]')
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        {status.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Locations */}
              {availableLocations.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold tracking-widest text-slate-400 uppercase mb-4">Location</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableLocations.map(loc => {
                      const isActive = filters.locations?.includes(loc);
                      const locColor = getLocationColor(loc);
                      return (
                        <button
                          key={loc}
                          onClick={() => { store.toggleFilter('locations', loc); store.setViewMode('list'); }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border flex items-center gap-1.5 ${
                            isActive 
                              ? 'text-white shadow-lg' 
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                          }`}
                          style={isActive ? {
                            backgroundColor: locColor,
                            borderColor: locColor,
                            boxShadow: `0 0 15px ${locColor}40`
                          } : {}}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isActive ? '#fff' : locColor }} />
                          {loc}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Life Stage */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold tracking-widest text-slate-400 uppercase mb-4">Life Stage</h3>
                <div className="flex flex-wrap gap-2">
                  {LIFE_STAGES.map(stage => {
                    const isActive = filters.lifeStages.includes(stage.id);
                    return (
                      <button
                        key={stage.id}
                        onClick={() => { store.toggleFilter('lifeStages', stage.id); store.setViewMode('list'); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${
                          isActive 
                            ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)]' 
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        {stage.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Generation */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold tracking-widest text-slate-400 uppercase mb-4">Generation</h3>
                <div className="flex flex-wrap gap-2">
                  {GENERATIONS.map(gen => {
                    const isActive = filters.generations.includes(gen.id);
                    return (
                      <button
                        key={gen.id}
                        onClick={() => { store.toggleFilter('generations', gen.id); store.setViewMode('list'); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${
                          isActive 
                            ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)]' 
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        {gen.label}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
            
            <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
              <div className="text-sm font-medium text-center text-slate-300">
                <span className="text-emerald-400 font-bold">{getFilteredCount}</span> relatives match filters
              </div>
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
