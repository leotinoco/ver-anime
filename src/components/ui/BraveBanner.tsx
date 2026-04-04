'use client';

import { useState, useEffect } from 'react';
import { X, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BraveBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isHidden = localStorage.getItem('hideBraveBanner');
    if (!isHidden) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hideBraveBanner', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-gradient-to-r from-[#ff1b1b] via-[#fb542b] to-[#ff1b1b] text-white relative overflow-hidden z-40 border-b border-black/10 shadow-xl"
        >
          {/* Main content with padding-top to clear the fixed navbar height (approx 80px) */}
          <div className="pt-[72px]"> 
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-50%] left-[-10%] w-[40%] h-[200%] bg-white rotate-12 blur-3xl"></div>
            <div className="absolute top-[-50%] right-[-10%] w-[40%] h-[200%] bg-black rotate-12 blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-white p-1.5 rounded-xl shadow-lg">
                <img 
                  src="https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/brave.svg" 
                  alt="Brave Logo" 
                  className="w-8 h-8 md:w-10 md:h-10"
                />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-sm md:text-base flex items-center gap-2">
                  ¡Lleva tu experiencia al siguiente nivel con Brave!
                  <span className="hidden sm:inline-block bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">Recomendado</span>
                </h3>
                <p className="text-white/90 text-xs md:text-sm max-w-2xl leading-tight">
                  Disfruta de una navegación <span className="font-bold">3 veces más rápida</span>, bloqueo automático de anuncios y privacidad total. Navega sin interrupciones.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="hidden lg:flex items-center gap-4 text-xs text-white/80 mr-4">
                <div className="flex items-center gap-1">
                  <Zap size={14} className="text-yellow-300" />
                  <span>Más Veloz</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck size={14} className="text-green-300" />
                  <span>Privacidad Total</span>
                </div>
              </div>

              <a 
                href="https://brave.com/download" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 md:flex-none bg-white text-[#fb542b] font-bold px-6 py-2 rounded-full text-sm hover:bg-zinc-100 transition-all shadow-md flex items-center justify-center gap-2 group whitespace-nowrap"
              >
                Descargar Brave
                <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <button 
                onClick={handleClose}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors order-first md:order-last"
                aria-label="Cerrar banner"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
