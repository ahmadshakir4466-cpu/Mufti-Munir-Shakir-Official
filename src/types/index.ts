export interface Article {
  id: string;
  title_en: string;
  title_ur: string;
  slug: string;
  content_en: string;
  content_ur: string;
  featured_image: string;
  created_at: string;
  views?: number;
}

export interface Bayan {
  id: string;
  title_en: string;
  title_ur: string;
  slug: string;
  description_en: string;
  description_ur: string;
  video_url?: string;
  audio_url?: string;
  thumbnail: string;
  created_at: string;
}

export interface Event {
  id: string;
  title_en: string;
  title_ur: string;
  slug: string;
  description_en: string;
  description_ur: string;
  event_date: string;
  location: string;
  banner: string;
  created_at: string;
}

export interface News {
  id: string;
  title_en: string;
  title_ur: string;
  slug: string;
  content_en: string;
  content_ur: string;
  featured_image: string;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title_en: string;
  title_ur: string;
  image_url?: string;
  video_url?: string;
  category: "Images" | "Videos";
  created_at: string;
}
