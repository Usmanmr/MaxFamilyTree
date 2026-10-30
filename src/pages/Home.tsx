import { motion } from 'framer-motion';
import { Network, Users, Image as ImageIcon, Map, ChevronRight, Play, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#2c3e2f] font-serif flex flex-col overflow-x-hidden">
      {/* Navigation */}
      <nav className="h-24 px-6 max-w-7xl mx-auto w-full flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1b4332] flex items-center justify-center border-2 border-[#d4af37] shadow-lg">
            <Network className="w-5 h-5 text-[#d4af37]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-3xl text-[#1b4332] tracking-wide font-urdu pb-1">شجرہ نسب</span>
            <span className="text-xs text-[#52796f] tracking-widest uppercase">Family Heritage</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-[#2d6a4f]">
          <a href="#features" className="hover:text-[#d4af37] transition-colors border-b-2 border-transparent hover:border-[#d4af37] pb-1">Features</a>
          <a href="#about" className="hover:text-[#d4af37] transition-colors border-b-2 border-transparent hover:border-[#d4af37] pb-1">Our Heritage</a>
        </div>

        <div className="flex items-center gap-5">
          <Link to="/login" className="text-sm font-medium text-[#1b4332] hover:text-[#d4af37] transition-colors">Log in</Link>
          <Link to="/signup" className="bg-[#1b4332] hover:bg-[#081c15] border border-[#d4af37] text-[#d4af37] px-6 py-2.5 rounded-sm text-sm font-medium transition-colors shadow-md flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50">
            <span className="font-urdu text-lg pb-1">آغاز کریں</span> <span>(Start)</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto w-full px-6 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12 relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 rounded-full blur-sm -z-10 bg-[#d4af37]"></div>
        
        <div className="md:w-[60%] space-y-8 z-10 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-1.5 border border-[#d4af37] rounded-full text-sm text-[#1b4332] bg-[#d4af37]/10"
          >
            Preserving Roots for Generations
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.2] text-[#1b4332] font-urdu pb-4"
          >
            اپنے خاندان کی <br />
            <span className="text-[#d4af37] font-semibold text-6xl md:text-8xl">کہانی محفوظ کریں</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-[#40916c] leading-relaxed max-w-xl mx-auto md:mx-0 font-sans"
          >
            Build an interactive family tree, connect your roots, and preserve your ancestral heritage forever in a beautiful, infinite canvas. Map out your Shajra.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center md:justify-start gap-4"
          >
            <Link to="/signup" className="flex items-center gap-2 bg-[#1b4332] hover:bg-[#081c15] text-[#d4af37] border border-[#d4af37] px-8 py-4 rounded-sm font-medium transition-colors shadow-lg">
              <span className="font-urdu text-xl pb-1">آغاز کریں</span> (Begin) <ChevronRight className="w-4 h-4" />
            </Link>
            <button className="flex items-center gap-2 bg-[#fdfbf7] hover:bg-[#f3edd9] text-[#1b4332] border border-[#1b4332]/20 px-8 py-4 rounded-sm font-medium transition-colors shadow-sm">
              <Play className="w-4 h-4 fill-[#1b4332]" /> <span className="font-urdu text-xl pb-1">طریقہ دیکھیں</span>
            </button>
          </motion.div>
        </div>

        <div className="md:w-[40%] w-full relative h-[400px] md:h-[600px] z-10 flex items-center justify-center">
            {/* Visual Node Mockup */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-[5%] left-[5%] w-52 bg-[#fdfbf7] p-3 rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#d4af37]/30 z-20"
            >
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-[#1b4332] flex items-center justify-center border-2 border-[#d4af37] text-white font-bold text-2xl font-urdu pb-1">
                  م
                </div>
                <div>
                  <div className="font-bold text-[#1b4332] text-sm"><span className="font-urdu text-lg pb-1">محمد اسلم</span> (Aslam)</div>
                  <div className="text-[10px] text-[#52796f] mt-0.5 uppercase tracking-wide">Boomer • 1945 — 2012</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute top-[35%] right-[5%] w-52 bg-[#fdfbf7] p-3 rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#d4af37]/30 z-20"
            >
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-[#2d6a4f] flex items-center justify-center border-2 border-[#d4af37] text-white font-bold text-2xl font-urdu pb-1">
                  ف
                </div>
                <div>
                  <div className="font-bold text-[#1b4332] text-sm"><span className="font-urdu text-lg pb-1">فاطمہ</span> (Fatima)</div>
                  <div className="text-[10px] text-[#52796f] mt-0.5 uppercase tracking-wide">Gen X • 1975 —</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-[25%] left-[12%] w-52 bg-[#fdfbf7] p-3 rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#d4af37]/30 z-20"
            >
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-[#40916c] flex items-center justify-center border-2 border-[#d4af37] text-white font-bold text-2xl font-urdu pb-1">
                  ع
                </div>
                <div>
                  <div className="font-bold text-[#1b4332] text-sm"><span className="font-urdu text-lg pb-1">عمر</span> (Omar)</div>
                  <div className="text-[10px] text-[#52796f] mt-0.5 uppercase tracking-wide">Gen Z • 2002 —</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-[5%] right-[20%] w-52 bg-[#fdfbf7] p-3 rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#d4af37]/30 z-20"
            >
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-[#52796f] flex items-center justify-center border-2 border-[#d4af37] text-white font-bold text-2xl font-urdu pb-1">
                  ز
                </div>
                <div>
                  <div className="font-bold text-[#1b4332] text-sm"><span className="font-urdu text-lg pb-1">زینب</span> (Zainab)</div>
                  <div className="text-[10px] text-[#52796f] mt-0.5 uppercase tracking-wide">Gen Alpha • 2021 —</div>
                </div>
              </div>
            </motion.div>

            {/* Traditional Line connecting them */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" style={{ zIndex: 10 }}>
              <path d="M 120 100 C 120 200, 240 180, 240 280" stroke="#d4af37" strokeWidth="2" fill="none" strokeDasharray="8 4" />
              <path d="M 240 280 C 240 380, 140 360, 140 450" stroke="#d4af37" strokeWidth="2" fill="none" strokeDasharray="8 4" />
              <path d="M 140 450 C 140 520, 200 500, 220 550" stroke="#d4af37" strokeWidth="2" fill="none" strokeDasharray="8 4" />
            </svg>

            {/* Backdrop patterned circles */}
            <div className="w-72 h-72 rounded-full border border-[#d4af37]/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-dashed"></div>
            <div className="w-96 h-96 rounded-full border border-[#1b4332]/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-[#1b4332] py-24 text-[#fdfbf7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-5 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#d4af37] mb-4 font-urdu pb-2">وراثت <span className="font-sans text-2xl relative -top-2">(Heritage Features)</span></h2>
            <p className="text-[#95d5b2] max-w-2xl mx-auto font-sans">Everything you need to map out your ancestral lineage with respect and accuracy.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#081c15]/60 border border-[#2d6a4f] p-8 rounded-sm hover:-translate-y-1 hover:border-[#d4af37] transition-all duration-300">
               <div className="w-14 h-14 bg-[#2d6a4f] text-[#d4af37] rounded-full flex items-center justify-center mb-6 border border-[#d4af37]/30">
                 <Map className="w-7 h-7" />
               </div>
               <h3 className="text-xl font-bold text-white mb-3 font-urdu text-2xl pb-1">لامحدود کینوس <span className="font-sans text-sm relative -top-1 font-normal text-[#95d5b2] ml-1">(Infinite Tree)</span></h3>
               <p className="text-[#95d5b2] leading-relaxed font-sans text-sm">Drag, zoom, and pan around. Trace back your forefathers seamlessly through our vast interactive canvas.</p>
            </div>
            
            <div className="bg-[#081c15]/60 border border-[#2d6a4f] p-8 rounded-sm hover:-translate-y-1 hover:border-[#d4af37] transition-all duration-300">
               <div className="w-14 h-14 bg-[#2d6a4f] text-[#d4af37] rounded-full flex items-center justify-center mb-6 border border-[#d4af37]/30">
                 <BookOpen className="w-7 h-7" />
               </div>
               <h3 className="text-xl font-bold text-white mb-3 font-urdu text-2xl pb-1">تاریخ <span className="font-sans text-sm relative -top-1 font-normal text-[#95d5b2] ml-1">(Rich History)</span></h3>
               <p className="text-[#95d5b2] leading-relaxed font-sans text-sm">Record profound life events, migration stories, and ancestral birthplaces. Keep the tales of your elders alive.</p>
            </div>

            <div className="bg-[#081c15]/60 border border-[#2d6a4f] p-8 rounded-sm hover:-translate-y-1 hover:border-[#d4af37] transition-all duration-300">
               <div className="w-14 h-14 bg-[#2d6a4f] text-[#d4af37] rounded-full flex items-center justify-center mb-6 border border-[#d4af37]/30">
                 <Users className="w-7 h-7" />
               </div>
               <h3 className="text-xl font-bold text-white mb-3 font-urdu text-2xl pb-1">خاندان <span className="font-sans text-sm relative -top-1 font-normal text-[#95d5b2] ml-1">(Profiles)</span></h3>
               <p className="text-[#95d5b2] leading-relaxed font-sans text-sm">Create respectful profiles for each relative. Map clear relationships, spouses, offspring, and generations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 max-w-5xl mx-auto px-6 text-center">
        <div className="bg-[#f3edd9] border-2 border-[#d4af37] rounded-sm p-12 text-[#1b4332] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#d4af37] opacity-10 rounded-br-[100px]"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#d4af37] opacity-10 rounded-tl-[100px]"></div>
          
          <h2 className="text-3xl md:text-6xl font-bold mb-6 font-urdu pb-2">اپنی جڑیں تلاش کریں</h2>
          <p className="text-[#2d6a4f] text-lg mb-8 max-w-2xl mx-auto font-sans">The legacy you don't document is the history you lose. Start your Shajra-e-Nasab today and connect the generations.</p>
          <Link to="/signup" className="inline-flex items-center gap-2 bg-[#1b4332] hover:bg-[#081c15] text-[#d4af37] border border-[#d4af37] px-8 py-4 rounded-sm font-medium transition-colors shadow-lg">
            <span className="font-urdu text-2xl pb-1">شجرہ بنانا شروع کریں</span> <span className="font-sans">(Start Building)</span>
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#d4af37]/30 bg-[#fdfbf7] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1b4332] flex items-center justify-center border border-[#d4af37]">
              <Network className="w-4 h-4 text-[#d4af37]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-2xl text-[#1b4332] font-urdu pb-1 mt-1">شجرہ نسب</span>
            </div>
          </div>
          <div className="flex gap-6 text-sm text-[#40916c] font-sans">
            <a href="#" className="hover:text-[#1b4332]">Features</a>
            <a href="#" className="hover:text-[#1b4332]">Heritage</a>
            <a href="#" className="hover:text-[#1b4332]">Privacy</a>
            <a href="#" className="hover:text-[#1b4332]">Terms</a>
          </div>
          <div className="text-sm text-[#52796f] font-sans">© 2026 Shajra Heritage App</div>
        </div>
      </footer>
    </div>
  );
}
