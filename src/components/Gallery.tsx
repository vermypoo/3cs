import React from 'react';
import { motion } from 'motion/react';
import { Camera, ChevronRight } from 'lucide-react';
import { GalleryItem } from '../types';

interface GalleryProps {
  items: GalleryItem[];
}

export default function Gallery({ items }: GalleryProps) {
  if (items.length === 0) return null;

  return (
    <section className="py-24 bg-slate-background overflow-hidden" id="gallery">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-12 h-[1px] bg-blue-500"></div>
              <span className="text-blue-500 font-bold text-xs uppercase tracking-[0.3em]">Showcase</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none mb-6">
              Surgical <span className="text-blue-500">Precision</span>
            </h2>
            <p className="text-slate-500 max-w-xl text-lg font-medium leading-relaxed">
              Explore our portfolio of high-end valeting and detailing results across the UK's finest vehicles.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden md:flex items-center gap-3 text-slate-500 font-bold uppercase tracking-widest text-[10px] group cursor-pointer hover:text-white transition-colors"
          >
            <Camera size={14} className="text-blue-500" />
            <span>Full Portfolio</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative h-[450px] rounded-[2.5rem] overflow-hidden glass border-blue-500/10"
            >
              <img 
                src={item.url} 
                alt={item.caption || "Service Result"} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex flex-col gap-2">
                  <span className="text-blue-400 font-black text-[10px] uppercase tracking-[0.2em]">Verified Result</span>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight">{item.caption || "Premium Detail"}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
