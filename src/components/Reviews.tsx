import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Review } from '../types';

interface ReviewsProps {
  reviews: Review[];
}

export default function Reviews({ reviews }: ReviewsProps) {
  const [expandedId, setExpandedId] = React.useState<string | number | null>(null);

  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="py-24 bg-slate-950" id="reviews">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4"
          >
            Testimonials
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white uppercase tracking-tight mb-4">
            Customer <span className="text-blue-500">Experiences</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
            Don't just take our word for it. Here is what our clients have to say about our premium valeting services.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {reviews.map((review, i) => {
            const isExpanded = expandedId === (review.id || i);
            const isLong = review.content.length > 150;

            return (
              <motion.div
                key={review.id || i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-blue-500/40 transition-all duration-500 flex flex-col cursor-default"
              >
                <div className="mb-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-white group-hover:text-blue-400 transition-colors line-clamp-1">{review.author}</h4>
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(5)].map((_, starIndex) => (
                      <Star 
                        key={starIndex} 
                        size={10} 
                        className={starIndex < review.rating ? "fill-blue-500 text-blue-500" : "text-slate-800"} 
                      />
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <p className={`text-slate-400 text-[11px] mb-4 leading-relaxed italic transition-all duration-300 ${!isExpanded ? 'line-clamp-5 min-h-[5.5rem]' : ''}`}>
                    "{review.content}"
                  </p>
                  
                  {isLong && (
                    <button 
                      onClick={() => setExpandedId(isExpanded ? null : (review.id || i))}
                      className="text-[9px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 mb-6 transition-colors flex items-center gap-1 group/btn"
                    >
                      {isExpanded ? 'Show Less' : 'Read Full Review'}
                      <motion.span animate={{ rotate: isExpanded ? 180 : 0 }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </motion.span>
                    </button>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-800/50">
                  <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em]">{review.date || 'Verified Customer'}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
