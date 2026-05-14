'use client';

import { useRef, useEffect, useReducer } from 'react';
import { ChevronLeft, ChevronRight, Star, Calendar } from 'lucide-react';
import { m } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const recommendedAnimes = [
  {
    id: 1,
    title: "Sen to Chihiro no Kamikakushi",
    slug: "sen-to-chihiro-no-kamikakushi",
    englishTitle: "Spirited Away",
    image: "/img/recommended/sen_to_chihiro.avif",
    year: "2001",
    description: "Una niña se adentra en un mundo mágico de espíritus y dioses para salvar a sus padres.",
    rating: "8.6"
  },
  {
    id: 2,
    title: "Hotaru no Haka",
    slug: "hotaru-no-haka",
    englishTitle: "Grave of the Fireflies",
    image: "/img/recommended/hotaru_no_haka.avif",
    year: "1988",
    description: "Dos hermanos luchan por sobrevivir en Japón durante los últimos meses de la Segunda Guerra Mundial.",
    rating: "8.5"
  },
  {
    id: 3,
    title: "Cowboy Bebop",
    slug: "cowboy-bebop",
    englishTitle: "Cowboy Bebop",
    image: "/img/recommended/cowboy_bebop.avif",
    year: "1998",
    description: "Un equipo de cazarrecompensas viaja por el espacio en un emocionante western de ciencia ficción.",
    rating: "8.7"
  },
  {
    id: 4,
    title: "Monster",
    slug: "monster",
    englishTitle: "Monster",
    image: "/img/recommended/monster.avif",
    year: "2004",
    description: "Un neurocirujano persigue a un psicópata que una vez salvó, descubriendo una red de conspiraciones.",
    rating: "8.8"
  },
  {
    id: 5,
    title: "Bakemono no Ko",
    slug: "bakemono-no-ko",
    englishTitle: "The Boy and the Beast",
    image: "/img/recommended/bakemono_no_ko_premium.avif",
    year: "2015",
    description: "Un niño solitario descubre un mundo de monstruos y se convierte en el aprendiz de un guerrero oso.",
    rating: "8.3"
  },
  {
    id: 6,
    title: "Sousou no Frieren",
    slug: "sousou-no-frieren",
    englishTitle: "Frieren: Beyond Journey's End",
    image: "/img/recommended/sosou_no_frieren.avif",
    year: "2023",
    description: "La maga elfa Frieren reflexiona sobre el significado del tiempo tras el fin de su gran aventura.",
    rating: "9.1"
  },
  {
    id: 7,
    title: "Fullmetal Alchemist: B",
    slug: "fullmetal-alchemist-brotherhood",
    englishTitle: "Brotherhood",
    image: "/img/recommended/fullmetal_alchemist.avif",
    year: "2009",
    description: "Dos hermanos buscan la piedra filosofal para restaurar sus cuerpos tras un fallido experimento.",
    rating: "9.1"
  },
  {
    id: 8,
    title: "Neon Genesis Evangelion",
    slug: "neon-genesis-evangelion",
    englishTitle: "Evangelion",
    image: "/img/recommended/neon_genesis_evangelion.avif",
    year: "1995",
    description: "Jóvenes pilotos deben manejar mechas gigantes para salvar a la humanidad de ángeles invasores.",
    rating: "8.7"
  },
  {
    id: 9,
    title: "Shingeki no Kyojin",
    slug: "shingeki-no-kyojin",
    englishTitle: "Attack on Titan",
    image: "/img/recommended/shingeki_no_kyojin.avif",
    year: "2013",
    description: "La lucha desesperada de la humanidad contra gigantes devoradores de hombres tras muros colosales.",
    rating: "9.0"
  },
  {
    id: 10,
    title: "Toki wo Kakeru Shojo",
    slug: "toki-wo-kakeru-shojo",
    englishTitle: "The Girl Who Leapt Through Time",
    image: "/img/recommended/toki_wo_kakeru_shojo.avif",
    year: "2006",
    description: "Una estudiante descubre que puede saltar en el tiempo y empieza a usarlo para resolver su vida.",
    rating: "8.1"
  },
  {
    id: 11,
    title: "Youjo Senki",
    slug: "youjo-senki",
    englishTitle: "Saga of Tanya the Evil",
    image: "/img/recommended/youjo_senki.avif",
    year: "2017",
    description: "Un asalariado renace como una niña soldado en una versión alternativa y mágica de la Primera Guerra Mundial.",
    rating: "8.0"
  },
  {
    id: 12,
    title: "Violet Evergarden",
    slug: "violet-evergarden",
    englishTitle: "Violet Evergarden",
    image: "/img/recommended/violet_evergarden.avif",
    year: "2018",
    description: "Una ex-soldado se convierte en una Escritora de Auto-Memorias para entender las últimas palabras de su mentor.",
    rating: "8.9"
  }
];

interface CarouselState {
  currentIndex: number;
  itemsPerView: number;
  isTransitioning: boolean;
}

type CarouselAction =
  | { type: 'SET_ITEMS_PER_VIEW'; payload: number }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'JUMP_TO'; payload: number }
  | { type: 'FINISH_TRANSITION'; payload: number };

const carouselReducer = (state: CarouselState, action: CarouselAction): CarouselState => {
  switch (action.type) {
    case 'SET_ITEMS_PER_VIEW':
      return { ...state, itemsPerView: action.payload };
    case 'NEXT':
      return { ...state, currentIndex: state.currentIndex + 1, isTransitioning: true };
    case 'PREV':
      return { ...state, currentIndex: state.currentIndex - 1, isTransitioning: true };
    case 'JUMP_TO':
      return { ...state, currentIndex: action.payload, isTransitioning: true };
    case 'FINISH_TRANSITION':
      return { ...state, currentIndex: action.payload, isTransitioning: false };
    default:
      return state;
  }
};

export default function RecommendedCarousel() {
  const [state, dispatch] = useReducer(carouselReducer, {
    currentIndex: recommendedAnimes.length,
    itemsPerView: 4,
    isTransitioning: true,
  });
  
  const { currentIndex, itemsPerView, isTransitioning } = state;

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const router = useRouter();

  // Extend table to allow for infinite looping
  const extendedAnimes = [
    ...recommendedAnimes.map(a => ({ ...a, uniqueKey: `prev-${a.id}` })),
    ...recommendedAnimes.map(a => ({ ...a, uniqueKey: `curr-${a.id}` })),
    ...recommendedAnimes.map(a => ({ ...a, uniqueKey: `next-${a.id}` }))
  ];

  useEffect(() => {
    const handleResize = () => {
      let nextItems = 4;
      if (window.innerWidth < 640) nextItems = 2;
      else if (window.innerWidth < 1024) nextItems = 2;
      else if (window.innerWidth < 1280) nextItems = 3;
      dispatch({ type: 'SET_ITEMS_PER_VIEW', payload: nextItems });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-advance logic
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      dispatch({ type: 'NEXT' });
    }, 3000);
  };

  const resetTimer = () => {
    startTimer();
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const nextSlide = () => {
    dispatch({ type: 'NEXT' });
    resetTimer();
  };

  const prevSlide = () => {
    dispatch({ type: 'PREV' });
    resetTimer();
  };

  const onDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      nextSlide();
    } else if (info.offset.x > swipeThreshold) {
      prevSlide();
    }
  };

  // Track pointer down position for drag vs tap detection
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  // Navigate only if the pointer didn't move much (it was a tap, not a drag)
  const handleCardClick = (e: React.MouseEvent, slug: string) => {
    if (dragStartRef.current) {
      const dx = Math.abs(e.clientX - dragStartRef.current.x);
      const dy = Math.abs(e.clientY - dragStartRef.current.y);
      if (dx > 8 || dy > 8) {
        e.preventDefault();
        return;
      }
    }
    // Allow normal Link navigation for taps
  };

  const handleAnimationComplete = () => {
    // Reposition silently when reaching clones
    if (currentIndex >= recommendedAnimes.length * 2) {
      dispatch({ type: 'FINISH_TRANSITION', payload: currentIndex - recommendedAnimes.length });
    } else if (currentIndex < recommendedAnimes.length) {
      dispatch({ type: 'FINISH_TRANSITION', payload: currentIndex + recommendedAnimes.length });
    }
  };

  // Synchronized dot index
  const dotIndex = currentIndex % recommendedAnimes.length;

  return (
    <div className="py-12 px-4 md:px-12 bg-gradient-to-b from-transparent to-[#141414]">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl md:text-5xl font-semibold text-white flex items-center gap-4">
            <span className="w-2 h-10 md:h-12 bg-red-600 rounded-full"></span>
            Recomendaciones
          </h2>
          <p className="text-zinc-400 text-base md:text-lg mt-3 ml-6 font-medium">Selección de algunas obras maestras</p>
        </div>
        
        <div className="hidden md:flex gap-3 shrink-0">
          <button 
            onClick={prevSlide}
            className="p-3 bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full transition-all border border-zinc-700/50 backdrop-blur-sm shadow-xl active:scale-95"
            aria-label="Anime anterior"
          >
            <ChevronLeft className="size-7" />
          </button>
          <button 
            onClick={nextSlide}
            className="p-3 bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full transition-all border border-zinc-700/50 backdrop-blur-sm shadow-xl active:scale-95"
            aria-label="Siguiente anime"
          >
            <ChevronRight className="size-7" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden group touch-pan-y" ref={containerRef}>
        <m.div 
          className="flex gap-3 md:gap-6 cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={containerRef}
          dragElastic={0.1}
          dragMomentum={false}
          onDragEnd={onDragEnd}
          animate={{ x: `-${(currentIndex * 100) / itemsPerView}%` }}
          onAnimationComplete={handleAnimationComplete}
          transition={isTransitioning ? { type: 'spring', damping: 35, stiffness: 200, mass: 0.8 } : { duration: 0 }}
        >
          {extendedAnimes.map((anime) => (
            <Link 
              key={anime.uniqueKey}
              href={`/anime/${anime.slug}`}
              className="flex-shrink-0 select-none pb-4 block touch-manipulation"
              style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * (itemsPerView > 2 ? 1.5 : 0.75)}rem / ${itemsPerView})` }}
              draggable="false"
              onPointerDown={handlePointerDown}
              onClick={(e) => handleCardClick(e, anime.slug)}
            >
              <div className="group/card relative aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 md:hover:scale-[1.03] md:hover:shadow-red-600/30 bg-zinc-900 border border-white/5 h-full">
                <Image 
                  src={anime.image} 
                  alt={anime.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  className="object-cover transition-transform duration-1000 group-hover/card:scale-110 pointer-events-none"
                  draggable="false"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90 group-hover/card:opacity-100 transition-opacity"></div>
                
                {/* Top Badge */}
                <div className="absolute top-5 left-5 z-10">
                  <div className="bg-red-600/95 backdrop-blur-md text-white text-[10px] md:text-xs font-semibold px-2 py-1 md:px-3 md:py-1.5 rounded-lg flex items-center gap-1 md:gap-1.5 shadow-2xl">
                    <Star className="size-3.5 fill-current" />
                    {anime.rating}
                  </div>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 z-20 translate-y-0 md:translate-y-6 group-hover/card:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3 text-zinc-300 text-[10px] md:text-xs font-semibold uppercase tracking-widest bg-white/5 w-fit px-2 py-1 md:px-3 rounded-full border border-white/10">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-3" />
                      {anime.year}
                    </span>
                    <span className="size-1 bg-zinc-500 rounded-full"></span>
                    <span>4K</span>
                  </div>
                  
                  <h3 className="text-lg md:text-3xl font-semibold text-white mb-2 md:mb-3 line-clamp-1 group-hover/card:text-red-500 transition-colors drop-shadow-lg">
                    {anime.title}
                  </h3>
                  
                  <p className="text-zinc-400 text-xs md:text-base line-clamp-2 opacity-100 md:opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 delay-100 leading-relaxed hidden sm:block">
                    {anime.description}
                  </p>
                  
                  <div className="mt-4 md:mt-8 w-full bg-white text-black text-xs md:text-base font-semibold py-3 md:py-4 rounded-xl opacity-100 md:opacity-0 group-hover/card:opacity-100 transition-all duration-500 translate-y-0 md:translate-y-4 group-hover/card:translate-y-0 hover:bg-neutral-200 shadow-2xl flex items-center justify-center gap-2">
                    VER AHORA
                    <ChevronRight className="size-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </m.div>
      </div>

      {/* Position Indicators (Individuals) - Fixed at 12 dots */}
      <div className="flex justify-center gap-2 mt-12 flex-wrap max-w-full">
        {recommendedAnimes.map((anime, i) => (
          <button
            key={`dot-${anime.id}`}
            onClick={() => {
              dispatch({ type: 'JUMP_TO', payload: recommendedAnimes.length + i });
              resetTimer();
            }}
            className={`h-2 rounded-full transition-all duration-500 ${
              dotIndex === i 
                ? 'w-10 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
                : 'w-2 bg-zinc-800 hover:bg-zinc-600'
            }`}
            aria-label={`Ir al anime ${anime.title}`}
          />
        ))}
      </div>
    </div>
  );
}
