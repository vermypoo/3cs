import React from 'react';
import { motion } from 'motion/react';
import { Service } from '../types';

interface ServicesProps {
  availableServices: Service[];
}

export default function Services({ availableServices }: ServicesProps) {
  return (
    <section className="py-24 bg-slate-background text-white" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-center justify-center gap-4 uppercase">
            <span className="w-8 h-1 bg-blue-600 rounded-full"></span> 
            Our Specialities
            <span className="w-8 h-1 bg-blue-600 rounded-full"></span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Precision-led detailing services tailored to your vehicle's specific needs. We use only premium products for lasting results.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {availableServices.map((service, index) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-blue-500/40 transition-all duration-500 service-card-hover cursor-default"
            >
              <div className="mb-6 overflow-hidden h-40 -mx-8 -mt-8 rounded-t-2xl">
                {service.image && (
                  <img 
                    src={service.image} 
                    alt={service.name} 
                    className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-110 group-hover:scale-100"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-bold uppercase tracking-tight text-white group-hover:text-blue-400 transition-colors">{service.name}</h3>
                <span className="block text-blue-400 font-mono font-bold text-base mt-0.5">{service.price}</span>
              </div>
              <p className="text-slate-400 text-xs mb-6 leading-relaxed min-h-[3.5rem]">{service.description}</p>
              
              <button 
                onClick={() => {
                  const form = document.getElementById('booking-form');
                  form?.scrollIntoView({ behavior: 'smooth' });
                  const select = document.getElementById('service-select') as HTMLSelectElement;
                  if (select) select.value = service.id;
                }}
                className="w-full py-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-white hover:text-slate-950 transition-all font-bold uppercase tracking-widest text-[10px]"
              >
                Select Package
              </button>
            </motion.div>
          ))}
          {availableServices.length === 0 && (
            <div className="col-span-full py-20 text-center glass border-slate-800 rounded-3xl">
              <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Awaiting fresh package deployment...</p>
              <p className="text-slate-700 text-[10px] mt-2 uppercase tracking-widest">Admin defined schedules pending</p>
            </div>
          )}
        </div>

        <div className="mt-16 text-center space-y-2">
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold">
            All appointments require a <span className="text-blue-500">non-refundable deposit</span> to confirm booking
          </p>
          <p className="text-slate-600 text-[8px] uppercase tracking-[0.2em]">
            * Final price may vary based on vehicle size, condition, and location.
          </p>
        </div>
      </div>
    </section>
  );
}
