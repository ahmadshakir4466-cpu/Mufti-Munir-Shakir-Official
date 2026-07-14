-- SUPABASE SQL DATABASE SCHEMA & POLICY SETUP SCRIPT
-- Run this script in the Supabase Dashboard -> SQL Editor to set up all tables and permissions.
-- This script grants full administrative permissions to the admin user: 28501153-8038-4e13-86cc-8b400a1b92c7

-- ===================================================
-- 1. Create page_content Table
-- ===================================================
CREATE TABLE IF NOT EXISTS public.page_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    page_name TEXT UNIQUE NOT NULL,
    title_en TEXT,
    title_ur TEXT,
    content_en TEXT,
    content_ur TEXT
);

-- Enable RLS
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on page_content
DROP POLICY IF EXISTS "Allow public read-access to page_content" ON public.page_content;
DROP POLICY IF EXISTS "Allow all actions for authenticated users on page_content" ON public.page_content;
DROP POLICY IF EXISTS "Admin full access to page_content" ON public.page_content;

-- Create Policies
CREATE POLICY "Allow public read-access to page_content" ON public.page_content 
    FOR SELECT USING (true);

CREATE POLICY "Admin full access to page_content" ON public.page_content 
    FOR ALL USING (auth.uid() = '28501153-8038-4e13-86cc-8b400a1b92c7');


-- ===================================================
-- 2. Create articles Table
-- ===================================================
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title_en TEXT NOT NULL,
    title_ur TEXT,
    slug TEXT UNIQUE NOT NULL,
    content_en TEXT,
    content_ur TEXT,
    featured_image TEXT,
    views INTEGER DEFAULT 0 NOT NULL
);

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on articles
DROP POLICY IF EXISTS "Allow public read-access to articles" ON public.articles;
DROP POLICY IF EXISTS "Allow all actions for authenticated users on articles" ON public.articles;
DROP POLICY IF EXISTS "Admin full access to articles" ON public.articles;

-- Create Policies
CREATE POLICY "Allow public read-access to articles" ON public.articles 
    FOR SELECT USING (true);

CREATE POLICY "Admin full access to articles" ON public.articles 
    FOR ALL USING (auth.uid() = '28501153-8038-4e13-86cc-8b400a1b92c7');


-- ===================================================
-- 3. Create playlists Table
-- ===================================================
CREATE TABLE IF NOT EXISTS public.playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title_en TEXT NOT NULL,
    title_ur TEXT,
    slug TEXT UNIQUE NOT NULL,
    description_en TEXT,
    description_ur TEXT,
    thumbnail TEXT,
    sort_order INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on playlists
DROP POLICY IF EXISTS "Allow public read-access to playlists" ON public.playlists;
DROP POLICY IF EXISTS "Allow all actions for authenticated users on playlists" ON public.playlists;
DROP POLICY IF EXISTS "Admin full access to playlists" ON public.playlists;

-- Create Policies
CREATE POLICY "Allow public read-access to playlists" ON public.playlists 
    FOR SELECT USING (true);

CREATE POLICY "Admin full access to playlists" ON public.playlists 
    FOR ALL USING (auth.uid() = '28501153-8038-4e13-86cc-8b400a1b92c7');


-- ===================================================
-- 4. Create bayan (Videos) Table
-- ===================================================
CREATE TABLE IF NOT EXISTS public.bayan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
    title_en TEXT NOT NULL,
    title_ur TEXT,
    slug TEXT UNIQUE NOT NULL,
    description_en TEXT,
    description_ur TEXT,
    video_url TEXT NOT NULL,
    thumbnail TEXT,
    published BOOLEAN DEFAULT false NOT NULL,
    sort_order INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.bayan ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on bayan
DROP POLICY IF EXISTS "Allow public read-access to bayan" ON public.bayan;
DROP POLICY IF EXISTS "Allow all actions for authenticated users on bayan" ON public.bayan;
DROP POLICY IF EXISTS "Admin full access to bayan" ON public.bayan;

-- Create Policies
CREATE POLICY "Allow public read-access to bayan" ON public.bayan 
    FOR SELECT USING (true);

CREATE POLICY "Admin full access to bayan" ON public.bayan 
    FOR ALL USING (auth.uid() = '28501153-8038-4e13-86cc-8b400a1b92c7');


-- ===================================================
-- 5. Create contact_messages Table
-- ===================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT,
    email TEXT,
    subject TEXT,
    message TEXT
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on contact_messages
DROP POLICY IF EXISTS "Allow anonymous insertions to contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow authenticated reads to contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow authenticated deletes to contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admin full access to contact_messages" ON public.contact_messages;

-- Create Policies
CREATE POLICY "Allow anonymous insertions to contact_messages" ON public.contact_messages 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin full access to contact_messages" ON public.contact_messages 
    FOR ALL USING (auth.uid() = '28501153-8038-4e13-86cc-8b400a1b92c7');


-- ===================================================
-- 6. Create quran Table
-- ===================================================
CREATE TABLE IF NOT EXISTS public.quran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title_en TEXT NOT NULL,
    title_ur TEXT,
    audio_url TEXT,
    description_ur TEXT,
    description_en TEXT
);

-- Enable RLS
ALTER TABLE public.quran ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on quran
DROP POLICY IF EXISTS "Allow public read-access to quran" ON public.quran;
DROP POLICY IF EXISTS "Allow all actions for authenticated users on quran" ON public.quran;
DROP POLICY IF EXISTS "Admin full access to quran" ON public.quran;

-- Create Policies
CREATE POLICY "Allow public read-access to quran" ON public.quran 
    FOR SELECT USING (true);

CREATE POLICY "Admin full access to quran" ON public.quran 
    FOR ALL USING (auth.uid() = '28501153-8038-4e13-86cc-8b400a1b92c7');


-- ===================================================
-- 7. Create hadith Table
-- ===================================================
CREATE TABLE IF NOT EXISTS public.hadith (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title_en TEXT NOT NULL,
    title_ur TEXT,
    reference TEXT NOT NULL,
    content_en TEXT,
    content_ur TEXT
);

-- Enable RLS
ALTER TABLE public.hadith ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on hadith
DROP POLICY IF EXISTS "Allow public read-access to hadith" ON public.hadith;
DROP POLICY IF EXISTS "Allow all actions for authenticated users on hadith" ON public.hadith;
DROP POLICY IF EXISTS "Admin full access to hadith" ON public.hadith;

-- Create Policies
CREATE POLICY "Allow public read-access to hadith" ON public.hadith 
    FOR SELECT USING (true);

CREATE POLICY "Admin full access to hadith" ON public.hadith 
    FOR ALL USING (auth.uid() = '28501153-8038-4e13-86cc-8b400a1b92c7');


-- ===================================================
-- 8. Storage Bucket Policies (for 'images' bucket)
-- ===================================================

-- Ensure the 'images' storage bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('images', 'images', true, 524288000)
ON CONFLICT (id) DO UPDATE 
SET public = true, file_size_limit = 524288000;

-- Enable RLS on storage.objects if not already enabled (by default it is enabled in newer Supabase)
-- We will write policies directly targeting storage.objects for the 'images' bucket

-- Drop existing storage policies for 'images'
DROP POLICY IF EXISTS "Give admin full access to images" ON storage.objects;
DROP POLICY IF EXISTS "Give public read access to images" ON storage.objects;

-- Create policies for storage.objects
CREATE POLICY "Give public read access to images" ON storage.objects
    FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Give admin full access to images" ON storage.objects
    FOR ALL USING (bucket_id = 'images' AND auth.uid() = '28501153-8038-4e13-86cc-8b400a1b92c7');
