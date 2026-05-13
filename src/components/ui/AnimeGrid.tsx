'use client';

import AnimeCard from './AnimeCard';
import { m } from 'framer-motion';

interface AnimeGridProps {
  title: string;
  items: any[];
  isEpisode?: boolean;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export default function AnimeGrid({ title, items, isEpisode = false }: AnimeGridProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="pt-8 pb-4 px-4 md:px-12">
      <h2 className="text-xl md:text-2xl font-semibold text-[#e5e5e5] mb-6 transition duration-200 hover:text-white">
        {title}
      </h2>

      <m.div
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {items.map((item, id) => {
          const rawSlug = item.slug || '';
          const parsedSlug =
            isEpisode && item.number
              ? rawSlug.replace(new RegExp(`-${item.number}$`), '')
              : rawSlug;
          return (
            <m.div key={`${rawSlug}-${id}`} variants={itemVariants}>
              <AnimeCard
                slug={parsedSlug}
                title={item.title || 'No Title'}
                cover={item.cover}
                type={item.type}
                episodeNumber={isEpisode ? item.number : undefined}
              />
            </m.div>
          );
        })}
      </m.div>
    </section>
  );
}
