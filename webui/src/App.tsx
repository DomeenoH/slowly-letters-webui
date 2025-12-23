import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Timeline } from './components/Timeline';
import { LetterView } from './components/LetterView';
import type { Letter } from './models';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [selectedPenPal, setSelectedPenPal] = useState<string | null>(null);
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);

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
    <div className="flex h-screen w-full bg-paper text-stone-800 font-sans overflow-hidden antialiased">
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

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedLetterId || 'empty'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <LetterView letter={selectedLetter} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
