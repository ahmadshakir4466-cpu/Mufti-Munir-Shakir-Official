import { useState, useEffect, FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import { Plus, Edit, Trash, X } from "lucide-react";
import TextFormattingToolbar from "../../components/admin/TextFormattingToolbar";

export default function AdminHadith() {
  const [hadithEntries, setHadithEntries] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [titleEn, setTitleEn] = useState<string>("");
  const [titleUr, setTitleUr] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  
  const [arabic, setArabic] = useState<string>("");
  const [translationEn, setTranslationEn] = useState<string>("");
  const [translationUr, setTranslationUr] = useState<string>("");
  const [tafseerEn, setTafseerEn] = useState<string>("");
  const [tafseerUr, setTafseerUr] = useState<string>("");

  useEffect(() => {
    if (isEditing && currentEntry) {
      setTitleEn(currentEntry.title_en || "");
      setTitleUr(currentEntry.title_ur || "");
      setReference(currentEntry.reference || "");
      
      try {
        const parsed = JSON.parse(currentEntry.content_en);
        if (parsed && parsed.type === "hadith_rich_data") {
            setArabic(parsed.arabic || "");
            setTranslationEn(parsed.translation_en || "");
            setTranslationUr(parsed.translation_ur || "");
            setTafseerEn(parsed.tafseer_en || "");
            setTafseerUr(parsed.tafseer_ur || "");
        } else {
            setArabic("");
            setTranslationEn(currentEntry.content_en || "");
            setTranslationUr(currentEntry.content_ur || "");
            setTafseerEn("");
            setTafseerUr("");
        }
      } catch (e) {
        setArabic("");
        setTranslationEn(currentEntry?.content_en || "");
        setTranslationUr(currentEntry?.content_ur || "");
        setTafseerEn("");
        setTafseerUr("");
      }
    } else {
      setTitleEn("");
      setTitleUr("");
      setReference("");
      setArabic("");
      setTranslationEn("");
      setTranslationUr("");
      setTafseerEn("");
      setTafseerUr("");
    }
  }, [currentEntry, isEditing]);

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("hadith")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setHadithEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();

    const channel = supabase.channel('hadith-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hadith' }, () => {
        fetchEntries();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      title_en: titleEn,
      title_ur: titleUr,
      reference: reference,
      content_en: JSON.stringify({
        type: "hadith_rich_data",
        arabic,
        translation_en: translationEn,
        translation_ur: translationUr,
        tafseer_en: tafseerEn,
        tafseer_ur: tafseerUr,
      }),
      content_ur: "",
    };

    if (currentEntry?.id) {
      const { error } = await supabase.from("hadith").update(payload).eq("id", currentEntry.id);
      if (error) alert("Error updating: " + error.message);
    } else {
      const { error } = await supabase.from("hadith").insert(payload);
      if (error) alert("Error creating: " + error.message);
    }
    
    setIsEditing(false);
    fetchEntries();
  };

  const handleDelete = async (id: string|null) => {
    if (!id) return;
    const { error } = await supabase.from("hadith").delete().eq("id", id);
    if (error) {
      console.error("Error deleting:", error.message);
    } else {
      fetchEntries();
    }
    setDeleteTargetId(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Hadith Section</h1>
        <button
          onClick={() => {
            setCurrentEntry(null);
            setIsEditing(true);
          }}
          className="bg-primary-800 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-900 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add Hadith
        </button>
      </div>

      {isEditing && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8 relative">
          <button 
            onClick={() => setIsEditing(false)}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
          <h2 className="text-xl font-bold text-gray-800 mb-6">{currentEntry ? "Edit Hadith" : "Add New Hadith"}</h2>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Topic / Title (English)</label>
                <TextFormattingToolbar 
                  textareaId="hadith_title_en" 
                  value={titleEn} 
                  onChange={setTitleEn} 
                  lang="en" 
                />
                <textarea 
                  id="hadith_title_en"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  required 
                  rows={1}
                  className="w-full border-b border-x border-gray-300 rounded-b-md p-3 focus:ring-2 focus:ring-primary-500 outline-none text-sm font-medium" 
                  placeholder="Enter topic in english..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-right font-urdu" dir="rtl">موضوع (Urdu)</label>
                <TextFormattingToolbar 
                  textareaId="hadith_title_ur" 
                  value={titleUr} 
                  onChange={setTitleUr} 
                  lang="ur" 
                />
                <textarea 
                  id="hadith_title_ur"
                  value={titleUr}
                  onChange={(e) => setTitleUr(e.target.value)}
                  required 
                  rows={1}
                  className="w-full border-b border-x border-gray-300 rounded-b-md p-3 focus:ring-2 focus:ring-primary-500 outline-none font-urdu text-right text-sm" 
                  dir="rtl"
                  placeholder="موضوع درج کریں..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reference Source (e.g., Sahih Bukhari, Muslim)</label>
              <input 
                name="reference" 
                value={reference} 
                onChange={(e) => setReference(e.target.value)} 
                required 
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary-500 outline-none" 
              />
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold uppercase text-gray-400 mb-1">Arabic Text (الحديث)</label>
                <textarea
                  value={arabic}
                  onChange={(e) => setArabic(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md p-3 text-right font-semibold text-lg focus:ring-1 focus:ring-primary-500 outline-none"
                  placeholder="مكتوبة بالتشكيل..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">English Translation</label>
                   <TextFormattingToolbar 
                     textareaId="translation_en"
                     value={translationEn}
                     onChange={(val) => setTranslationEn(val)}
                     lang="en"
                   />
                   <textarea 
                     id="translation_en"
                     value={translationEn} 
                     onChange={(e) => setTranslationEn(e.target.value)}
                     className="w-full border-b border-x border-gray-300 rounded-b-md p-3 focus:ring-2 focus:ring-primary-500 outline-none" 
                     rows={4}
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2 text-right font-urdu" dir="rtl">اردو ترجمہ</label>
                   <TextFormattingToolbar 
                     textareaId="translation_ur"
                     value={translationUr}
                     onChange={(val) => setTranslationUr(val)}
                     lang="ur"
                   />
                   <textarea 
                     id="translation_ur"
                     value={translationUr} 
                     onChange={(e) => setTranslationUr(e.target.value)}
                     className="w-full border-b border-x border-gray-300 rounded-b-md p-3 focus:ring-2 focus:ring-primary-500 outline-none font-urdu text-right" 
                     rows={4}
                     dir="rtl"
                   />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">English Tafseer</label>
                   <TextFormattingToolbar 
                     textareaId="tafseer_en"
                     value={tafseerEn}
                     onChange={(val) => setTafseerEn(val)}
                     lang="en"
                   />
                   <textarea 
                     id="tafseer_en"
                     value={tafseerEn} 
                     onChange={(e) => setTafseerEn(e.target.value)}
                     className="w-full border-b border-x border-gray-300 rounded-b-md p-3 focus:ring-2 focus:ring-primary-500 outline-none" 
                     rows={4}
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2 text-right font-urdu" dir="rtl">اردو تشریح</label>
                   <TextFormattingToolbar 
                     textareaId="tafseer_ur"
                     value={tafseerUr}
                     onChange={(val) => setTafseerUr(val)}
                     lang="ur"
                   />
                   <textarea 
                     id="tafseer_ur"
                     value={tafseerUr} 
                     onChange={(e) => setTafseerUr(e.target.value)}
                     className="w-full border-b border-x border-gray-300 rounded-b-md p-3 focus:ring-2 focus:ring-primary-500 outline-none font-urdu text-right" 
                     rows={4}
                     dir="rtl"
                   />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
              <button type="submit" className="bg-primary-800 text-white px-6 py-2 rounded-md font-medium hover:bg-primary-900 transition-colors">
                Save Hadith
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : hadithEntries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No Hadith entries found. Click "Add Hadith" to create one.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-medium text-gray-600">Reference</th>
                <th className="p-4 font-medium text-gray-600 w-1/3">Topic (English)</th>
                <th className="p-4 font-medium text-gray-600 w-1/3 text-right">Topic (Urdu)</th>
                <th className="p-4 font-medium text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {hadithEntries.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4 text-gray-500 text-sm font-medium">{item.reference}</td>
                  <td className="p-4 font-medium text-gray-900">{item.title_en}</td>
                  <td className="p-4 font-urdu text-right text-gray-900">{item.title_ur}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => { setCurrentEntry(item); setIsEditing(true); }}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-md transition-colors mr-2"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => setDeleteTargetId(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4 border border-gray-100 transform scale-100 transition-all">
            <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
            <p className="text-sm text-gray-500">Are you sure you want to delete this Hadith entry? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end pt-2">
              <button 
                onClick={() => setDeleteTargetId(null)} 
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(deleteTargetId)} 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
