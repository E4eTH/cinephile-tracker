export type WatchStatus = 'pending' | 'watching' | 'completed';
export type MediaType = 'movie' | 'series';

export interface MediaItem {
  id: string;
  userId: string;
  tmdbId?: number;
  title: string;
  type: MediaType;
  status: WatchStatus;
  rating?: number;
  imageUrl?: string;
  comment?: string;
  season?: number;
  episode?: number;
  createdAt: number;
}
