import React, { useState, useMemo } from 'react';
import { FAQ as FAQType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, HelpCircle, Search, X } from 'lucide-react';

interface FAQProps {
  faqs: FAQType[];
}

export default function FAQ({ faqs }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const visibleFaqs = faqs.filter(f => f.isVisible !== false);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return visibleFaqs;
    const query = searchQuery.toLowerCase();
    return visibleFaqs.filter(f => 
      f.question.toLowerCase().includes(query) || 
      f.answer.toLowerCase().includes(query)
    );
  }, [visibleFaqs, searchQuery]);

  if (!visibleFaqs || visibleFaqs.length === 0) return null;

  return (
    <section className="py-24 bg-slate-background" id="faq">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
            <HelpCircle size={14} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Knowledge Base</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white uppercase tracking-tight">
            Frequently Asked <span className="text-blue-500">Questions</span>
          </h2>
          <p className="text-slate-500 mt-4 font-medium">Everything you need to know about our premium service.</p>
        </div>

        <div className="relative mb-12 max-w-xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-500" />
          </div>
          <input 
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-12 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium text-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div 
              key={faq.id || index}
              className={`glass rounded-3xl border transition-all duration-300 ${openIndex === index ? 'border-blue-500/30 bg-blue-500/5' : 'border-slate-800'}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left p-6 flex items-center justify-between gap-4"
              >
                <span className="text-base font-bold text-white tracking-tight">{faq.question}</span>
                <div className={`p-2 rounded-xl transition-all ${openIndex === index ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  {openIndex === index ? <Minus size={16} /> : <Plus size={16} />}
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-slate-400 text-sm leading-relaxed font-medium">
                      <div className="pt-2 border-t border-slate-800/50">
                        {faq.answer}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
