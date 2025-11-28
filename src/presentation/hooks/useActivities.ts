import { useEffect, useState } from 'react';
import { activitiesMock } from '@/infrastructure';
import { ActivityContract } from '@/shared/types';

interface UseActivitiesResult {
  activities: ActivityContract[];
  totalPages: number;
  currentPage: number;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
}

const useActivities = (): UseActivitiesResult => {
  const [activities, setActivities] = useState<ActivityContract[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setActivities(activitiesMock);
  }, []);

  const itemsPerPage = isMobile ? 2 : 4;
  const totalPages = Math.ceil(activities.length / itemsPerPage);

  const pagedActivities = activities.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return {
    activities: pagedActivities,
    totalPages,
    currentPage,
    next: () =>
      setCurrentPage((p) => Math.min(p + 1, totalPages - 1)),
    prev: () =>
      setCurrentPage((p) => Math.max(p - 1, 0)),
    goTo: setCurrentPage,
  };
};

export default useActivities;
