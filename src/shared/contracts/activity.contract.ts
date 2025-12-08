export type ActivityType =
  | 'environmental'
  | 'social'
  | 'educational'
  | 'health'
  | 'other';

export type ActivityStatus =
  | 'open'
  | 'upcoming'
  | 'closed';

export interface ActivityContract {
  id: number;
  title: string;
  category: string;
  type: ActivityType;
  location: string;
  date: string;
  time: string;
  duration: string;
  volunteersNeeded: number;
  status: ActivityStatus;
  image: string;
  description: string;
}
