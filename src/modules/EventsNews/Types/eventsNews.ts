export interface EventNewsItem {
  id: number;
  title: string;
  description: string;
  date: string; // ISO string
  imageUrl?: string;
  type?: 'evento' | 'noticia' ;
} 