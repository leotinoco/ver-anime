'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AnimeCard from './AnimeCard';
import { motion, AnimatePresence } from 'framer-motion';

interface CarouselProps {
  title: string;
  items: any[];
  isEpisode?: boolean;
}

export default function Carousel({ title, items, isEpisode = false }: CarouselProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isMoved, setIsMoved] = useState(false);

  const handleClick = (direction: 'left' | 'right') => {
    setIsMoved(true);
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
      
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-2 md:space-y-4 pt-8 pb-4">
      <h2 className="w-56 cursor-pointer text-xl md:text-2xl font-semibold text-[#e5e5e5] transition duration-200 hover:text-white px-4 md:px-12">
        {title}
      </h2>

      <div className="group relative">
        <AnimatePresence>
          {isMoved && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-0 top-0 bottom-0 z-40 flex w-12 cursor-pointer items-center justify-center bg-gradient-to-r from-[#141414] to-transparent hover:bg-[#141414]/80 transition-all"
              onClick={() => handleClick('left')}
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        <div 
          ref={rowRef}
          className="flex items-center gap-2 md:gap-4 overflow-x-scroll hide-scroll px-4 md:px-12 h-[260px] md:h-[350px]"
        >
          {items.map((item, id) => {
            const rawSlug = item.slug || '';
            const parsedSlug = isEpisode && item.number ? rawSlug.replace(new RegExp(`-${item.number}$`), '') : rawSlug;
            return (
              <AnimeCard 
                key={`${rawSlug}-${id}`}
                slug={parsedSlug}
                title={item.title || 'No Title'}
                cover={item.cover}
                type={item.type}
                episodeNumber={isEpisode ? item.number : undefined}
              />
            );
          })}
        </div>

        <div
          className="absolute right-0 top-0 bottom-0 z-40 flex w-12 cursor-pointer items-center justify-center bg-gradient-to-l from-[#141414] to-transparent hover:bg-[#141414]/80 transition-all opacity-0 group-hover:opacity-100"
          onClick={() => handleClick('right')}
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );
}
