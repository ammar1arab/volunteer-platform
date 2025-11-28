'use client';

import { useState, useEffect } from 'react';

import { featuredPrintsMock } from '@/infrastructure';
import { FeaturedPrintContract } from '@/shared/types';

const useFeaturedPrints = () => {
  const [prints, setPrints] = useState<FeaturedPrintContract[]>([]);
  const [liked, setLiked] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setPrints(featuredPrintsMock);
  }, []);

  const toggleLike = (id: number) => {
    setLiked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getLikesCount = (item: FeaturedPrintContract) =>
    item.likes + (liked[item.id] ? 1 : 0);

  return {
    prints,
    liked,
    toggleLike,
    getLikesCount,
  };
};

export default useFeaturedPrints;
