import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function usePageContent(pageKey: string, defaultEnTitle: string, defaultUrTitle: string, defaultEnContent: string, defaultUrContent: string) {
  const [titleEn, setTitleEn] = useState(defaultEnTitle);
  const [titleUr, setTitleUr] = useState(defaultUrTitle);
  const [contentEn, setContentEn] = useState(defaultEnContent);
  const [contentUr, setContentUr] = useState(defaultUrContent);

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase.from("page_content").select("*").eq("page_name", pageKey).maybeSingle();
      if (data) {
        if (data.title_en) setTitleEn(data.title_en);
        if (data.title_ur) setTitleUr(data.title_ur);
        if (data.content_en) setContentEn(data.content_en);
        if (data.content_ur) setContentUr(data.content_ur);
      }
    };
    fetchContent();

    const channel = supabase.channel(`public:page_content:${pageKey}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'page_content', filter: `page_name=eq.${pageKey}` }, (payload: any) => {
        if (payload.new) {
            if (payload.new.title_en) setTitleEn(payload.new.title_en);
            if (payload.new.title_ur) setTitleUr(payload.new.title_ur);
            if (payload.new.content_en) setContentEn(payload.new.content_en);
            if (payload.new.content_ur) setContentUr(payload.new.content_ur);
        }
      }).subscribe();
      
    return () => {
        supabase.removeChannel(channel);
    };
  }, [pageKey]);

  return { titleEn, titleUr, contentEn, contentUr };
}
