import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  {
    target: 'tree-canvas',
    title: 'Welcome to your family tree!',
    content: 'This is your infinite canvas. Drag to move around, scroll to zoom.',
  },
  {
    target: 'tree-canvas', // simplified from node-focus
    title: 'This is you!',
    content: 'Click on any person to see their full profile.',
  },
  {
    target: 'add-person-btn-desktop',
    title: 'Grow your tree',
    content: 'Add family members using this button. You can add parents, children, and spouses.',
  },
  {
    target: 'side-panel',
    title: 'Add photos and events',
    content: 'Upload photos to bring your family history to life.',
  },
  {
    target: 'tree-canvas',
    title: 'You\'re ready!',
    content: 'Let\'s build your family tree.',
    isLast: true
  }
];

const seenTrees = new Set<string>();

export default function OnboardingTour({ treeId }: { treeId: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const updateRect = useCallback(() => {
    if (!show) return;
    let targetId = steps[currentStep].target;
    // Fallback for mobile if desktop add person isn't there
    if (targetId === 'add-person-btn-desktop' && window.innerWidth < 768) {
      targetId = 'add-person-btn';
    }
    const el = document.getElementById(targetId);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [currentStep, show]);

  useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [updateRect]);

  useEffect(() => {
    const key = `tree_tour_seen_${treeId}`;
    if (!seenTrees.has(key)) {
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [treeId]);

  if (!show) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const key = `tree_tour_seen_${treeId}`;
    seenTrees.add(key);
    setShow(false);
  };

  const step = steps[currentStep];
  
  // Create clip-path for spotlight
  const clipPathBase = `polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%`;
  let clipPath = clipPathBase + ')';
  
  if (targetRect) {
    const { left, top, width, height } = targetRect;
    const padding = 8; // padding around the element
    const rL = Math.max(0, left - padding);
    const rT = Math.max(0, top - padding);
    const rR = Math.min(window.innerWidth, left + width + padding);
    const rB = Math.min(window.innerHeight, top + height + padding);
    
    // Create a cutout by tracing from outer edge, inward to the rect, around it, and back out
    clipPath = `polygon(
      0% 0%, 
      0% 100%, 
      100% 100%, 
      100% 0%, 
      0% 0%, 
      ${rL}px 0%, 
      ${rL}px ${rB}px, 
      ${rR}px ${rB}px, 
      ${rR}px ${rT}px, 
      ${rL}px ${rT}px, 
      ${rL}px 0%
    )`;
  }

  // Position tooltip based on target rect
  let tooltipStyle: React.CSSProperties = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  if (targetRect) {
    const { left, top, width, height } = targetRect;
    
    // Logic to place tooltip near the spotlight but not overlapping
    const spaceBelow = window.innerHeight - (top + height);
    const spaceAbove = top;
    
    if (spaceBelow > 250) {
      tooltipStyle = { top: top + height + 24, left: Math.max(24, Math.min(window.innerWidth - 350, left + width / 2 - 175)) };
    } else if (spaceAbove > 250) {
      tooltipStyle = { top: top - 200, left: Math.max(24, Math.min(window.innerWidth - 350, left + width / 2 - 175)) };
    } else {
      // Default center if no space
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] pointer-events-none">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ clipPath }}
          className="absolute inset-0 bg-black/60 pointer-events-auto transition-all duration-500 ease-in-out"
          onClick={handleNext}
        />
        
        <motion.div 
          key={currentStep}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          style={targetRect ? { position: 'absolute', ...tooltipStyle } : { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-auto border-t-4 border-[#e76f2f] pointer-events-auto z-[101] transition-all duration-500"
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-800 mb-2">{step.title}</h3>
            <p className="text-slate-600 leading-relaxed text-sm">{step.content}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all ${i === currentStep ? 'w-4 bg-[#e76f2f]' : 'w-1.5 bg-slate-200'}`} 
                />
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              {!step.isLast && (
                <button 
                  onClick={handleComplete}
                  className="text-sm font-medium text-slate-400 hover:text-slate-600"
                >
                  Skip
                </button>
              )}
              <button 
                onClick={handleNext}
                className="bg-[#e76f2f] hover:bg-[#d56124] text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {step.isLast ? 'Start Building' : 'Next'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
