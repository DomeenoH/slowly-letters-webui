import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import clsx from 'clsx';
import type { Letter } from '../models';
import { ArrowUpRight, ArrowDownLeft, Inbox, Search, X, Image as ImageIcon } from 'lucide-react';

interface TimelineProps {
    letters: Letter[];
    selectedLetterId: string | null;
    onSelect: (id: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ letters, selectedLetterId, onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLetters = useMemo(() => {
        if (!searchQuery.trim()) return letters;
        const q = searchQuery.toLowerCase();
        return letters.filter(l =>
            l.content.toLowerCase().includes(q) ||
            l.penPal.toLowerCase().includes(q) ||
            l.date.toLowerCase().includes(q)
        );
    }, [letters, searchQuery]);

    return (
        <section className="w-80 border-r border-stone-200 h-screen overflow-hidden flex flex-col bg-white/50 backdrop-blur-sm shrink-0">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md z-10 px-6 pt-8 pb-6 border-b border-stone-100/50">
                <div className="flex items-center gap-2 text-stone-400 mb-1">
                    <Inbox size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">时光轴</span>
                </div>
                <h2 className="font-serif font-bold text-xl text-ink">通信往来</h2>

                {/* Search Bar */}
                <div className="mt-6 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={14} />
                    <input
                        type="text"
                        placeholder="搜索信件内容..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-stone-100/50 border-none rounded-full py-2 pl-9 pr-8 text-xs font-medium placeholder:text-stone-300 focus:ring-1 focus:ring-teal-500/30 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <span className="text-[10px] tabular-nums font-bold text-stone-500 bg-stone-200/50 px-2 py-0.5 rounded">
                        {filteredLetters.length} 封信件
                    </span>
                    {searchQuery && (
                        <span className="text-[10px] text-stone-400 animate-in fade-in slide-in-from-left-2">
                            匹配结果
                        </span>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-stone-100/50">
                {filteredLetters.length > 0 ? (
                    filteredLetters.map(letter => (
                        <button
                            key={letter.id}
                            onClick={() => onSelect(letter.id)}
                            className={clsx(
                                "w-full text-left px-6 py-7 transition-all duration-300 group relative",
                                selectedLetterId === letter.id ? "bg-white shadow-inner" : "hover:bg-white/40"
                            )}
                        >
                            {selectedLetterId === letter.id && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600" />
                            )}

                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                    {format(new Date(letter.timestamp), 'yyyy.MM.dd')}
                                </span>
                                <div className={clsx(
                                    "p-1 rounded-full text-white transition-transform transition-colors duration-300",
                                    letter.direction === 'out'
                                        ? "bg-stone-200 group-hover:bg-stone-800"
                                        : "bg-stone-200 group-hover:bg-teal-600"
                                )}>
                                    {letter.direction === 'out' ? (
                                        <ArrowUpRight size={10} />
                                    ) : (
                                        <ArrowDownLeft size={10} />
                                    )}
                                </div>
                            </div>

                            <h3 className={clsx(
                                "font-serif font-bold text-sm mb-2 transition-colors flex items-center gap-2",
                                selectedLetterId === letter.id ? "text-ink" : "text-stone-600 group-hover:text-ink"
                            )}>
                                {letter.direction === 'out' ? '寄给 ' : '来自 '}{letter.penPal}
                                {letter.attachments && letter.attachments.length > 0 && (
                                    <span title="包含附件" className="inline-flex items-center justify-center text-stone-400">
                                        <ImageIcon size={12} className="opacity-70" />
                                    </span>
                                )}
                            </h3>

                            <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed font-serif italic opacity-70 group-hover:opacity-100 transition-opacity">
                                {letter.content.substring(0, 80).replace(/[#*]/g, '')}...
                            </p>
                        </button>
                    ))
                ) : (
                    <div className="p-12 text-center">
                        <p className="text-xs font-serif italic text-stone-400">没有找到相关信件</p>
                    </div>
                )}
            </div>
        </section>
    );
};
