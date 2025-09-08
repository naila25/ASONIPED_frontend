import { useRef } from 'react';
import type { Workshop } from '../Services/workshop';
import { WorkshopCard } from './WorkshopCard';

interface Props {
  workshops: Workshop[];
  onSelect: (workshop: Workshop) => void;
}

export const WorkshopCarousel = ({ workshops, onSelect }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const scrollAmount = container.offsetWidth * 0.8;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative py-12 bg-gradient-to-b">
      <h2 className="text-3xl font-bold text-center text-orange-600 mb-10">Talleres</h2>

      <div className="relative max-w-7xl mx-auto">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow hover:bg-gray-100"
          aria-label="Anterior"
        >
          ◀
        </button>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth snap-x px-10"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none', 
          }}
        >
          {workshops.map((workshop) => (
            <div
              key={workshop.id}
              className="flex-shrink-0 w-64 snap-start"
            >
              <WorkshopCard workshop={workshop} onSelect={onSelect} />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow hover:bg-gray-100"
          aria-label="Siguiente"
        >
          ▶
        </button>
      </div>
    </div>
  );
};
