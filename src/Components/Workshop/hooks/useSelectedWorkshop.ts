import { useState } from 'react';
import type { Workshop } from '../types/workshop';

export function useSelectedWorkshop() {
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);

  const selectWorkshop = (workshop: Workshop) => setSelectedWorkshop(workshop);
  const clearWorkshop = () => setSelectedWorkshop(null);

  return {
    selectedWorkshop,
    selectWorkshop,
    clearWorkshop,
  };
}
