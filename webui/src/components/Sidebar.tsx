import { Mail, User } from 'lucide-react';
import clsx from 'clsx';
import type { Letter } from '../models';

interface SidebarProps {
    penPals: string[];
    selectedPenPal: string | null;
    onSelect: (name: string) => void;
    letters: Letter[];
}

export const Sidebar: React.FC<SidebarProps> = ({ penPals, selectedPenPal, onSelect, letters }) => {
    return (
        <aside className="w-full md:w-64 border-r border-stone-200 h-screen bg-stone-50 flex flex-col shrink-0 pb-20 md:pb-0">
            <div className="p-6">
                <h1 className="text-2xl font-serif font-bold text-ink">慢慢来</h1>
                <p className="text-xs text-stone-500 mt-1 uppercase tracking-tighter">Slowly Letters Archive</p>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                <button
                    onClick={() => onSelect('all')}
                    className={clsx(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                        !selectedPenPal || selectedPenPal === 'all'
                            ? "bg-stone-800 text-white shadow-lg translate-x-1"
                            : "text-stone-600 hover:bg-stone-200"
                    )}
                >
                    <Mail size={18} />
                    <span>全部信件</span>
                    <span className="ml-auto text-xs opacity-70">{letters.length}</span>
                </button>

                <div className="pt-6 pb-2">
                    <p className="px-4 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">笔友列表</p>
                </div>

                {penPals.map(name => {
                    const count = letters.filter(l => l.penPal === name).length;
                    return (
                        <button
                            key={name}
                            onClick={() => onSelect(name)}
                            className={clsx(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                selectedPenPal === name
                                    ? "bg-white text-ink shadow-sm border border-stone-100 translate-x-1"
                                    : "text-stone-600 hover:bg-stone-100"
                            )}
                        >
                            <User size={18} className={selectedPenPal === name ? "text-teal-600" : "text-stone-400"} />
                            <span>{name}</span>
                            <span className="ml-auto text-[10px] tabular-nums text-stone-400 font-bold bg-stone-100 px-2 py-0.5 rounded-full">{count}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-stone-200 bg-stone-100/50">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">总信件</p>
                        <p className="text-xl font-serif font-bold text-ink tracking-tighter">{letters.length}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">总字数</p>
                        <p className="text-xl font-serif font-bold text-ink tracking-tighter">
                            {Math.round(letters.reduce((acc, l) => acc + (l.wordCount || 0), 0) / 1000)}k
                        </p>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-stone-200/50">
                    <p className="text-[9px] text-stone-400 leading-tight">
                        记录一段跨越时空的通信史。<br />
                        由 Antigravity 整理制作。
                    </p>
                </div>
            </div>
        </aside>
    );
};
