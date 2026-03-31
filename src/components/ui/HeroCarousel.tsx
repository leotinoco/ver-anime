'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroItem {
  slug: string;
  title: string;
  cover: string;
  synopsis?: string;
  type?: string;
  year?: number;
}

export default function HeroCarousel({ items }: { items: HeroItem[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  if (!items || items.length === 0) return <div className="h-[70vh] w-full bg-[#141414]" />;

  const current = items[index];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <div className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden group">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.6 },
          }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Background Image with Gradients */}
          <div className="absolute inset-0 w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={current.cover}
              alt={current.title}
              className="w-full h-full object-cover md:object-[center_10%] opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="absolute bottom-[13%] md:bottom-[23%] left-4 md:left-12 max-w-2xl z-10">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl tracking-tighter"
            >
              {current.title}
            </motion.h2>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center gap-3 text-sm md:text-base font-bold text-gray-300 mb-6"
            >
              <span className="text-green-500 uppercase tracking-widest text-xs">Recomendado</span>
              <span className="border border-white/20 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded text-white">{current.type || "Obra Maestra"}</span>
              <span className="text-gray-400">{current.year || "Crítica"}</span>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-gray-200 text-sm md:text-lg mb-8 line-clamp-3 md:line-clamp-4 max-w-xl drop-shadow-md font-medium leading-relaxed"
            >
              {current.synopsis || "Una experiencia cinematográfica inolvidable. Disfruta de la mejor animación japonesa con una narrativa profunda y visuales espectaculares."}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <Link 
                href={`/anime/${current.slug}`}
                className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded md:text-lg font-black hover:bg-neutral-200 transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                <Play className="w-5 h-5 md:w-6 md:h-6 fill-black" />
                Ver Ahora
              </Link>
              
              <Link 
                href={`/anime/${current.slug}`}
                className="flex items-center gap-2 bg-zinc-800/80 backdrop-blur-md text-white px-8 py-3 rounded md:text-lg font-black hover:bg-zinc-700 transition-all hover:scale-105 active:scale-95"
              >
                <Info className="w-5 h-5 md:w-6 md:h-6" />
                Detalles
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 md:px-8 z-20 pointer-events-none">
        <button 
          onClick={prevSlide}
          aria-label="Diapositiva anterior"
          className="pointer-events-auto p-2 rounded-full bg-black/20 hover:bg-black/50 text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft size={48} aria-hidden="true" />
        </button>
        <button 
          onClick={nextSlide}
          aria-label="Diapositiva siguiente"
          className="pointer-events-auto p-2 rounded-full bg-black/20 hover:bg-black/50 text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronRight size={48} aria-hidden="true" />
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-10 right-4 md:right-12 flex gap-3 z-30">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setIndex(i);
            }}
            className={`h-1.5 transition-all duration-300 rounded-full ${i === index ? 'w-8 bg-primary shadow-lg shadow-primary/50' : 'w-4 bg-white/20 hover:bg-white/50'}`}
            aria-label={`Ir a la diapositiva ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
