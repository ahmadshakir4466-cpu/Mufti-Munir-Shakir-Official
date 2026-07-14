import { useState, useEffect, FormEvent } from "react";
import { supabase } from "../../lib/supabase";

interface EditorProps {
  pageKey: string;
  pageTitle: string;
  defaultEnTitle?: string;
  defaultUrTitle?: string;
  defaultEnContent?: string;
  defaultUrContent?: string;
}

export default function PageContentEditor({ pageKey, pageTitle, defaultEnTitle = "", defaultUrTitle = "", defaultEnContent = "", defaultUrContent = "" }: EditorProps) {
  const [titleEn, setTitleEn] = useState(defaultEnTitle);
  const [titleUr, setTitleUr] = useState(defaultUrTitle);
  const [contentEn, setContentEn] = useState(defaultEnContent);
  const [contentUr, setContentUr] = useState(defaultUrContent);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase.from("page_content").select("*").eq("page_name", pageKey).maybeSingle();
      if (data) {
        setTitleEn(data.title_en || "");
        setTitleUr(data.title_ur || "");
        setContentEn(data.content_en || "");
        setContentUr(data.content_ur || "");
      }
    };
    fetchContent();

    const channel = supabase.channel(`page_content_${pageKey}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'page_content', filter: `page_name=eq.${pageKey}` }, (payload: any) => {
        if (payload.new) {
            setTitleEn(payload.new.title_en || "");
            setTitleUr(payload.new.title_ur || "");
            setContentEn(payload.new.content_en || "");
            setContentUr(payload.new.content_ur || "");
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pageKey]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: "", msg: "" });

    try {
      const payload = {
        page_name: pageKey,
        title_en: titleEn,
        title_ur: titleUr,
        content_en: contentEn,
        content_ur: contentUr,
      };

      const { error } = await supabase.from("page_content").upsert(payload, { onConflict: "page_name" });
      
      if (error) {
        throw error;
      }
      setStatus({ type: "success", msg: "Content saved successfully." });
      setTimeout(() => setStatus({ type: "", msg: "" }), 3000);
    } catch (err: any) {
      console.error(err);
      setStatus({ type: "error", msg: "Failed to save. Make sure the 'page_content' table exists." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-4xl">
      <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Edit Content: {pageTitle}</h2>
      
      <form onSubmit={handleSave} className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Heading / Title (English)</label>
               <input 
                 value={titleEn} onChange={(e) => setTitleEn(e.target.value)} 
                 className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary-500 outline-none" 
                 placeholder="Enter title..." 
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2 text-right">Heading / Title (Urdu)</label>
               <input 
                 value={titleUr} onChange={(e) => setTitleUr(e.target.value)} 
                 className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary-500 outline-none" 
                 placeholder="عنوان درج کریں..." 
                 dir="rtl" 
               />
            </div>
         </div>
         <div className="grid grid-cols-1 gap-6">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Main Content (English)</label>
               <textarea 
                 value={contentEn} onChange={(e) => setContentEn(e.target.value)} 
                 className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary-500 outline-none" 
                 rows={6} placeholder="Enter English content here..." 
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2 text-right">Main Content (Urdu)</label>
               <textarea 
                 value={contentUr} onChange={(e) => setContentUr(e.target.value)} 
                 className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary-500 outline-none font-urdu" 
                 rows={6} placeholder="اردو مواد یہاں درج کریں..." 
                 dir="rtl" 
               />
            </div>
         </div>

         {status.msg && (
           <div className={`p-4 rounded-md font-medium text-sm border ${status.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-green-50 text-green-800 border-green-200'}`}>
             {status.msg}
           </div>
         )}
         
         <button 
           disabled={saving}
           type="submit" 
           className="bg-primary-800 hover:bg-primary-900 disabled:opacity-50 text-white font-medium px-8 py-3 rounded-md transition-colors"
         >
           {saving ? "Saving..." : "Save Content Changes"}
         </button>
      </form>
    </div>
  );
}
