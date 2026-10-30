import React, { useMemo, useState } from 'react';
import { useTreeStore } from '../../store/treeStore';
import { isPersonVisible } from './TreeCanvas';
import { calculateAgeIn2026 } from './SmartFilterPanel';
import { parseISO, format, getMonth } from 'date-fns';
import { ChevronUp, ChevronDown, Venus, Mars, MapPin } from 'lucide-react';
import { getLocationColor } from '../../lib/locationColors';

export default function ListView() {
  const store = useTreeStore();
  const [sortConfig, setSortConfig] = useState<{key: 'name' | 'age' | 'gender' | 'location' | 'birthday'; direction: 'asc' | 'desc'}>({key: 'name', direction: 'asc'});
  
  const visiblePersons = useMemo(() => {
    let filtered = store.persons.filter(p => isPersonVisible(p, store.filters));
    
    return filtered.sort((a, b) => {
      let aVal, bVal;
      switch(sortConfig.key) {
        case 'name':
          aVal = `${a.firstName} ${a.lastName}`.toLowerCase();
          bVal = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'age':
          aVal = calculateAgeIn2026(a.dateOfBirth, a.dateOfDeath) || 0;
          bVal = calculateAgeIn2026(b.dateOfBirth, b.dateOfDeath) || 0;
          break;
        case 'gender':
          aVal = a.gender;
          bVal = b.gender;
          break;
        case 'location':
          aVal = (a.currentLocation || a.birthPlace || '').toLowerCase();
          bVal = (b.currentLocation || b.birthPlace || '').toLowerCase();
          break;
        case 'birthday':
          if (a.dateOfBirth) {
            const dA = parseISO(a.dateOfBirth);
            aVal = !isNaN(dA.getTime()) ? format(dA, 'MM-dd') : '99-99';
          } else {
            aVal = '99-99';
          }
          if (b.dateOfBirth) {
            const dB = parseISO(b.dateOfBirth);
            bVal = !isNaN(dB.getTime()) ? format(dB, 'MM-dd') : '99-99';
          } else {
            bVal = '99-99';
          }
          break;
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [store.persons, store.filters, sortConfig]);

  const summaryStats = useMemo(() => {
    let total = visiblePersons.length;
    let males = 0;
    let females = 0;
    let alive = 0;
    let deceased = 0;
    let birthdaysThisMonth = 0;
    let deathAnniversariesThisMonth = 0;
    let weddingAnniversariesThisMonth = 0;
    let cityCounts: Record<string, number> = {};
    const currentMonth = new Date().getMonth();

    visiblePersons.forEach(p => {
      if (p.gender === 'male') males++;
      else if (p.gender === 'female') females++;
      
      if (p.isLiving) alive++;
      else deceased++;

      if (p.dateOfBirth) {
        const d = parseISO(p.dateOfBirth);
        if (!isNaN(d.getTime()) && getMonth(d) === currentMonth) {
          birthdaysThisMonth++;
        }
      }
      
      if (p.dateOfDeath) {
        const d = parseISO(p.dateOfDeath);
        if (!isNaN(d.getTime()) && getMonth(d) === currentMonth) {
          deathAnniversariesThisMonth++;
        }
      }
      
      const loc = p.currentLocation || p.birthPlace || 'Unknown';
      cityCounts[loc] = (cityCounts[loc] || 0) + 1;
    });

    const visibleIds = new Set(visiblePersons.map(p => p.id));
    
    store.relationships.forEach(rel => {
      if (rel.type === 'spouse' && rel.marriageDate) {
        const d = parseISO(rel.marriageDate);
        if (!isNaN(d.getTime()) && getMonth(d) === currentMonth) {
          if (visibleIds.has(rel.person1Id) || visibleIds.has(rel.person2Id)) {
            weddingAnniversariesThisMonth++;
          }
        }
      }
    });

    const topCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1]);

    return { total, males, females, alive, deceased, topCities, birthdaysThisMonth, deathAnniversariesThisMonth, weddingAnniversariesThisMonth };
  }, [visiblePersons, store.relationships]);

  const handleSort = (key: 'name' | 'age' | 'gender' | 'location' | 'birthday') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortHeader = ({ label, sortKey }: { label: string, sortKey: 'name' | 'age' | 'gender' | 'location' | 'birthday' }) => (
    <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort(sortKey)}>
      <div className="flex items-center gap-2">
        {label}
        {sortConfig.key === sortKey && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}
      </div>
    </th>
  );

  const getActiveFiltersText = () => {
    const f = store.filters;
    const parts = [];
    if (f.demographics && f.demographics.length) parts.push(`Gender: ${f.demographics.join(', ')}`);
    if (f.birthMonths && f.birthMonths.length) parts.push(`Birth Month: ${f.birthMonths.map(m => format(new Date(2000, m, 1), 'MMM')).join(', ')}`);
    if (f.vitalStatus && f.vitalStatus.length) parts.push(`Vital Status: ${f.vitalStatus.join(', ')}`);
    if (f.locations && f.locations.length) parts.push(`Location: ${f.locations.join(', ')}`);
    if (f.lifeStages && f.lifeStages.length) parts.push(`Life Stage: ${f.lifeStages.join(', ')}`);
    if (f.generations && f.generations.length) parts.push(`Generation: ${f.generations.join(', ')}`);
    
    return parts.length > 0 ? parts.join(' | ') : 'No filters applied (Showing all)';
  };

  return (
    <div className="absolute inset-0 bg-slate-50 overflow-y-auto p-8 custom-scrollbar">
      <div className="max-w-4xl mx-auto pb-24">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 font-serif text-center">Relative Directory</h2>
        
        {/* Detailed Summary Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-2 font-serif text-center">Directory Summary</h3>
          <div className="text-center text-xs font-medium text-slate-500 mb-6 pb-4 border-b border-slate-100">
            {getActiveFiltersText()}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col justify-center text-left">
              <div className="text-sm text-slate-500 mb-1">Total Relatives</div>
              <div className="text-3xl font-bold text-[#e76f2f]">{store.persons.length}</div>
              {store.persons.length !== visiblePersons.length && (
                <div className="text-xs font-bold text-emerald-600 mt-1">{visiblePersons.length} match filter</div>
              )}
            </div>
            
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-left flex flex-col relative">
              <div className="text-sm text-slate-500 mb-2 w-full">Locations</div>
              <div className="flex flex-col gap-1.5 w-full flex-1 overflow-y-auto custom-scrollbar absolute inset-x-4 bottom-4 top-10 pr-2">
                {summaryStats.topCities.map(([city, count]) => {
                  const locColor = getLocationColor(city);
                  return (
                    <div key={city} className="flex justify-between items-center text-sm w-full">
                      <div className="flex items-center gap-1.5 mr-2 overflow-hidden w-[65%]">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: locColor }} />
                        <span className="font-medium text-slate-700 truncate" title={city}>{city}</span>
                      </div>
                      <span className="bg-slate-200 px-2 py-0.5 rounded-full text-xs font-black text-slate-800 border border-slate-300 shadow-sm">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-left flex flex-col justify-center">
              <div className="text-sm text-slate-500 mb-2">Gender</div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2" title="Males">
                  <Mars className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-sm font-bold text-slate-700">{summaryStats.males} Males</span>
                </div>
                <div className="flex items-center gap-2" title="Females">
                  <Venus className="w-4 h-4 text-pink-500 shrink-0" />
                  <span className="text-sm font-bold text-slate-700">{summaryStats.females} Females</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-left flex flex-col justify-center">
              <div className="text-sm text-slate-500 mb-2">Vital Status</div>
              <div className="flex flex-col gap-2 mt-1">
                <div className="text-sm font-bold text-emerald-600 truncate"><span className="text-[10px] mr-1">🟢</span> {summaryStats.alive} Living</div>
                <div className="text-sm font-bold text-slate-400 truncate"><span className="text-[10px] mr-1 opacity-50">⚫</span> {summaryStats.deceased} Deceas.</div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-left flex flex-col justify-center">
              <div className="text-sm text-slate-500 mb-2 truncate">This Month</div>
              <div className="flex flex-col gap-1.5">
                <div className="text-xs font-bold text-amber-600 truncate">🎂 {summaryStats.birthdaysThisMonth} Births</div>
                <div className="text-xs font-bold text-pink-500 truncate">💍 {summaryStats.weddingAnniversariesThisMonth} Anniv.</div>
                <div className="text-xs font-bold text-slate-500 truncate">🕯️ {summaryStats.deathAnniversariesThisMonth} Deaths</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <SortHeader label="Name" sortKey="name" />
                <SortHeader label="Age / Status" sortKey="age" />
                <SortHeader label="Birthday" sortKey="birthday" />
                <SortHeader label="Gender" sortKey="gender" />
                <SortHeader label="Current Location" sortKey="location" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visiblePersons.map(person => {
                const age = calculateAgeIn2026(person.dateOfBirth, person.dateOfDeath);
                const birthday = person.dateOfBirth ? format(parseISO(person.dateOfBirth), 'dd MMM') : '-';
                const locationLabel = person.currentLocation || person.birthPlace || 'Unknown';
                const locColor = getLocationColor(locationLabel);
                
                return (
                  <tr 
                    key={person.id} 
                    onClick={() => store.selectPerson(person.id)}
                    className={`cursor-pointer transition-colors ${!person.isLiving ? 'bg-slate-100 hover:bg-slate-200 grayscale opacity-90 text-slate-400' : 'bg-white hover:bg-slate-50'}`}
                    style={{ borderLeft: `6px solid ${!person.isLiving ? '#94a3b8' : locColor}` }}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`relative w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 ${!person.isLiving ? 'opacity-80' : ''}`}>
                          <div className="w-full h-full rounded-full overflow-hidden">
                            {person.thumbnailUrl || person.profilePhotoUrl ? (
                              <img src={person.thumbnailUrl || person.profilePhotoUrl} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: !person.isLiving ? '#94a3b8' : locColor, color: '#fff' }}>
                                {person.firstName.charAt(0)}{person.lastName.charAt(0)}
                              </div>
                            )}
                          </div>
                          {/* Online status indicator */}
                          {person.isLiving && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" title="Living" />
                          )}
                        </div>
                        <div>
                          <div className={`font-bold ${!person.isLiving ? 'text-slate-400' : 'text-slate-800'}`}>
                            {person.firstName} {person.middleName} {person.lastName}
                          </div>
                          {person.maidenName && <div className={`text-xs italic ${!person.isLiving ? 'text-slate-400' : 'text-slate-500'}`}>née {person.maidenName}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {age !== null && <span className="font-medium mr-2">{age} yrs</span>}
                      {!person.isLiving && person.dateOfDeath && (
                         <span className="text-xs text-slate-400">(Died {format(parseISO(person.dateOfDeath), 'yyyy')})</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {person.dateOfBirth ? (
                        <span className="font-medium">{format(parseISO(person.dateOfBirth), 'dd MMM')}</span>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      <div className="flex items-center">
                        {person.gender === 'male' ? (
                          <Mars className={`w-4 h-4 ${!person.isLiving ? 'text-slate-400' : 'text-blue-500'}`} />
                        ) : person.gender === 'female' ? (
                          <Venus className={`w-4 h-4 ${!person.isLiving ? 'text-slate-400' : 'text-pink-500'}`} />
                        ) : (
                          <span className="capitalize">{person.gender}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: locColor }} />
                        <span>{locationLabel !== 'Unknown' ? locationLabel : '-'}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {visiblePersons.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    No relatives match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
