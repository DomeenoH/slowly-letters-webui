import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Letter } from '../models';
import { Clock, Languages, X as CloseIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LetterViewProps {
    letter: Letter | null;
    onBack?: () => void;
}

export const LetterView: React.FC<LetterViewProps> = ({ letter, onBack }) => {
    const [showTranslation, setShowTranslation] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (!letter) {
        return (
            <main className="flex-1 h-screen flex items-center justify-center bg-[#f8f6f2] text-stone-300">
                <div className="text-center animate-in fade-in duration-700">
                    <div className="w-20 h-20 border-2 border-stone-200 rounded-full flex items-center justify-center mx-auto mb-6 opacity-30">
                        <Languages size={28} />
                    </div>
                    <p className="font-serif text-xl italic tracking-widest text-stone-400 px-6 text-center">挑选一封信，静心阅读</p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 h-screen overflow-y-auto bg-[#f8f6f2] selection:bg-teal-100/50">
            <div className="min-h-full py-6 md:py-12 px-4 md:px-6 flex flex-col items-center">

                {/* Fixed Top Controls */}
                <div className="w-full max-w-3xl flex justify-between items-center mb-6 md:mb-8 px-2 md:px-4">
                    <div className="flex items-center gap-4 text-stone-500">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="md:hidden p-2 -ml-2 hover:bg-stone-200 rounded-full transition-colors flex items-center gap-1 text-stone-600"
                            >
                                <CloseIcon size={20} className="rotate-90" />
                                <span className="text-xs font-bold">返回</span>
                            </button>
                        )}
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
                            {letter.direction === 'in' ? '收到' : '寄出'}
                        </span>
                    </div>
                </div>

                {/* The Paper Sheet */}
                <div className="w-full max-w-3xl paper-sheet relative px-6 md:px-12 py-12 md:py-20 rounded-sm mb-12 md:mb-20 min-h-[80vh]">

                    {/* Header */}
                    <header className="mb-12 md:mb-20">
                        <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.3em] text-stone-400 uppercase mb-4 md:mb-6">
                            <span>{letter.penPal}</span>
                            <span className="opacity-30">•</span>
                            <span className="flex items-center gap-2">
                                <Clock size={12} />
                                {format(new Date(letter.timestamp), 'p', { locale: zhCN })}
                            </span>
                        </div>

                        <h1 className="font-serif text-2xl md:text-4xl text-ink font-bold leading-tight">
                            {format(new Date(letter.timestamp), 'yyyy年 MMMM do', { locale: zhCN })}
                        </h1>

                        <div className="mt-6 md:mt-8 w-12 h-0.5 bg-stone-200" />
                    </header>

                    {/* Content Section */}
                    <article className="prose-premium whitespace-pre-wrap break-words">
                        <ReactMarkdown>
                            {showTranslation && letter.translatedContent ? letter.translatedContent : letter.content}
                        </ReactMarkdown>
                    </article>

                    {/* Stats Footer */}
                    <div className="mt-20 pt-10 border-t border-stone-100 flex justify-between items-center text-[10px] font-bold text-stone-400 tracking-widest uppercase">
                        <span>{letter.wordCount} 个字符</span>
                        <span>SLOWLY 档案室</span>
                    </div>
                </div>

                {/* Attachments Section (Outside the paper for better spacing) */}
                {letter.attachments.length > 0 && (
                    <div className="w-full max-w-3xl pb-24">
                        <div className="flex items-center gap-3 mb-10 px-4">
                            <div className="h-px flex-1 bg-stone-200" />
                            <h3 className="font-sans font-bold text-stone-400 uppercase tracking-[0.3em] text-[10px]">
                                随信附图 ({letter.attachments.length})
                            </h3>
                            <div className="h-px flex-1 bg-stone-200" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 px-4">
                            {letter.attachments.map((url, i) => (
                                <div key={i} className="group relative">
                                    <div
                                        className="bg-white p-3 shadow-2xl transform transition-all duration-500 group-hover:-translate-y-2 group-hover:rotate-1 cursor-zoom-in"
                                        onClick={() => setSelectedImage(url)}
                                    >
                                        <div className="aspect-[4/5] overflow-hidden bg-stone-100">
                                            <img
                                                src={url}
                                                alt={`附件 ${i + 1}`}
                                                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                                            />
                                        </div>
                                        <div className="mt-4 pb-2 text-center overflow-hidden">
                                            <p className="text-[10px] font-serif italic text-stone-400">Captured in the moment No.{i + 1}</p>
                                        </div>
                                    </div>
                                    {/* Subtle tape effect */}
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-8 bg-white/40 backdrop-blur-sm rotate-2 opacity-50 pointer-events-none shadow-sm" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Translation Button */}
            <AnimatePresence>
                {letter.translatedContent && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowTranslation(!showTranslation)}
                        className="fixed bottom-8 right-8 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-white shadow-xl border border-stone-100 text-stone-600 font-medium hover:text-teal-600 hover:border-teal-500 transition-colors"
                    >
                        <Languages size={18} />
                        <span>{showTranslation ? '显示原文' : '查看翻译'}</span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/90 p-10 cursor-zoom-out"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.button
                            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
                            onClick={() => setSelectedImage(null)}
                        >
                            <CloseIcon size={32} />
                        </motion.button>
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={selectedImage}
                            className="max-w-full max-h-full object-contain shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
};
