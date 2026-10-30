import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ImageIcon, Plus, Cross, ChevronDown, ChevronUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Person } from '../../types';
import { KinshipStats } from '../../lib/kinship';

export type PersonNodeData = Person & {
  isSelected?: boolean;
  scale?: number;
  kinship?: KinshipStats;
  visible?: boolean;
};

const PersonNodeComponent = ({ data, selected }: NodeProps<PersonNodeData>) => {
  const [isKinshipExpanded, setIsKinshipExpanded] = useState(false);

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'male': return '#3b82f6';
      case 'female': return '#ec4899';
      case 'other': return '#8b5cf6';
      default: return '#94a3b8';
    }
  };

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'male': return '♂';
      case 'female': return '♀';
      case 'other': return '⚧';
      default: return '❓';
    }
  };

  const borderColor = !data.isLiving ? '#94a3b8' : getGenderColor(data.gender);
  const isSelected = selected || data.isSelected;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      return format(parseISO(dateStr), 'd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  const getAgeValues = () => {
    if (!data.dateOfBirth) return null;
    try {
      const birthDate = parseISO(data.dateOfBirth);
      const endDate = (data.isLiving === false && data.dateOfDeath) ? parseISO(data.dateOfDeath) : new Date();
      
      let years = endDate.getFullYear() - birthDate.getFullYear();
      let months = endDate.getMonth() - birthDate.getMonth();
      let days = endDate.getDate() - birthDate.getDate();

      if (days < 0) {
        months--;
        const previousMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
        days += previousMonth.getDate();
      }

      if (months < 0) {
        years--;
        months += 12;
      }

      if (years < 0) return null;

      return { years, months, days };
    } catch (e) {
      return null;
    }
  };

  const age = getAgeValues();

  return (
    <motion.div
      initial={{ scale: (data.scale || 1) * 0.8, opacity: 0 }}
      animate={{ 
        scale: data.visible === false ? 0 : (isSelected ? (data.scale || 1) * 1.03 : (data.scale || 1)), 
        opacity: data.visible === false ? 0 : 1 
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`w-[220px] bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:shadow-lg transition-shadow relative cursor-pointer group select-none ${!data.isLiving ? 'grayscale opacity-75' : ''}`}
      style={{
        border: `3px solid ${isSelected ? '#e76f2f' : borderColor}`,
        boxShadow: isSelected ? '0 0 0 3px rgba(231,111,47,0.3)' : undefined,
        pointerEvents: data.visible === false ? 'none' : 'auto',
      }}
    >
      {age && (
        <div 
          className="absolute -top-5 -right-5 w-[52px] h-[52px] rounded-full flex flex-col items-center justify-center shadow-md z-10"
          style={{ backgroundColor: borderColor, border: '2px solid white' }}
        >
          <span className="text-[16px] font-black leading-none text-white tracking-tighter" style={{ marginTop: '2px' }}>{age.years}</span>
          <span className="text-[9px] font-bold leading-none text-white/90 uppercase mt-0.5" style={{ marginBottom: '1px' }}>{age.months}M</span>
          <span className="text-[8px] font-bold leading-none text-white/80 uppercase">{age.days}D</span>
        </div>
      )}
      <Handle type="target" position={Position.Top} id="top-tgt" className="w-3 h-3 bg-[#e76f2f] border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Top} id="top-src" className="w-3 h-3 bg-[#e76f2f] border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <Handle type="target" position={Position.Left} id="left-tgt" className="w-3 h-3 bg-[#e76f2f] border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Left} id="left-src" className="w-3 h-3 bg-[#e76f2f] border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-center mb-3 relative">
        <div 
          className="w-[120px] h-[120px] rounded-full p-[3px]"
          style={{ backgroundColor: isSelected ? '#e76f2f' : borderColor }}
        >
          <div className="w-full h-full bg-slate-100 rounded-full overflow-hidden flex items-center justify-center relative">
            {data.thumbnailUrl || data.profilePhotoUrl ? (
              <img src={data.thumbnailUrl || data.profilePhotoUrl!} className="w-full h-full object-cover" alt="" />
            ) : (
              <div 
                className="w-full h-full flex flex-col items-center justify-center text-white"
                style={{ background: `linear-gradient(to bottom right, ${borderColor}, #1e293b)` }}
              >
                <ImageIcon className="w-8 h-8 opacity-50" />
              </div>
            )}
          </div>
        </div>
        
        {data.isLiving ? (
          <div className="absolute bottom-1 right-[30%] w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        ) : null}
      </div>

      <div className="text-center mb-2">
        <h3 className={`font-bold text-[15px] leading-tight line-clamp-2 ${!data.isLiving ? 'text-slate-500' : 'text-slate-900'}`}>
          {data.firstName} {data.middleName} {data.lastName}
        </h3>
        {data.maidenName && (
          <p className="text-xs text-slate-500 italic">née {data.maidenName}</p>
        )}
      </div>

      <div className="space-y-1 text-xs text-slate-600 mb-3 text-left">
        <div className="flex items-start gap-1">
          <span className="font-bold w-4">{getGenderIcon(data.gender)}</span>
          <span>{data.dateOfBirth ? `Born: ${formatDate(data.dateOfBirth)}` : 'Birth date unknown'}</span>
        </div>
        {data.birthPlace && (
          <div className="flex items-start gap-1">
            <span className="w-4">📍</span>
            <span className="truncate">{data.birthPlace}</span>
          </div>
        )}
        {data.currentLocation && (
          <div className="flex items-start gap-1">
            <span className="w-4">📍</span>
            <span className="truncate">Current: {data.currentLocation}</span>
          </div>
        )}
        {!data.isLiving && data.dateOfDeath && (
          <div className="flex items-start gap-1">
            <span className="font-bold w-4">✝</span>
            <span>Died: {formatDate(data.dateOfDeath)}</span>
          </div>
        )}
        {data.occupation && (
          <div className="italic text-slate-500 truncate mt-1">{data.occupation}</div>
        )}
      </div>

      <div className="border-t border-slate-100 pt-2 flex justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span><span className="font-bold text-slate-800">{data.kinship?.total || 0}</span> relatives</span>
        </div>
        <div className="flex items-center gap-1">
          <ImageIcon className="w-3 h-3" />
          <span>{data.photoCount || 0}</span>
        </div>
      </div>

      {/* Kinship Stats Summary */}
      {data.kinship && (
        <div className="bg-slate-50 border-t border-slate-100 flex flex-col object-contain">
          <div 
            onClick={(e) => {
              e.stopPropagation();
              setIsKinshipExpanded(!isKinshipExpanded);
            }}
            className="px-4 py-2 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Kinship Stats</span>
            {isKinshipExpanded ? <ChevronUp className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
          </div>
          
          <AnimatePresence>
            {isKinshipExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-3 flex flex-col pt-1 border-t border-slate-200/50">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    {/* Siblings: span 2, bigger */}
                    <div className="col-span-2 text-xs text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded flex justify-between items-center mb-1">
                      <span className="font-medium text-slate-500">Siblings</span> 
                      <span className="font-bold text-[#e76f2f]">{data.kinship.siblings}</span>
                    </div>
                    
                    <div className="text-[10px] text-slate-500 font-medium flex justify-between"><span>Uncles:</span> <span className="font-bold text-slate-700">{data.kinship.uncles}</span></div>
                    <div className="text-[10px] text-slate-500 font-medium flex justify-between"><span>Aunties:</span> <span className="font-bold text-slate-700">{data.kinship.aunties}</span></div>
                    
                    <div className="text-[10px] text-slate-500 font-medium flex justify-between"><span>Nieces:</span> <span className="font-bold text-slate-700">{data.kinship.nieces}</span></div>
                    <div className="text-[10px] text-slate-500 font-medium flex justify-between"><span>Nephews:</span> <span className="font-bold text-slate-700">{data.kinship.nephews}</span></div>
                    
                    <div className="text-[10px] text-slate-500 font-medium flex justify-between"><span>1st Cousins:</span> <span className="font-bold text-slate-700">{data.kinship.firstCousins}</span></div>
                    <div className="text-[10px] text-slate-500 font-medium flex justify-between"><span>2nd Cousins:</span> <span className="font-bold text-slate-700">{data.kinship.secondCousins}</span></div>
                  </div>
                  
                  <div className="h-px bg-slate-200 mt-2 mb-1.5"></div>
                  
                  <div className="flex flex-col gap-0.5">
                    <div className="text-[10px] text-slate-600 font-semibold flex justify-between items-center bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                       <span>Total Relatives</span>
                       <span className="text-xl font-bold text-[#e76f2f] leading-none mb-0.5">{data.kinship.total}</span>
                    </div>
                    <div className="text-[9px] text-slate-500 flex justify-between px-1">
                       <span>Paternal Side: {data.kinship.totalPaternal}</span>
                       <span>Maternal Side: {data.kinship.totalMaternal}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} id="bottom-src" className="w-3 h-3 bg-[#e76f2f] border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Bottom} id="bottom-tgt" className="w-3 h-3 bg-[#e76f2f] border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <Handle type="source" position={Position.Right} id="right-src" className="w-3 h-3 bg-[#e76f2f] border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Right} id="right-tgt" className="w-3 h-3 bg-[#e76f2f] border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
};

export default React.memo(PersonNodeComponent);
