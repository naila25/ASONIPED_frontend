export interface EventNewsItem {
  id: number;
  title: string;
  description: string;
  date: string; // ISO string
  imageUrl?: string;
  hour?: string; // HH:MM
  type?: 'evento' | 'noticia' ;
} 