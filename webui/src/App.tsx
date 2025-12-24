import { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Timeline } from './components/Timeline';
import { LetterView } from './components/LetterView';
import { AuthGate } from './components/AuthGate';
import type { Letter } from './models';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User } from 'lucide-react';
import clsx from 'clsx';

function App() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [selectedPenPal, setSelectedPenPal] = useState<string | null>(null);
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'sidebar' | 'timeline'>('timeline');
  const [direction, setDirection] = useState(0);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const switchTab = (tab: 'sidebar' | 'timeline') => {
    if (tab === activeTab) return;
    const newDir = tab === 'timeline' ? 1 : -1;
    setDirection(newDir);
    setActiveTab(tab);
  };

  // Back button handler for mobile
  const handleBack = () => {
    setSelectedLetterId(null);
  };

  // Load data
  useEffect(() => {
    fetch('/data/letters.json')
      .then(res => res.json())
      .then((data: Letter[]) => {
        const sorted = data.sort((a, b) => b.timestamp - a.timestamp);
        setLetters(sorted);
      })
      .catch(err => console.error("Failed to load letters:", err));
  }, []);

  // Derived state
  const penPals = useMemo(() => {
    const names = new Set(letters.map(l => l.penPal));
    return Array.from(names).sort();
  }, [letters]);

  const filteredLetters = useMemo(() => {
    if (!selectedPenPal || selectedPenPal === 'all') return letters;
    return letters.filter(l => l.penPal === selectedPenPal);
  }, [letters, selectedPenPal]);

  const selectedLetter = useMemo(() => {
    return letters.find(l => l.id === selectedLetterId) || null;
  }, [letters, selectedLetterId]);


  return (
    <AuthGate>
      <div className="flex h-screen w-full bg-paper text-stone-800 font-sans overflow-hidden antialiased relative">
        
        {/* Mobile View Structure */}
        {isMobile && (
          <>
             {/* Content Area (Tabs) */}
             <div className="flex-1 relative overflow-hidden pb-[76px]">
              <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                <motion.div
                  key={activeTab}
                  custom={direction}
                  variants={{
                    enter: (direction: number) => ({
                      x: direction > 0 ? '100%' : '-100%',
                      opacity: 0
                    }),
                    center: {
                      x: 0,
                      opacity: 1
                    },
                    exit: (direction: number) => ({
                      x: direction < 0 ? '100%' : '-100%',
                      opacity: 0
                    })
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 600, damping: 45 },
                    opacity: { duration: 0.15 }
                  }}
                  className="absolute inset-0"
                >
                  {activeTab === 'sidebar' ? (
                    <Sidebar
                      penPals={penPals}
                      selectedPenPal={selectedPenPal}
                      onSelect={(name) => {
                        setSelectedPenPal(name);
                        switchTab('timeline');
                      }}
                      letters={letters}
                    />
                  ) : (
                    <Timeline
                      letters={filteredLetters}
                      selectedLetterId={selectedLetterId}
                      onSelect={setSelectedLetterId}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 z-20">
              <div className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-[32px] py-2 px-3 flex justify-around items-center h-16 max-w-sm mx-auto">
                {[
                  { id: 'sidebar', label: '笔友', icon: User },
                  { id: 'timeline', label: '时光轴', icon: Mail }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => switchTab(tab.id as any)}
                      className="relative flex-1 flex flex-col items-center justify-center gap-0.5 outline-none"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTabPill"
                          className="absolute inset-0 bg-teal-500/10 rounded-2xl z-0"
                          transition={{ type: "spring", bounce: 0.1, duration: 0.25 }}
                        />
                      )}
                      <motion.div
                        animate={{
                          scale: isActive ? 1.1 : 1,
                          color: isActive ? '#0d9488' : '#a8a29e'
                        }}
                        className="z-10 relative"
                      >
                        <Icon size={22} />
                      </motion.div>
                      <span className={clsx(
                        "text-[10px] font-bold uppercase tracking-widest z-10 transition-colors duration-300",
                        isActive ? "text-teal-700" : "text-stone-400"
                      )}>
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Overlay Letter View */}
            <AnimatePresence>
              {selectedLetterId && (
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 40, stiffness: 500 }}
                  className="fixed inset-0 z-[100] bg-[#f8f6f2]"
                >
                  <LetterView
                    letter={selectedLetter}
                    onBack={handleBack}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Desktop View Structure */}
        {!isMobile && (
          <>
            <Sidebar
              penPals={penPals}
              selectedPenPal={selectedPenPal}
              onSelect={(name) => {
                setSelectedPenPal(name);
                setSelectedLetterId(null);
              }}
              letters={letters}
            />
            <Timeline
              letters={filteredLetters}
              selectedLetterId={selectedLetterId}
              onSelect={setSelectedLetterId}
            />
            
            {/* Desktop Letter View / Empty State */}
            <div className="flex-1 relative bg-[#f8f6f2] min-w-0">
               <AnimatePresence mode="wait">
                  {selectedLetterId ? (
                     <motion.div
                       key="letter"
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: 20 }}
                       transition={{ duration: 0.2 }}
                       className="absolute inset-0"
                     >
                       <LetterView
                         letter={selectedLetter}
                         onBack={handleBack}
                       />
                     </motion.div>
                  ) : (
                     <div key="empty" className="h-full flex items-center justify-center text-stone-300">
                        <LetterView letter={null} />
                     </div>
                  )}
               </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </AuthGate>
  );
}

export default App;
