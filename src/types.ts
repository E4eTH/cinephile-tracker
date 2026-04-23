export type WatchStatus = 'pending' | 'watching' | 'completed';
export type MediaType = 'movie' | 'series';

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  status: WatchStatus;
  rating?: number;
  imageUrl?: string;
  description?: string;
  season?: number;
  episode?: number;
  createdAt: number;
}
